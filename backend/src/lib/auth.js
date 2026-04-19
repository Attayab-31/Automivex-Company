import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { getLogger } from "./logger.js";

const log = getLogger();

/**
 * Hash a password using bcryptjs
 * Salt rounds: 12 (industry standard for production)
 */
export async function hashPassword(password) {
  if (!password || password.length < 8) {
    const error = new Error("Password must be at least 8 characters");
    (error).statusCode = 400;
    throw error;
  }

  try {
    const hash = await bcryptjs.hash(password, 12);
    return hash;
  } catch (error) {
    log.error({ message: error.message }, "password_hashing_failed");
    throw error;
  }
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password, hash) {
  try {
    const isValid = await bcryptjs.compare(password, hash);
    return isValid;
  } catch (error) {
    log.error({ message: error.message }, "password_verification_failed");
    return false;
  }
}

/**
 * Generate JWT token for admin
 * Payload includes admin ID and email for context
 */
export function generateJWT(adminId, adminEmail) {
  if (!env.jwtSecret) {
    log.fatal("JWT_SECRET not configured");
    throw new Error("JWT_SECRET environment variable is required");
  }

  const token = jwt.sign(
    {
      sub: adminId, // JWT standard: subject (user ID)
      email: adminEmail,
      type: "admin",
      iat: Math.floor(Date.now() / 1000),
    },
    env.jwtSecret,  // ✅ Use configured JWT secret (auto-generated for dev)
    {
      expiresIn: "24h", // Token valid for 24 hours
      algorithm: "HS256",
    }
  );

  return token;
}

/**
 * Verify JWT token and return payload
 */
export function verifyJWT(token) {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET not configured");
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {  // ✅ Use configured JWT secret
      algorithms: ["HS256"],
    });

    // Ensure it's an admin token
    if (payload.type !== "admin") {
      throw new Error("Invalid token type");
    }

    return {
      sub: payload.sub,
      email: payload.email,
      type: payload.type,
      iat: payload.iat,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const err = new Error("Token has expired");
      (err).statusCode = 401;
      throw err;
    }
    if (error.name === "JsonWebTokenError") {
      const err = new Error("Invalid token");
      (err).statusCode = 401;
      throw err;
    }
    throw error;
  }
}
