import crypto from "crypto";
import { getLogger } from "../lib/logger.js";
import { env } from "../config/env.js";
import {
  findAdminByEmail,
  storePasswordResetToken,
  verifyPasswordResetToken,
  consumePasswordResetToken,
  updateAdminPassword,
} from "../repositories/admin.repository.js";
import { hashPassword } from "../lib/auth.js";

const log = getLogger({ module: "admin-password-reset" });

/**
 * Generate a secure reset token
 * @returns {string}
 */
export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Request a password reset for an admin email
 * Returns a reset token to be sent via email
 * In production, this would send an email with the reset link
 * 
 * @param {string} email - Admin email
 * @returns {Promise<{token: string, email: string} | null>}
 */
export async function requestPasswordReset(email) {
  try {
    // Find admin by email
    const admin = await findAdminByEmail(email);

    if (!admin) {
      // Don't reveal whether email exists (security best practice)
      log.warn({ email }, "password_reset_requested_for_nonexistent_email");
      return null;
    }

    if (!admin.isActive) {
      log.warn({ email }, "password_reset_requested_for_inactive_admin");
      return null;
    }

    // Generate reset token (valid for 30 minutes)
    const resetToken = generateResetToken();
    await storePasswordResetToken(admin._id.toString(), resetToken, 30);

    log.info({ adminId: admin._id, email }, "password_reset_token_generated");

    return {
      token: resetToken,
      email: admin.email,
      expiresIn: 30 * 60, // 30 minutes in seconds
    };
  } catch (error) {
    log.error({ err: error, email }, "error_requesting_password_reset");
    throw error;
  }
}

/**
 * Reset password using a valid reset token
 * 
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<{email: string} | null>}
 */
export async function resetPasswordWithToken(token, newPassword) {
  try {
    // Verify token and get admin
    const resetData = await verifyPasswordResetToken(token);

    if (!resetData) {
      log.warn({ token: token.slice(0, 8) }, "invalid_or_expired_reset_token");
      return null;
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update admin password and clear reset tokens
    await updateAdminPassword(resetData.adminId, passwordHash);

    // Consume the token (mark as used)
    await consumePasswordResetToken(token);

    log.info({ adminId: resetData.adminId }, "password_reset_successful");

    return {
      email: resetData.email,
      message: "Password reset successful",
    };
  } catch (error) {
    log.error({ err: error }, "error_resetting_password");
    throw error;
  }
}

/**
 * Send password reset email (stub for production)
 * In production, integrate with email service (Resend, SendGrid, etc.)
 * 
 * @param {string} email - Admin email
 * @param {string} resetToken - Reset token
 * @returns {Promise<void>}
 */
export async function sendPasswordResetEmail(email, resetToken) {
  try {
    // Build reset link
    // In production: FRONTEND_URL from env config
    const resetUrl = `${env.frontendUrl || "http://localhost:5173"}/admin/reset-password?token=${resetToken}`;

    if (env.isProduction && env.resendApiKey) {
      // TODO: Integrate with actual email service (Resend, etc.)
      // await sendEmail({
      //   from: env.leadNotificationFrom,
      //   to: email,
      //   subject: "Reset your Automivex admin password",
      //   html: `
      //     <h2>Password Reset Request</h2>
      //     <p>Click the link below to reset your password:</p>
      //     <a href="${resetUrl}">Reset Password</a>
      //     <p>This link expires in 30 minutes.</p>
      //   `,
      // });

      log.info({ email }, "password_reset_email_sent");
    } else {
      // Development: just log
      log.info(
        { email, resetUrl },
        "password_reset_email_link_generated_dev_mode"
      );
    }
  } catch (error) {
    log.error({ err: error, email }, "error_sending_password_reset_email");
    // Don't throw - password reset should succeed even if email fails
  }
}
