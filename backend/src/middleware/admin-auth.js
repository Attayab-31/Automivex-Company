import { env } from "../config/env.js";
import { AUTH } from "../config/constants.js";

/**
 * Admin token validation middleware.
 * Simple approach: check against ADMIN_TOKEN from environment.
 * For production, this would be replaced with proper JWT validation.
 */
export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith(AUTH.BEARER_PREFIX)) {
    return res.status(401).json({
      error: "Missing or invalid authorization header.",
      code: "UNAUTHORIZED",
    });
  }

  const token = authHeader.substring(AUTH.BEARER_PREFIX_LENGTH);

  // Validate token against environment or JWT
  if (!token || token !== env.adminToken) {
    return res.status(403).json({
      error: "Invalid or expired token.",
      code: "FORBIDDEN",
    });
  }

  // Token is valid, continue
  req.adminAuthenticated = true;
  next();
}
