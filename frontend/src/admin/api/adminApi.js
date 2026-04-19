import { frontendEnv } from "@/lib/env";
import { ApiError, buildApiError } from "@/shared/api/ApiError.js";

const API_BASE = `${frontendEnv.backendUrl}/api/admin`;

class AdminApiClient {
  constructor() {
    // Note: JWT token is stored in HttpOnly cookie by server
    // We don't have direct access to it from JavaScript (by design - security)
    // Instead, we check auth state by making a test request or checking if we can access protected endpoints
  }

  clearCookie() {
    // JavaScript cannot directly clear HttpOnly cookies
    // But we can call logout endpoint which clears it server-side
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
    
    // After successful login, fetch a CSRF token for subsequent operations
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.warn("Failed to fetch CSRF token after login", err);
      // Don't throw - CSRF token will be fetched on-demand if needed
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
    
    // After successful signup, fetch a CSRF token
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.warn("Failed to fetch CSRF token after signup", err);
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
    // Ensure CSRF token is available
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }

    const response = await fetch(`${API_BASE}/content/draft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      body: JSON.stringify(content),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    // CSRF token was consumed - fetch a new one for next request
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.warn("Failed to refresh CSRF token after draft save", err);
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
    // Ensure CSRF token is available
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }

    const response = await fetch(`${API_BASE}/content/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": this.csrfToken,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw buildApiError(response, error);
    }

    // CSRF token was consumed - fetch a new one for next request
    try {
      await this.fetchCsrfToken();
    } catch (err) {
      console.warn("Failed to refresh CSRF token after publish", err);
    }

    return response.json();
  }
}

export const adminApi = new AdminApiClient();
