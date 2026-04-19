import { createClient } from "redis";
import { getLogger } from "./logger.js";

const logger = getLogger({ module: "redis" });
let redisClient = null;

/**
 * Initialize Redis client for CSRF token storage and session management
 * @returns {Promise<void>}
 */
export async function initializeRedis() {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      // In production, Redis is required
      if (process.env.NODE_ENV === "production") {
        logger.error("REDIS_URL not configured");
        throw new Error(
          "REDIS_URL is required in production (for CSRF token storage)"
        );
      }
      
      logger.warn("REDIS_URL not configured, Redis disabled for development");
      return;
    }

    if (redisClient) {
      logger.info("Redis client already initialized");
      return;
    }

    redisClient = createClient({ url: redisUrl });

    redisClient.on("error", (err) => {
      logger.error({ err }, "Redis error");
    });

    redisClient.on("connect", () => {
      logger.info("Redis client connected");
    });

    redisClient.on("disconnect", () => {
      logger.warn("Redis client disconnected");
    });

    await redisClient.connect();
    logger.info("Redis initialized successfully");
  } catch (error) {
    logger.error({ err: error }, "Failed to initialize Redis");
    
    // In production, fail immediately
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    
    // In development, allow app to run without Redis
    logger.warn("Continuing without Redis (development mode)");
  }
}

/**
 * Get Redis client instance
 * @returns {any|null}
 */
export function getRedisClient() {
  return redisClient;
}

/**
 * Check if Redis is available
 * @returns {boolean}
 */
export function isRedisAvailable() {
  return redisClient !== null;
}

/**
 * Store value in Redis with optional expiry
 * @param {string} key
 * @param {string} value
 * @param {number} expirySeconds
 * @returns {Promise<void>}
 */
export async function setRedisValue(key, value, expirySeconds = null) {
  if (!redisClient) {
    logger.warn("Redis not available, skipping set operation");
    return;
  }

  try {
    if (expirySeconds) {
      await redisClient.setEx(key, expirySeconds, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    logger.error({ err: error, key }, "Failed to set Redis value");
    throw error;
  }
}

/**
 * Get value from Redis
 * @param {string} key
 * @returns {Promise<string|null>}
 */
export async function getRedisValue(key) {
  if (!redisClient) {
    logger.warn("Redis not available, skipping get operation");
    return null;
  }

  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error({ err: error, key }, "Failed to get Redis value");
    throw error;
  }
}

/**
 * Delete value from Redis
 * @param {string} key
 * @returns {Promise<void>}
 */
export async function deleteRedisValue(key) {
  if (!redisClient) {
    logger.warn("Redis not available, skipping delete operation");
    return;
  }

  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error({ err: error, key }, "Failed to delete Redis value");
    throw error;
  }
}

/**
 * Close Redis connection
 * @returns {Promise<void>}
 */
export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info("Redis connection closed");
      redisClient = null;
    } catch (error) {
      logger.error({ err: error }, "Error closing Redis connection");
    }
  }
}
