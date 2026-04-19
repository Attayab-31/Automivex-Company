import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { adminApi } from "../api/adminApi.js";

const AdminAuthContext = createContext(null);

// ✅ localStorage keys for auth persistence
const AUTH_STORAGE_KEY = "admin_auth_state";
const AUTH_STORAGE_EXPIRY_KEY = "admin_auth_expiry";
const AUTH_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Save auth state to localStorage
 * @param {Object} adminInfo - Admin user information to persist
 */
function saveAuthToStorage(adminInfo) {
  try {
    const expiryTime = Date.now() + AUTH_TTL_MS;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminInfo));
    localStorage.setItem(AUTH_STORAGE_EXPIRY_KEY, expiryTime.toString());
  } catch (err) {
    // localStorage quota exceeded or other error - silently fail
    console.warn("Failed to save auth to localStorage:", err);
  }
}

/**
 * Load auth state from localStorage
 * @returns {Object|null} - Stored admin info if valid and not expired
 */
function loadAuthFromStorage() {
  try {
    const storedAdmin = localStorage.getItem(AUTH_STORAGE_KEY);
    const expiryTime = localStorage.getItem(AUTH_STORAGE_EXPIRY_KEY);

    if (!storedAdmin || !expiryTime) {
      return null;
    }

    // Check if auth has expired
    if (Date.now() > parseInt(expiryTime, 10)) {
      // Expired - clear storage
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_EXPIRY_KEY);
      return null;
    }

    return JSON.parse(storedAdmin);
  } catch (err) {
    console.warn("Failed to load auth from localStorage:", err);
    return null;
  }
}

/**
 * Clear auth state from localStorage
 */
function clearAuthFromStorage() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_EXPIRY_KEY);
  } catch (err) {
    console.warn("Failed to clear auth from localStorage:", err);
  }
}

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [admin, setAdmin] = useState(null);

  // ✅ Check auth state on mount: restore from storage, then verify with server
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First, try to restore from localStorage
        const storedAdmin = loadAuthFromStorage();
        
        if (storedAdmin) {
          // ✅ Restore from storage - fast, local-only
          setAdmin(storedAdmin);
          setIsAuthenticated(true);
        }

        // Then verify with server (cookie-based authentication)
        try {
          const response = await fetch("/api/admin/auth/verify", {
            method: "GET",
            credentials: "include",
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsAuthenticated(true);
            if (data.admin) {
              setAdmin(data.admin);
              saveAuthToStorage(data.admin); // Update stored data with fresh server data
            }
          } else if (response.status === 401) {
            // Auth failed on server - clear everything
            setIsAuthenticated(false);
            setAdmin(null);
            clearAuthFromStorage();
          } else {
            // Server error - keep local state as-is
            // (network might be recovering)
          }
        } catch (err) {
          // Network error - keep local state from storage if available
          // This allows offline functionality for cached auth
          if (!storedAdmin) {
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error("Auth check error:", err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await adminApi.login(email, password);
      
      // ✅ Validate that admin data was returned
      if (!response.admin) {
        throw new Error("No user data returned from server");
      }
      
      setIsAuthenticated(true);
      setAdmin(response.admin);
      saveAuthToStorage(response.admin); // ✅ Save to localStorage after login
      return true;
    } catch (err) {
      setError(err.message);
      setIsAuthenticated(false);
      clearAuthFromStorage(); // ✅ Clear storage on login failure
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
      setAdmin(null);
      setError(null);
      clearAuthFromStorage(); // ✅ Clear storage on logout
    }
  }, []);

  const value = {
    isAuthenticated,
    isLoading,
    error,
    admin,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
