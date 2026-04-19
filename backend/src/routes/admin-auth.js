import { Router } from "express";
import { z } from "zod";
import { getLogger } from "../lib/logger.js";
import { hashPassword, verifyPassword, generateJWT } from "../lib/auth.js";
import {
  findAdminByEmail,
  createAdmin,
  updateLastLogin,
  listActiveAdmins,
} from "../repositories/admin.repository.js";
import { requireAdminAuth } from "../middleware/auth-protect.js";
import { authLimiter } from "../middleware/security.js";
import {
  requestPasswordReset,
  resetPasswordWithToken,
  sendPasswordResetEmail,
} from "../services/admin-password-reset.service.js";

const router = Router();
const log = getLogger({ module: "admin-auth-routes" });

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const createAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

/**
 * POST /api/admin/auth/login
 * Authenticate admin user with email and password
 * Returns JWT in secure HttpOnly SameSite=Strict cookie
 * Rate limited: 5 attempts per 15 minutes per IP+email
 * 
 * Timing attack prevention: Always perform password verification
 * even if user doesn't exist (constant-time operation)
 */
router.post("/login", authLimiter, async (req, res) => {
  try {
    // Validate request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password } = validation.data;

    // Find admin by email
    const admin = await findAdminByEmail(email);
    
    // Pre-generate dummy hash for timing attack prevention
    const dummyHash = "$2a$12$R9h7cIPz0gi.URNNX3YcpesHS7J0A2Lx6rHdWDYRQpyEPrEXmS0fC";

    // Always verify password (constant-time operation)
    // If admin not found, verify against dummy hash (will fail, but takes same time)
    const hashToVerify = admin?.passwordHash || dummyHash;
    const passwordValid = await verifyPassword(password, hashToVerify);

    if (!admin || !passwordValid) {
      log.warn({ email }, "login_failed");
      // Generic error - don't reveal whether email or password wrong
      return res.status(401).json({
        error: "Invalid email or password.",
        code: "AUTH_INVALID",
      });
    }

    if (!admin.isActive) {
      log.warn({ email }, "login_admin_inactive");
      return res.status(401).json({
        error: "This admin account is inactive.",
        code: "AUTH_INACTIVE",
      });
    }

    // Generate JWT token (24h expiry)
    const token = generateJWT(admin._id.toString(), admin.email);

    // Update last login timestamp
    try {
      await updateLastLogin(admin._id);
    } catch (err) {
      log.error({ err, adminId: admin._id }, "error_updating_last_login");
      // Don't fail login if this fails, it's just for auditing
    }

    // Set secure cookie with JWT
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",  // ✅ Root path so cookie sent to all routes
    });

    log.info({ email }, "admin_login_successful");

    return res.status(200).json({
      message: "Login successful",
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        fullName: admin.fullName,
      },
    });
  } catch (error) {
    log.error({ err: error }, "login_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/admin/auth/logout
 * Clear authentication cookie and invalidate session
 * Requires valid authentication
 */
router.post("/logout", requireAdminAuth, async (req, res) => {
  try {
    const adminId = req.user.id;
    const email = req.user.email;

    // Clear the authentication cookie
    res.clearCookie("adminToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",  // ✅ Match the path used in login
    });

    log.info({ email, adminId }, "admin_logout_successful");

    return res.status(200).json({
      message: "Logout successful",
      // ⚠️ Note: JWT remains valid for 24h if token is obtained by attacker
      // Implement token blacklist for production if needed
    });
  } catch (error) {
    log.error({ err: error }, "logout_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/admin/auth/create
 * Create a new admin user
 * Requires valid authentication (admin must be logged in)
 * Only the first admin can create additional admins (or migrate to role-based system)
 */
router.post("/create", authLimiter, requireAdminAuth, async (req, res) => {
  try {
    // Only allow creating new admins if none exist (first admin creation)
    // or if this is a special setup endpoint
    const existingAdmins = await listActiveAdmins();
    
    if (existingAdmins.length > 1) {
      // ✅ Multiple admins exist - prevent unauthorized creation
      // In future: implement role-based access control
      log.warn({ adminId: req.user.id }, "create_admin_denied_multiple_admins_exist");
      return res.status(403).json({
        error: "You do not have permission to create admins.",
        code: "INSUFFICIENT_ROLE",
      });
    }

    // Validate request body
    const validation = createAdminSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password, fullName } = validation.data;

    // Check if email already exists
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      log.warn({ email }, "create_admin_email_exists");
      return res.status(409).json({
        error: "Email already in use.",
        code: "EMAIL_EXISTS",
      });
    }

    // Hash password before storing
    const passwordHash = await hashPassword(password);

    // Create admin
    const newAdmin = await createAdmin({
      email,
      passwordHash,
      fullName,
    });

    log.info({ email, createdBy: req.user.email }, "admin_created");

    return res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        fullName,
      },
    });
  } catch (error) {
    log.error({ err: error }, "create_admin_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * GET /api/admin/auth/me
 * Get current authenticated admin's information
 * Requires valid authentication
 */
router.get("/me", requireAdminAuth, async (req, res) => {
  try {
    return res.status(200).json({
      admin: {
        id: req.user.id,
        email: req.user.email,
        type: req.user.type,
      },
    });
  } catch (error) {
    log.error({ err: error }, "get_me_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * GET /api/admin/auth/verify
 * Lightweight endpoint to verify authentication status
 * Returns user info without accessing other resources
 * Response time: < 10ms (no database queries)
 * Useful for frontend to check if user is still authenticated
 */
router.get("/verify", requireAdminAuth, (req, res) => {
  try {
    return res.status(200).json({
      isAuthenticated: true,
      admin: {
        id: req.user.id,
        email: req.user.email,
        type: req.user.type,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    log.error({ err: error }, "verify_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/admin/auth/request-reset
 * Request a password reset for an admin email
 * Rate limited to prevent abuse
 * Returns success message regardless of whether email exists (security)
 * 
 * Body: { email: string }
 */
router.post("/request-reset", authLimiter, async (req, res) => {
  try {
    const emailSchema = z.object({
      email: z.string().email("Invalid email address"),
    });

    const validation = emailSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email } = validation.data;

    // Request password reset
    const resetData = await requestPasswordReset(email);

    // Always return success (don't reveal email existence)
    if (resetData) {
      // Send reset email with token
      try {
        await sendPasswordResetEmail(resetData.email, resetData.token);
      } catch (err) {
        log.error({ err, email }, "error_sending_reset_email");
        // Don't fail the request if email send fails
      }
    }

    log.info({ email }, "password_reset_requested");

    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
      expiresIn: 1800, // 30 minutes in seconds
    });
  } catch (error) {
    log.error({ err: error }, "request_reset_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/admin/auth/reset-password
 * Reset password using a valid reset token
 * Rate limited to prevent brute force attempts
 * 
 * Body: { token: string, password: string }
 */
router.post("/reset-password", authLimiter, async (req, res) => {
  try {
    const resetSchema = z.object({
      token: z.string().min(32, "Invalid reset token"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    });

    const validation = resetSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { token, password } = validation.data;

    // Reset password with token
    const result = await resetPasswordWithToken(token, password);

    if (!result) {
      log.warn({ token: token.slice(0, 8) }, "invalid_reset_token_provided");
      return res.status(401).json({
        error: "Invalid or expired reset token.",
        code: "INVALID_RESET_TOKEN",
      });
    }

    log.info({ email: result.email }, "admin_password_reset_successful");

    return res.status(200).json({
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error) {
    log.error({ err: error }, "reset_password_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

/**
 * POST /api/admin/auth/signup
 * Create a new admin user (first admin only)
 * Rate limited and requires valid email
 * 
 * Note: Only the first admin can sign up this way.
 * Additional admins must be created by existing admin via /create endpoint.
 * 
 * Body: { email: string, password: string, fullName: string }
 */
router.post("/signup", authLimiter, async (req, res) => {
  try {
    const signupSchema = z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      fullName: z.string().min(2, "Full name must be at least 2 characters").max(200),
    });

    const validation = signupSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { email, password, fullName } = validation.data;

    // Check if any admins exist
    const existingAdmins = await listActiveAdmins();

    if (existingAdmins.length > 0) {
      // Only the first admin can sign up
      log.warn({ email }, "signup_attempted_when_admin_exists");
      return res.status(403).json({
        error: "Admin signup is only available for initial setup.",
        code: "ADMIN_ALREADY_EXISTS",
      });
    }

    // Check if email already exists
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      log.warn({ email }, "signup_email_already_exists");
      return res.status(409).json({
        error: "Email already in use.",
        code: "EMAIL_EXISTS",
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create the first admin
    const newAdmin = await createAdmin({
      email,
      passwordHash,
      fullName,
    });

    // Set secure cookie with JWT for immediate login
    const token = generateJWT(newAdmin.id, email);
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: "/",
    });

    log.info({ email }, "first_admin_signup_successful");

    return res.status(201).json({
      message: "Admin account created and logged in successfully",
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
      },
    });
  } catch (error) {
    log.error({ err: error }, "signup_endpoint_error");
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    });
  }
});

export default router;
