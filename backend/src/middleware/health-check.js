import { isMongoHealthy } from "../lib/mongo.js";
import { getLogger } from "../lib/logger.js";
import { CACHE_CONTROL } from "../config/constants.js";

/**
 * Health Check Endpoint Middleware
 * Returns service status with detailed information
 * Always returns 200 OK if API is healthy (even if services are unavailable)
 * Individual services report their status in response body
 */
export async function healthCheck(req, res) {
  const log = getLogger();

  res.set("Cache-Control", CACHE_CONTROL.NO_STORE);

  try {
    // Build health status object
    const health = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        api: "healthy",
        mongodb: isMongoHealthy() ? "healthy" : "unavailable",
      },
    };

    // Always return 200 if API itself is responding
    res.status(200).json(health);
    log.debug("health_check_passed");
  } catch (error) {
    log.error({ message: error.message }, "health_check_error");
    res.status(500).json({
      status: "error",
      message: "Health check failed",
    });
  }
}
