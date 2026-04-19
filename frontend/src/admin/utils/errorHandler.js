/**
 * Error Handling Utilities
 * Standardized error handling and formatting
 */

import { HTTP_STATUS } from "../config/constants.js";

/**
 * Parse API error response
 */
export function parseApiError(error) {
  // Network error
  if (!error.response) {
    return {
      status: 0,
      message: error.message || "Network error",
      data: null,
    };
  }

  const { status, data } = error.response;
  const message = data?.message || data?.error || "An error occurred";

  return {
    status,
    message,
    data,
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error, context = "general") {
  const parsed = parseApiError(error);

  // Map specific status codes to messages
  switch (parsed.status) {
    case HTTP_STATUS.BAD_REQUEST:
      return parsed.message || "Invalid request";

    case HTTP_STATUS.UNAUTHORIZED:
      return context === "reset-password"
        ? "This password reset link has expired or is invalid"
        : "Your session has expired. Please log in again.";

    case HTTP_STATUS.FORBIDDEN:
      return context === "signup"
        ? "Admin signup is only available for initial setup"
        : "You don't have permission to perform this action";

    case HTTP_STATUS.CONFLICT:
      return context === "signup"
        ? "Email already in use"
        : parsed.message || "This resource already exists";

    case 0: // Network error
      return "Network error. Please check your connection.";

    default:
      return parsed.message || "An error occurred";
  }
}

/**
 * Create a standardized error object
 */
export function createError(message, status = 400, data = null) {
  return {
    response: {
      status,
      data: { message, error: message, ...data },
    },
  };
}

/**
 * Check if error is auth-related (401, 403)
 */
export function isAuthError(error) {
  const parsed = parseApiError(error);
  return parsed.status === HTTP_STATUS.UNAUTHORIZED ||
    parsed.status === HTTP_STATUS.FORBIDDEN;
}

/**
 * Check if error is network-related
 */
export function isNetworkError(error) {
  return parseApiError(error).status === 0;
}

/**
 * Log error for debugging (with optional context)
 */
export function logError(error, context = "") {
  const parsed = parseApiError(error);
  const timestamp = new Date().toISOString();

  console.error(`[${timestamp}] Error${context ? ` in ${context}` : ""}:`, {
    status: parsed.status,
    message: parsed.message,
    data: parsed.data,
  });
}
