/**
 * Enhanced Reusable Form Field Component
 * Standardized form input with label, error display, and consistent styling
 * Supports: text, email, password, number, textarea
 */

import { adminTheme } from "../../shared/ui/adminTheme.js";

export default function FormField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  disabled = false,
  required = false,
  autoComplete,
  minLength,
  maxLength,
  pattern,
  rows = 4,
  helperText,
  className,
}) {
  const getInputStyles = () => {
    const baseStyle = {
      width: "100%",
      padding: "0.75rem 0.875rem",
      fontSize: adminTheme.typography.fontSize.base,
      border: `1px solid ${error ? adminTheme.colors.danger : adminTheme.colors.borderLight}`,
      borderRadius: adminTheme.spacing.xs,
      backgroundColor: disabled ? adminTheme.colors.surface : adminTheme.colors.white,
      color: adminTheme.colors.text,
      fontFamily: "system-ui, -apple-system, sans-serif",
      transition: "border-color 0.2s, box-shadow 0.2s",
      boxSizing: "border-box",
    };

    if (disabled) {
      return { ...baseStyle, opacity: 0.6, cursor: "not-allowed" };
    }

    return baseStyle;
  };

  const styles = {
    container: {
      marginBottom: adminTheme.spacing.md,
    },
    label: {
      display: "block",
      marginBottom: adminTheme.spacing.xs,
      fontSize: adminTheme.typography.fontSize.base,
      fontWeight: adminTheme.typography.fontWeight.medium,
      color: adminTheme.colors.text,
    },
    labelRequired: {
      color: adminTheme.colors.danger,
      marginLeft: "0.25rem",
    },
    input: getInputStyles(),
    textarea: {
      ...getInputStyles(),
      minHeight: `${rows * 24}px`,
      resize: "vertical",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    error: {
      marginTop: adminTheme.spacing.xs,
      fontSize: adminTheme.typography.fontSize.sm,
      color: adminTheme.colors.danger,
      fontWeight: adminTheme.typography.fontWeight.medium,
    },
    helper: {
      marginTop: adminTheme.spacing.xs,
      fontSize: adminTheme.typography.fontSize.sm,
      color: adminTheme.colors.textMuted,
    },
  };

  const handleFocus = (e) => {
    const focusStyles = {
      borderColor: error ? adminTheme.colors.danger : adminTheme.colors.primary,
      boxShadow: `0 0 0 3px ${
        error ? `${adminTheme.colors.danger}20` : `${adminTheme.colors.primary}20`
      }`,
    };
    Object.assign(e.target.style, focusStyles);
  };

  const handleBlur = (e) => {
    // Remove focus styles
    e.target.style.boxShadow = "";
    onBlur?.(e);
  };

  const commonInputProps = {
    id,
    value,
    onChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    placeholder,
    disabled,
    required,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-error` : helperText ? `${id}-helper` : undefined,
  };

  return (
    <div style={styles.container} className={className}>
      {label && (
        <label htmlFor={id} style={styles.label}>
          {label}
          {required && <span style={styles.labelRequired}>*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          {...commonInputProps}
          rows={rows}
          style={styles.textarea}
        />
      ) : (
        <input
          {...commonInputProps}
          type={type}
          style={styles.input}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          pattern={pattern}
        />
      )}

      {error && (
        <div id={`${id}-error`} style={styles.error} role="alert">
          {error}
        </div>
      )}

      {helperText && !error && (
        <div id={`${id}-helper`} style={styles.helper}>
          {helperText}
        </div>
      )}
    </div>
  );
}
