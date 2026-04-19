import crypto from "crypto";
import { getLogger } from "../lib/logger.js";
import { env } from "../config/env.js";
import {
  getRedisValue,
  setRedisValue,
  deleteRedisValue,
  isRedisAvailable,
} from "../lib/redis.js";

const log = getLogger({ module: "csrf" });

/**
 * CSRF Token Management
 * 
 * Stores tokens in Redis for production scalability across multiple instances.
 * Falls back to in-memory storage if Redis is unavailable.
 * Tokens are cryptographically secure and expire after 1 hour.
 */

const inMemoryTokenStore = new Map();
const CSRF_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
const REDIS_KEY_PREFIX = "csrf:";

/**
 * Generate a CSRF token bound to the current admin session.
 * Tokens are cryptographically secure and expire after 1 hour.
 * 
 * In production: REQUIRES Redis (will fail if unavailable)
 * In development: Falls back to in-memory if Redis unavailable
 * @returns {string}
 */
export async function generateCsrfToken() {
  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = new Date().toISOString();

  const tokenData = {
    createdAt,
    expiresAt: new Date(Date.now() + CSRF_TOKEN_EXPIRY * 1000).toISOString(),
  };

  // In production: Redis is required
  if (env.isProduction) {
    if (!isRedisAvailable()) {
      log.error({}, "csrf_token_generation_failed_redis_unavailable");
      throw new Error(
        "Redis unavailable for CSRF token storage (critical in production)"
      );
    }

    const redisKey = `${REDIS_KEY_PREFIX}${token}`;
    await setRedisValue(redisKey, JSON.stringify(tokenData), CSRF_TOKEN_EXPIRY);
    log.debug({ token: token.slice(0, 8) }, "csrf_token_generated_redis");
    return token;
  }

  // In development: try Redis, fall back to memory
  try {
    if (isRedisAvailable()) {
      const redisKey = `${REDIS_KEY_PREFIX}${token}`;
      await setRedisValue(
        redisKey,
        JSON.stringify(tokenData),
        CSRF_TOKEN_EXPIRY
      );
      log.debug({ token: token.slice(0, 8) }, "csrf_token_generated_redis");
      return token;
    }
  } catch (error) {
    log.debug({ error: error.message }, "redis_fallback_to_memory");
  }

  // Development fallback to in-memory
  inMemoryTokenStore.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + CSRF_TOKEN_EXPIRY * 1000,
  });
  log.debug({ token: token.slice(0, 8) }, "csrf_token_generated_memory");
  return token;
}

/**
 * Validate a CSRF token.
 * Returns true if token exists and has not expired.
 * @param {string} token
 * @returns {Promise<boolean>}
 */
export async function validateCsrfToken(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  try {
    // Try Redis first
    if (isRedisAvailable()) {
      const redisKey = `${REDIS_KEY_PREFIX}${token}`;
      const tokenData = await getRedisValue(redisKey);

      if (!tokenData) {
        log.debug({ token: token.slice(0, 8) }, "csrf_token_not_found_redis");
        return false;
      }

      const parsed = JSON.parse(tokenData);
      const expiresAt = new Date(parsed.expiresAt).getTime();

      if (expiresAt < Date.now()) {
        log.debug({ token: token.slice(0, 8) }, "csrf_token_expired_redis");
        await deleteRedisValue(redisKey);
        return false;
      }

      log.debug({ token: token.slice(0, 8) }, "csrf_token_valid_redis");
      return true;
    } else {
      // Fallback to in-memory store
      const data = inMemoryTokenStore.get(token);

      if (!data) {
        log.debug({ token: token.slice(0, 8) }, "csrf_token_not_found_memory");
        return false;
      }

      if (data.expiresAt < Date.now()) {
        log.debug({ token: token.slice(0, 8) }, "csrf_token_expired_memory");
        inMemoryTokenStore.delete(token);
        return false;
      }

      log.debug({ token: token.slice(0, 8) }, "csrf_token_valid_memory");
      return true;
    }
  } catch (error) {
    log.error({ err: error }, "error_validating_csrf_token");
    return false;
  }
}

/**
 * Consume a CSRF token after validation.
 * Once used, token cannot be reused (prevents replay attacks).
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function consumeCsrfToken(token) {
  try {
    if (!token) {
      return;
    }

    if (isRedisAvailable()) {
      const redisKey = `${REDIS_KEY_PREFIX}${token}`;
      await deleteRedisValue(redisKey);
      log.debug({ token: token.slice(0, 8) }, "csrf_token_consumed_redis");
    } else {
      inMemoryTokenStore.delete(token);
      log.debug({ token: token.slice(0, 8) }, "csrf_token_consumed_memory");
    }
  } catch (error) {
    log.error({ err: error }, "error_consuming_csrf_token");
  }
}

/**
 * Middleware to require CSRF token on state-changing admin requests.
 * Token can be provided via:
 * 1. X-CSRF-Token header
 * 2. _csrf query parameter
 */
export async function requireCsrfToken(req, res, next) {
  // CSRF protection is not needed for GET requests
  if (
    req.method === "GET" ||
    req.method === "HEAD" ||
    req.method === "OPTIONS"
  ) {
    return next();
  }

  // Extract token from header or query parameter
  const token = req.get("x-csrf-token") || req.query._csrf;

  if (!token) {
    log.warn({ method: req.method, path: req.path }, "csrf_token_missing");
    return res.status(403).json({
      error: "CSRF token is required for this operation.",
      code: "CSRF_TOKEN_REQUIRED",
    });
  }

  const isValid = await validateCsrfToken(token);

  if (!isValid) {
    log.warn(
      { token: token.slice(0, 8), method: req.method, path: req.path },
      "csrf_token_invalid"
    );
    return res.status(403).json({
      error: "CSRF token is invalid or expired.",
      code: "CSRF_TOKEN_INVALID",
    });
  }

  // Token is valid - consume it (one-time use)
  await consumeCsrfToken(token);

  // Add flag to request for logging
  req.csrfValidated = true;
  next();
}

/**
 * Endpoint to generate a fresh CSRF token for the admin.
 * Frontend should call this when rendering forms or before state-changing operations.
 * Requires admin authentication.
 */
export async function handleCsrfTokenGeneration(req, res) {
  try {
    const token = await generateCsrfToken();

    res.set("Cache-Control", "no-store, must-revalidate");
    res.status(200).json({
      token,
      expiresIn: CSRF_TOKEN_EXPIRY, // seconds
      headerName: "X-CSRF-Token",
    });
  } catch (error) {
    log.error({ err: error }, "error_generating_csrf_token_endpoint");
    res.status(500).json({
      error: "Failed to generate CSRF token.",
      code: "CSRF_TOKEN_GENERATION_FAILED",
    });
  }
}
