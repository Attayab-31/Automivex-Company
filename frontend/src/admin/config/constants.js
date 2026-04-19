/**
 * Admin Panel Configuration Constants
 * Centralized configuration to avoid magic strings
 */

// Content Editor Tabs
export const CONTENT_TABS = {
  HERO: { id: "hero", label: "Hero" },
  WHY_CHOOSE: { id: "whyChoose", label: "Why Choose" },
  NAV: { id: "nav", label: "Navigation" },
  SERVICES: { id: "services", label: "Services" },
  CASE_STUDIES: { id: "caseStudies", label: "Case Studies" },
  TRUST: { id: "trust", label: "Trust & Delivery" },
  PROOF: { id: "proof", label: "Proof Metrics" },
  QUALIFICATION: { id: "qualification", label: "Qualification" },
  SITE_CONFIG: { id: "siteConfig", label: "Site Config" },
};

export const CONTENT_TABS_LIST = Object.values(CONTENT_TABS);

// Routes
export const ADMIN_ROUTES = {
  LOGIN: "/admin/login",
  SIGNUP: "/admin/signup",
  RESET_PASSWORD: "/admin/reset-password",
  DASHBOARD: "/admin/dashboard",
};

// API Endpoints
export const ADMIN_API_ENDPOINTS = {
  LOGIN: "/api/admin/auth/login",
  SIGNUP: "/api/admin/auth/signup",
  LOGOUT: "/api/admin/auth/logout",
  VERIFY: "/api/admin/auth/verify",
  REQUEST_RESET: "/api/admin/auth/request-reset",
  RESET_PASSWORD: "/api/admin/auth/reset-password",
  CSRF_TOKEN: "/api/admin/csrf-token",
  DRAFT_CONTENT: "/api/admin/content/draft",
  PUBLISHED_CONTENT: "/api/admin/content/published",
  PUBLISH: "/api/admin/content/publish",
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    errorMessage: "Please enter a valid email address",
  },
  PASSWORD: {
    minLength: 8,
    errorMessage: "Password must be at least 8 characters long",
  },
  FULL_NAME: {
    minLength: 2,
    maxLength: 200,
    errorMessage: "Full name must be between 2 and 200 characters",
  },
  CONFIRM_PASSWORD: {
    errorMessage: "Passwords do not match",
  },
};

// Response Messages
export const MESSAGES = {
  // Success
  LOGIN_SUCCESS: "Logged in successfully",
  SIGNUP_SUCCESS: "Admin account created successfully!",
  DRAFT_SAVED: "Draft saved successfully!",
  PUBLISH_SUCCESS: "✅ Content published successfully! The public website is now updated.",
  PASSWORD_RESET_SENT: "If an account exists with this email, a password reset link has been sent.",
  PASSWORD_RESET_SUCCESS: "Password reset successful! Redirecting to login...",

  // Errors
  LOGIN_FAILED: "Authentication failed. Please check your credentials.",
  SIGNUP_FAILED: "Failed to create admin account",
  EMAIL_IN_USE: "Email already in use. Please use a different email address.",
  SIGNUP_ONLY_INITIAL: "Admin signup is only available for initial setup.",
  INVALID_RESET_TOKEN: "This password reset link has expired or is invalid. Please request a new one.",
  PASSWORD_RESET_FAILED: "Failed to reset password",
  DRAFT_SAVE_FAILED: "Failed to save draft",
  PUBLISH_FAILED: "Publish failed",
  AUTH_ERROR: "Authentication error. Please log in again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
};

// Reset Password Steps
export const RESET_PASSWORD_STEPS = {
  REQUEST: 1,
  RESET: 2,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Auth Check Interval
export const AUTH_CHECK_INTERVAL_MS = 60000; // 1 minute
