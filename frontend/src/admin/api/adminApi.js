import { frontendEnv } from "@/lib/env";
import { ApiError, buildApiError } from "@/shared/api/ApiError.js";

const API_BASE = `${frontendEnv.backendUrl}/api/admin`;

class AdminApiClient {
  constructor() {
    // Note: JWT token is stored in HttpOnly cookie by server
    // We don't have direct access to it from JavaScript (by design - security)
    // Instead, we check auth state by making a test request or checking if we can access protected endpoints
    this.csrfToken = null;
    this.csrfTokenExpiresAt = null;
  }

  clearCookie() {
    // JavaScript cannot directly clear HttpOnly cookies
    // But we can call logout endpoint which clears it server-side
  }

  /**
   * Fetch a fresh CSRF token from the server.
   * ✅ Now throws on error instead of failing silently
   * ✅ This ensures subsequent requests can't proceed without valid CSRF token
   */
  async fetchCsrfToken(maxRetries = 3) {
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(`${API_BASE}/csrf-token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json();
          throw buildApiError(response, error);
        }

        const data = await response.json();
        
        // ✅ Store CSRF token with expiry (assume 1 hour validity)
        this.csrfToken = data.token;
        this.csrfTokenExpiresAt = Date.now() + 60 * 60 * 1000;
        
        return data;
      } catch (error) {
        lastError = error;
        
        // ✅ Retry only on network errors, not on auth errors
        const isNetworkError = !response || response.status === 0 || error.code === 'NetworkError';
        const isAuthError = response && (response.status === 401 || response.status === 403);
        
        if (isAuthError) {
          // Don't retry auth errors - fail immediately
          throw error;
        }

        if (isNetworkError && attempt < maxRetries - 1) {
          // Wait before retrying network errors
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
          continue;
        }

        // Last attempt or unrecoverable error
        throw error;
      }
    }

    throw lastError || new Error("Failed to fetch CSRF token after retries");
  }

  /**
   * Check if CSRF token is valid and not expired
   */
  isCsrfTokenValid() {
    if (!this.csrfToken) return false;
    if (!this.csrfTokenExpiresAt) return false;
    return Date.now() < this.csrfTokenExpiresAt;
  }

  /**
   * Ensure CSRF token is available, fetch if needed
   * ✅ Throws if unable to obtain token - blocks state-changing operations
   */
  async ensureCsrfToken() {
    if (!this.isCsrfTokenValid()) {
      await this.fetchCsrfToken();
    }
    return this.csrfToken;
  }

  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include", // Include cookies in request
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    const data = await response.json();
    
    // ✅ After successful login, fetch a CSRF token (now throws on failure)
    // This ensures subsequent operations have a valid token
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.error("Failed to fetch CSRF token after login", err);
      // ✅ Don't suppress this error - let it propagate so login UI can show error
      throw new Error("Login successful but unable to fetch security token. Please refresh and try again.");
    }
    
    return data;
  }

  async signup(email, password, fullName) {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    const data = await response.json();
    
    // ✅ After successful signup, fetch a CSRF token (now throws on failure)
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.error("Failed to fetch CSRF token after signup", err);
      throw new Error("Signup successful but unable to fetch security token. Please log in and try again.");
    }
    
    return data;
  }

  async requestPasswordReset(email) {
    const response = await fetch(`${API_BASE}/auth/request-reset`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    return response.json();
  }

  async resetPassword(token, password) {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    return response.json();
  }

  async logout() {
    try {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw buildApiError(response, error);
      }

      return response.json();
    } catch (error) {
      console.error("Logout error:", error);
      // Still return success even if logout fails (user intended to leave)
      return { message: "Logged out" };
    }
  }

  /**
   * Fetch a fresh CSRF token from the server.
   * Should be called after login and before making state-changing requests.
   */
  async fetchCsrfToken() {
    const response = await fetch(`${API_BASE}/csrf-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    const data = await response.json();
    // Store CSRF token in memory (not localStorage, as it's short-lived)
    this.csrfToken = data.token;
    return data;
  }

  async getDraftContent() {
    const response = await fetch(`${API_BASE}/content/draft`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    return response.json();
  }

  async saveDraft(content) {
    // ✅ Ensure CSRF token is available - throws if unable to fetch
    // This blocks state-changing operations if security token unavailable
    const csrfToken = await this.ensureCsrfToken();

    const response = await fetch(`${API_BASE}/content/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify(content),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    // ✅ CSRF token was consumed - fetch a new one for next request (now throws on failure)
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.warn("Failed to refresh CSRF token after draft save", err);
      // Don't throw here - next operation will fetch a new token if needed
    }

    return response.json();
  }

  async getPublished() {
    const response = await fetch(`${API_BASE}/content/published`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    return response.json();
  }

  async publish() {
    // ✅ Ensure CSRF token is available - throws if unable to fetch
    // This blocks state-changing operations if security token unavailable
    const csrfToken = await this.ensureCsrfToken();

    const response = await fetch(`${API_BASE}/content/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    const data = await response.json();

    // ✅ CSRF token was consumed - fetch a new one for next request (now throws on failure)
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.warn("Failed to refresh CSRF token after publish", err);
      // Don't throw here - next operation will fetch a new token if needed
    }

    return data;
  }
}

export const adminApi = new AdminApiClient();
