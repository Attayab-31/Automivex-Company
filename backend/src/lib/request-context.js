import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Request Context Storage
 * Stores request-scoped data (requestId, adminId, etc.) that can be accessed
 * from anywhere in the async call stack without passing through function parameters.
 * 
 * Usage:
 * - Set during request: requestContext.run({ requestId: 'req-123' }, () => { ... })
 * - Get anywhere: const { requestId } = requestContext.getStore()
 */
const asyncLocalStorage = new AsyncLocalStorage();

export function getRequestContext() {
  return asyncLocalStorage.getStore() ?? {};
}

export function runWithRequestContext(context, callback) {
  return asyncLocalStorage.run(context, callback);
}
