import { verifyJWT } from "../lib/auth.js";
import { isTokenRevoked } from "../lib/token-revocation.js";
import { getLogger } from "../lib/logger.js";

const log = getLogger({ module: "auth-middleware" });

/**
 * Middleware to protect admin routes
 * Verifies JWT token from secure cookie and attaches user to req.user
 * ✅ Also checks token revocation status
 * 
 * Usage: app.post('/api/admin/action', requireAdminAuth, handler)
 */
export async function requireAdminAuth(req, res, next) {
  try {
    // Get JWT from cookies (set by login endpoint)
    const token = req.cookies?.adminToken;

    if (!token) {
      log.warn({ path: req.path }, "auth_token_missing");
      return res.status(401).json({
        error: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    // Verify JWT signature and payload
    const payload = verifyJWT(token);

    if (!payload) {
      log.warn({ path: req.path }, "auth_token_invalid");
      return res.status(401).json({
        error: "Invalid or expired token.",
        code: "AUTH_INVALID",
      });
    }

    // ✅ Check if token has been revoked (new feature)
    const isRevoked = await isTokenRevoked(token);
    if (isRevoked) {
      log.warn({ userId: payload.sub }, "auth_token_revoked");
      return res.status(401).json({
        error: "Token has been revoked. Please log in again.",
        code: "AUTH_REVOKED",
      });
    }

    // Attach user info to request for downstream handlers
    req.user = {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
    };

    log.debug({ userId: payload.sub }, "auth_verified");
    next();
  } catch (err) {
    log.error({ err }, "auth_verification_error");
    return res.status(401).json({
      error: "Authentication failed.",
      code: "AUTH_ERROR",
    });
  }
}

/**
 * Optional authentication middleware
 * Attempts to verify token but doesn't fail if missing/invalid
 * Useful for endpoints that support both public and authenticated access
 */
export function optionalAdminAuth(req, res, next) {
  try {
    const token = req.cookies?.adminToken;

    if (token) {
      const payload = verifyJWT(token);
      if (payload) {
        req.user = {
          id: payload.sub,
          email: payload.email,
          type: payload.type,
        };
        log.debug({ userId: payload.sub }, "optional_auth_verified");
      }
    }
  } catch (err) {
    // Silently ignore auth errors for optional routes
    log.debug({ err: err.message }, "optional_auth_skipped");
  }

  next();
}

/**
 * Verify admin has specific role or permission
 * Can be used to implement role-based access control
 */
export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (req.user.type !== requiredRole) {
      log.warn(
        { userId: req.user.id, required: requiredRole, actual: req.user.type },
        "insufficient_role"
      );
      return res.status(403).json({
        error: "Insufficient permissions.",
        code: "INSUFFICIENT_ROLE",
      });
    }

    next();
  };
}
