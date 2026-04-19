/**
 * Form Validation Utilities
 * Centralized validation logic for admin forms
 */

import { VALIDATION_RULES, MESSAGES } from "./constants.js";

/**
 * Validate email address
 */
export function validateEmail(email) {
  if (!email || !email.trim()) {
    return "Email is required";
  }
  if (!VALIDATION_RULES.EMAIL.pattern.test(email)) {
    return VALIDATION_RULES.EMAIL.errorMessage;
  }
  return null;
}

/**
 * Validate password
 */
export function validatePassword(password) {
  if (!password) {
    return "Password is required";
  }
  if (password.length < VALIDATION_RULES.PASSWORD.minLength) {
    return VALIDATION_RULES.PASSWORD.errorMessage;
  }
  return null;
}

/**
 * Validate full name
 */
export function validateFullName(fullName) {
  if (!fullName || !fullName.trim()) {
    return "Full name is required";
  }
  const trimmed = fullName.trim();
  if (trimmed.length < VALIDATION_RULES.FULL_NAME.minLength) {
    return "Full name must be at least 2 characters";
  }
  if (trimmed.length > VALIDATION_RULES.FULL_NAME.maxLength) {
    return `Full name must be no more than ${VALIDATION_RULES.FULL_NAME.maxLength} characters`;
  }
  return null;
}

/**
 * Validate password confirmation
 */
export function validatePasswordConfirm(password, confirmPassword) {
  if (password !== confirmPassword) {
    return VALIDATION_RULES.CONFIRM_PASSWORD.errorMessage;
  }
  return null;
}

/**
 * Login form validation
 */
export function validateLoginForm(email, password) {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Signup form validation
 */
export function validateSignupForm(email, password, fullName) {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const fullNameError = validateFullName(fullName);

  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  if (fullNameError) errors.fullName = fullNameError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Password reset form validation
 */
export function validatePasswordResetForm(password, confirmPassword) {
  const errors = {};
  const passwordError = validatePassword(password);
  const confirmError = validatePasswordConfirm(password, confirmPassword);

  if (passwordError) errors.password = passwordError;
  if (confirmError) errors.confirmPassword = confirmError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Map API errors to user-friendly messages
 */
export function mapApiErrorToMessage(error, context = "general") {
  // Handle different error types
  if (error.response?.status === 409 && context === "signup") {
    return MESSAGES.EMAIL_IN_USE;
  }

  if (error.response?.status === 403 && context === "signup") {
    return MESSAGES.SIGNUP_ONLY_INITIAL;
  }

  if (error.response?.status === 401 && context === "reset-password") {
    return MESSAGES.INVALID_RESET_TOKEN;
  }

  if (error.response?.status === 401) {
    return MESSAGES.AUTH_ERROR;
  }

  if (error.message === "Network Error" || !window.navigator.onLine) {
    return MESSAGES.NETWORK_ERROR;
  }

  return error.message || MESSAGES.LOGIN_FAILED;
}

/**
 * Validate form field with real-time feedback
 * Returns error message or null
 */
export function validateField(fieldName, value, formData = {}) {
  switch (fieldName) {
    case "email":
      return validateEmail(value);
    case "password":
      return validatePassword(value);
    case "fullName":
      return validateFullName(value);
    case "confirmPassword":
      return validatePasswordConfirm(formData.password, value);
    default:
      return null;
  }
}
