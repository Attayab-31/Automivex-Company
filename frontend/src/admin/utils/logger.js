/**
 * Logger Utility for Admin Panel
 * Consistent logging with context, levels, and performance tracking
 */

const LOG_LEVELS = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
};

const LOG_COLORS = {
  DEBUG: "color: #666; font-weight: 400;",
  INFO: "color: #0066cc; font-weight: 500;",
  WARN: "color: #ff9800; font-weight: 600;",
  ERROR: "color: #d32f2f; font-weight: 700;",
};

class AdminLogger {
  constructor(name) {
    this.name = name;
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Format log message with context
   */
  format(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      context: this.name,
      message,
      data,
    };
  }

  /**
   * Log to console with styling
   */
  log(level, message, data) {
    if (!this.isDevelopment) return;

    const formatted = this.format(level, message, data);
    const style = LOG_COLORS[level] || "";
    const prefix = `%c[${level}] ${this.name}`;

    if (data) {
      console.log(`${prefix}: ${message}`, style, formatted.data);
    } else {
      console.log(`${prefix}: ${message}`, style);
    }
  }

  debug(message, data) {
    this.log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, error) {
    this.log(LOG_LEVELS.ERROR, message, {
      message: error?.message,
      stack: error?.stack,
      ...error,
    });
  }

  /**
   * Track performance of operations
   */
  time(label) {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.info(`${label} took ${duration.toFixed(2)}ms`, { duration });
    };
  }

  /**
   * Track async operation timing
   */
  async timeAsync(label, asyncFn) {
    const start = performance.now();
    try {
      const result = await asyncFn();
      const duration = performance.now() - start;
      this.info(`${label} took ${duration.toFixed(2)}ms`, { duration });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }
}

/**
 * Create logger instance with context
 * Usage:
 *   const logger = createLogger("LoginPage");
 *   logger.info("User logged in", { userId: 123 });
 */
export function createLogger(context) {
  return new AdminLogger(context);
}

/**
 * Pre-configured loggers for common modules
 */
export const loggers = {
  auth: createLogger("Auth"),
  forms: createLogger("Forms"),
  api: createLogger("API"),
  store: createLogger("Store"),
  content: createLogger("Content"),
  ui: createLogger("UI"),
};

/**
 * Example usage in components:
 *
 * import { createLogger } from "../utils/logger.js";
 *
 * export default function LoginPage() {
 *   const logger = createLogger("LoginPage");
 *
 *   useEffect(() => {
 *     logger.info("Component mounted");
 *     return () => logger.info("Component unmounted");
 *   }, []);
 *
 *   const handleLogin = async () => {
 *     try {
 *       logger.info("Starting login", { email });
 *       const result = await logger.timeAsync("Login API call", () =>
 *         api.login(email, password)
 *       );
 *       logger.info("Login successful", { userId: result.id });
 *     } catch (error) {
 *       logger.error("Login failed", error);
 *     }
 *   };
 * }
 *
 * // Output in browser console:
 * // [INFO] LoginPage: Component mounted
 * // [INFO] LoginPage: Starting login { email: "test@example.com" }
 * // [INFO] LoginPage: Login API call took 234.56ms
 * // [INFO] LoginPage: Login successful { userId: 123 }
 */
