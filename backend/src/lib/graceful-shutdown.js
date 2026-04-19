import { closeMongoClient } from "./mongo.js";
import { getLogger } from "./logger.js";
import { closeRedis } from "./redis.js";

let isShuttingDown = false;
let activeRequests = 0;

/**
 * Graceful Shutdown Manager
 * 
 * Ensures the server shuts down cleanly:
 * 1. Stops accepting new connections
 * 2. Waits for in-flight requests to complete
 * 3. Closes database connections
 * 4. Exits process after timeout
 */
export function setupGracefulShutdown(server) {
  const log = getLogger();
  const SHUTDOWN_TIMEOUT = 30 * 1000; // 30 seconds

  // Track active requests
  server.on("request", (_req, res) => {
    activeRequests++;

    res.on("finish", () => {
      activeRequests--;
    });

    res.on("close", () => {
      activeRequests--;
    });
  });

  async function gracefulShutdown(signal) {
    if (isShuttingDown) {
      return; // Already shutting down
    }

    isShuttingDown = true;
    log.info({ signal }, "graceful_shutdown_initiated");

    // Stop accepting new connections
    server.close(async () => {
      log.info("server_stopped_accepting_connections");

      // Wait for in-flight requests to complete (with timeout)
      const shutdownDeadline = Date.now() + SHUTDOWN_TIMEOUT;
      while (activeRequests > 0 && Date.now() < shutdownDeadline) {
        log.info({ activeRequests }, "waiting_for_requests_to_complete");
        await sleep(1000);
      }

      if (activeRequests > 0) {
        log.warn(
          { remainingRequests: activeRequests },
          "forcing_shutdown_timeout_reached"
        );
      } else {
        log.info("all_requests_completed");
      }

      // Close database connection
      try {
        await closeMongoClient();
      } catch (error) {
        log.error(
          { message: error instanceof Error ? error.message : String(error) },
          "error_closing_database"
        );
      }

      // Close Redis connection
      try {
        await closeRedis();
      } catch (error) {
        log.error(
          { message: error instanceof Error ? error.message : String(error) },
          "error_closing_redis"
        );
      }

      log.info("graceful_shutdown_complete");
      process.exit(0);
    });

    // Force exit after absolute timeout
    setTimeout(() => {
      log.fatal("shutdown_timeout_exceeded_forcing_exit");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT + 5000); // 5 second buffer
  }

  // Listen for shutdown signals
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    log.fatal(
      { message: error.message, stack: error.stack },
      "uncaught_exception"
    );
    gracefulShutdown("uncaughtException");
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason, promise) => {
    log.fatal(
      {
        reason: reason instanceof Error ? reason.message : String(reason),
        promise: String(promise),
      },
      "unhandled_promise_rejection"
    );
    gracefulShutdown("unhandledRejection");
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
