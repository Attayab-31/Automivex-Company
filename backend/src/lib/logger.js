import pino from "pino";
import { getRequestContext } from "./request-context.js";

let pinoInstance = null;

/**
 * Initialize Pino Logger with configuration
 * Call this early in server startup (before any logging)
 */
export function initializeLogger(isProduction, logLevel) {
  const transport = isProduction
    ? undefined // JSON output to stdout for production
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      };

  pinoInstance = pino(
    {
      level: logLevel || "info",
      transport,
    }
  );
}

/**
 * Get or create the Pino logger instance
 */
function getPinoInstance() {
  if (!pinoInstance) {
    // Fallback initialization if not explicitly initialized
    pinoInstance = pino({ level: "info" });
  }
  return pinoInstance;
}

/**
 * Get a logger with automatic requestId from AsyncLocalStorage
 */
export function getLogger(bindings = {}) {
  const pino = getPinoInstance();
  const { requestId } = getRequestContext();

  return pino.child({
    ...(requestId && { requestId }),
    ...bindings,
  });
}

// Export a default logger instance for backward compatibility
export const logger = {
  child(bindings = {}) {
    return getLogger(bindings);
  },
};
