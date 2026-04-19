/**
 * Backend Configuration Constants
 * Centralized constants for cache control, auth, and other magic values
 */

export const AUTH = {
  BEARER_PREFIX: "Bearer ",
  BEARER_PREFIX_LENGTH: 7,
};

export const CACHE_CONTROL = {
  /// Public content: cache for 5 minutes, stale-while-revalidate for 10 minutes
  PUBLIC_READ: "public, max-age=300, stale-while-revalidate=600",
  /// No caching for errors and auth responses
  NO_STORE: "no-store",
};
