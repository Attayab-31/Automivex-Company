import { randomUUID } from "node:crypto";
import { runWithRequestContext } from "../lib/request-context.js";

/**
 * Request ID Middleware
 * Generates a unique request ID and stores it in AsyncLocalStorage
 * for use throughout the request lifecycle without passing through function parameters.
 */
export function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);

  // Run the rest of the request handlers within the request context
  runWithRequestContext({ requestId: req.id }, () => {
    next();
  });
}
