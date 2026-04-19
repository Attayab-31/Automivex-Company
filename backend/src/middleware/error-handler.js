import { env } from "../config/env.js";
import { CACHE_CONTROL } from "../config/constants.js";
import { getLogger } from "../lib/logger.js";

export function errorHandler(err, req, res, _next) {
  const statusCode = Number(err.statusCode || err.status || 500);
  const publicMessage =
    statusCode >= 500 ? "Internal server error" : err.message || "Request failed";

  const log = getLogger({ path: req.originalUrl, method: req.method });

  if (statusCode >= 500) {
    log.error(
      {
        statusCode,
        message: err.message,
        stack: env.isProduction ? undefined : err.stack,
      },
      "server_error"
    );
  }

  res.set("Cache-Control", CACHE_CONTROL.NO_STORE).status(statusCode).json({
    error: publicMessage,
    requestId: req.id,
  });
}
