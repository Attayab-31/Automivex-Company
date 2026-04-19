/**
 * JWT Token Revocation/Blacklist System
 * 
 * Handles JWT token revocation for logout and security events.
 * Uses Redis for distributed systems or in-memory for single-server deployments.
 * 
 * In Production:
 *   - Tokens are stored in Redis with TTL matching JWT expiry
 *   - Automatic cleanup after token expiry time
 *   - Survives server restarts
 * 
 * In Development:
 *   - Falls back to in-memory storage if Redis unavailable
 *   - Auto-cleanup on process exit
 */

import { getLogger } from "./logger.js";
import { isRedisAvailable, getRedisValue, setRedisValue, deleteRedisValue } from "./redis.js";
import { env } from "../config/env.js";

const log = getLogger({ module: "token-revocation" });

// In-memory fallback for development
const blacklistedTokens = new Set();
const TOKEN_EXPIRY_SECONDS = 24 * 60 * 60; // 24 hours (matches JWT expiry)
const REDIS_KEY_PREFIX = "blacklist:";

/**
 * Revoke a JWT token
 * Called on logout or security events
 * @param {string} token - The JWT token to revoke
 * @returns {Promise<void>}
 */
export async function revokeToken(token) {
  if (!token || typeof token !== "string") {
    log.warn("revokeToken called with invalid token");
    return;
  }

  try {
    const revokedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_SECONDS * 1000).toISOString();

    const tokenData = {
      revokedAt,
      expiresAt,
      reason: "logout", // Could be: logout, security_breach, password_change, etc.
    };

    // Try Redis first (production)
    if (isRedisAvailable()) {
      const redisKey = `${REDIS_KEY_PREFIX}${token}`;
      await setRedisValue(redisKey, JSON.stringify(tokenData), TOKEN_EXPIRY_SECONDS);
      log.info({ token: token.slice(0, 8) }, "token_revoked_redis");
      return;
    }

    // Fallback to in-memory (development)
    blacklistedTokens.add(token);
    log.debug({ token: token.slice(0, 8) }, "token_revoked_memory");
  } catch (error) {
    log.error({ err: error, token: token.slice(0, 8) }, "error_revoking_token");
    // Don't throw - revocation failure shouldn't break logout
  }
}

/**
 * Check if a token is revoked
 * @param {string} token - The JWT token to check
 * @returns {Promise<boolean>} - True if token is revoked
 */
export async function isTokenRevoked(token) {
  if (!token || typeof token !== "string") {
    return false;
  }

  try {
    // Check Redis first
    if (isRedisAvailable()) {
      const redisKey = `${REDIS_KEY_PREFIX}${token}`;
      const result = await getRedisValue(redisKey);

      if (result) {
        log.debug({ token: token.slice(0, 8) }, "token_is_revoked_redis");
        return true;
      }

      log.debug({ token: token.slice(0, 8) }, "token_not_revoked_redis");
      return false;
    }

    // Check in-memory
    const isRevoked = blacklistedTokens.has(token);

    if (isRevoked) {
      log.debug({ token: token.slice(0, 8) }, "token_is_revoked_memory");
      return true;
    }

    log.debug({ token: token.slice(0, 8) }, "token_not_revoked_memory");
    return false;
  } catch (error) {
    log.error({ err: error, token: token.slice(0, 8) }, "error_checking_token_revocation");
    // Safety: treat as revoked on error
    return true;
  }
}

/**
 * Clear all revoked tokens (cleanup)
 * Called periodically or on application shutdown
 * @returns {Promise<void>}
 */
export async function clearRevokedTokens() {
  try {
    if (isRedisAvailable()) {
      // Redis has automatic TTL-based cleanup
      log.info("revoked tokens auto-cleanup by Redis TTL");
      return;
    }

    // Manual cleanup for in-memory store
    const beforeCount = blacklistedTokens.size;
    blacklistedTokens.clear();
    log.info({ beforeCount }, "cleared_revoked_tokens_memory");
  } catch (error) {
    log.error({ err: error }, "error_clearing_revoked_tokens");
  }
}

/**
 * Cleanup on process exit
 */
process.on("exit", () => {
  clearRevokedTokens();
});
