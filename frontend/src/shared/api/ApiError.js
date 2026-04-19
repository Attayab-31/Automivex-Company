/**
 * ApiError Class
 * Structured error response from API calls
 * Preserves HTTP status, error code, and message for type-safe error handling
 */
export class ApiError extends Error {
  constructor(message, code = "UNKNOWN", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }

  /**
   * Check if this is an authentication error (401)
   */
  isAuthenticationError() {
    return this.status === 401 || this.code === "UNAUTHORIZED" || this.code === "AUTH_INVALID" || this.code === "AUTH_REQUIRED";
  }

  /**
   * Check if this is an authorization error (403)
   */
  isAuthorizationError() {
    return this.status === 403 || this.code === "FORBIDDEN" || this.code === "INSUFFICIENT_ROLE";
  }

  /**
   * Check if this is a server error (5xx)
   */
  isServerError() {
    return this.status >= 500 && this.status < 600;
  }
}

/**
 * Create ApiError from fetch error response
 * @param {Response} response - fetch Response object
 * @param {object} errorData - parsed JSON error body
 * @returns {ApiError}
 */
export function buildApiError(response, errorData = {}) {
  return new ApiError(
    errorData.error || response.statusText || "Unknown error",
    errorData.code || "UNKNOWN",
    response.status
  );
}
