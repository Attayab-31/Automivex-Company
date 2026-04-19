/**
 * useForm Hook
 * Manages form state, validation, and submission
 * Reduces code duplication across form pages
 */

import { useState, useCallback, useReducer } from "react";

/**
 * Form state reducer
 */
function formReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return {
        ...state,
        values: { ...state.values, [action.payload.field]: action.payload.value },
      };

    case "SET_ERROR":
      return {
        ...state,
        errors: { ...state.errors, [action.payload.field]: action.payload.error },
      };

    case "SET_ERRORS":
      return { ...state, errors: action.payload };

    case "SET_TOUCHED":
      return {
        ...state,
        touched: { ...state.touched, [action.payload]: true },
      };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_SUBMIT_ERROR":
      return { ...state, submitError: action.payload };

    case "SET_SUBMIT_SUCCESS":
      return { ...state, submitSuccess: action.payload };

    case "RESET":
      return action.payload;

    default:
      return state;
  }
}

/**
 * Custom hook for form handling
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Form submission handler
 * @param {Function} validate - Validation function (optional)
 * @returns {Object} Form state and handlers
 */
export function useForm(initialValues, onSubmit, validate) {
  const [state, dispatch] = useReducer(formReducer, {
    values: initialValues,
    errors: {},
    touched: {},
    isLoading: false,
    submitError: null,
    submitSuccess: null,
  });

  // Update field value
  const setFieldValue = useCallback((field, value) => {
    dispatch({ type: "SET_FIELD", payload: { field, value } });
  }, []);

  // Set field as touched (for showing errors on blur)
  const setFieldTouched = useCallback((field) => {
    dispatch({ type: "SET_TOUCHED", payload: field });
  }, []);

  // Validate a single field
  const validateField = useCallback(
    (field) => {
      if (!validate) return;

      const error = validate(field, state.values[field], state.values);
      dispatch({ type: "SET_ERROR", payload: { field, error } });
    },
    [validate, state.values]
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    if (!validate) return true;

    const errors = {};
    Object.keys(state.values).forEach((field) => {
      const error = validate(field, state.values[field], state.values);
      if (error) {
        errors[field] = error;
      }
    });

    dispatch({ type: "SET_ERRORS", payload: errors });
    return Object.keys(errors).length === 0;
  }, [validate, state.values]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      dispatch({ type: "SET_SUBMIT_ERROR", payload: null });
      dispatch({ type: "SET_SUBMIT_SUCCESS", payload: null });

      // Validate form
      if (!validateForm()) {
        return false;
      }

      dispatch({ type: "SET_LOADING", payload: true });

      try {
        await onSubmit(state.values);
        dispatch({ type: "SET_SUBMIT_SUCCESS", payload: true });
        return true;
      } catch (error) {
        dispatch({
          type: "SET_SUBMIT_ERROR",
          payload: error.message || "An error occurred",
        });
        return false;
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [state.values, onSubmit, validateForm]
  );

  // Handle field change
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFieldValue(name, value);
    },
    [setFieldValue]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setFieldTouched(name);
      validateField(name);
    },
    [setFieldTouched, validateField]
  );

  // Reset form
  const reset = useCallback((values = initialValues) => {
    dispatch({
      type: "RESET",
      payload: {
        values: values || initialValues,
        errors: {},
        touched: {},
        isLoading: false,
        submitError: null,
        submitSuccess: null,
      },
    });
  }, [initialValues]);

  return {
    // State
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    isLoading: state.isLoading,
    submitError: state.submitError,
    submitSuccess: state.submitSuccess,

    // Handlers
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,

    // Utilities
    getFieldError: (field) => (state.touched[field] ? state.errors[field] : null),
    isFieldTouched: (field) => state.touched[field] || false,
    isDirty: JSON.stringify(state.values) !== JSON.stringify(initialValues),
  };
}
