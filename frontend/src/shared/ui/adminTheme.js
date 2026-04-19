/**
 * Admin Theme Tokens
 * Centralized color, spacing, and sizing constants for admin panel
 * Single source of truth for admin UI consistency
 */

export const adminTheme = {
  // Color Palette - Semantic names for reusability
  colors: {
    // Primary actions (Sign In, Save Draft)
    primary: "#0066cc",
    primaryLight: "#e8f2ff",
    primaryDark: "#004a99",

    // Success states (Publish, success messages)
    success: "#27ae60",
    successLight: "#d4edda",
    successDark: "#1e8449",

    // Destructive actions (Remove, Logout, danger messages)
    danger: "#e74c3c",
    dangerLight: "#f8d7da",
    dangerDark: "#c0392b",

    // Warnings (out of sync alerts)
    warning: "#ffb81c",
    warningLight: "#fff8e6",
    warningDark: "#e09b0f",

    // Text colors
    text: "#1a1a1a",
    textMuted: "#666",
    textLight: "#999",

    // UI elements
    border: "#ddd",
    borderLight: "#eee",
    surface: "#f9f9f9",
    background: "#f5f5f5",
    white: "#fff",

    // Form states
    error: {
      text: "#721c24",
      bg: "#f8d7da",
      border: "#f5c6cb",
    },
    success: {
      text: "#155724",
      bg: "#d4edda",
      border: "#c3e6cb",
    },
  },

  // Spacing Scale - Used for padding, margin, gaps
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    xxl: "3rem",
  },

  // Typography
  typography: {
    fontSize: {
      xs: "0.7rem",
      sm: "0.75rem",
      base: "0.875rem",
      lg: "1rem",
      xl: "1.25rem",
      xxl: "1.5rem",
      xxxl: "2rem",
    },
    fontWeight: {
      regular: 500,
      medium: 600,
      bold: 700,
    },
  },

  // Sizing preset for form inputs
  sizing: {
    inputHeight: "2.5rem",
    buttonSmall: {
      padding: "0.35rem 0.75rem",
      fontSize: "0.75rem",
      borderRadius: "3px",
    },
    buttonMedium: {
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      borderRadius: "4px",
    },
    buttonLarge: {
      padding: "0.75rem 1.5rem",
      fontSize: "1rem",
      borderRadius: "4px",
    },
    inputSmall: {
      padding: "0.75rem",
      fontSize: "0.875rem",
      borderRadius: "4px",
    },
    inputMedium: {
      padding: "0.75rem",
      fontSize: "1rem",
      borderRadius: "4px",
    },
  },

  // Reusable style presets
  styles: {
    // Primary action button (Sign In, Publish, etc.)
    buttonPrimary: {
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      backgroundColor: "#0066cc",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s",
    },

    // Destructive action button (Remove, Logout)
    buttonDanger: {
      padding: "0.75rem 1rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      backgroundColor: "#e74c3c",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s",
    },

    // Success action button (Publish)
    buttonSuccess: {
      padding: "0.75rem 1.5rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      backgroundColor: "#27ae60",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s",
    },

    // Small secondary button
    buttonSmall: {
      padding: "0.35rem 0.75rem",
      fontSize: "0.75rem",
      fontWeight: 600,
      backgroundColor: "#0066cc",
      color: "white",
      border: "none",
      borderRadius: "3px",
      cursor: "pointer",
    },

    // Form input
    input: {
      padding: "0.75rem",
      fontSize: "0.875rem",
      border: "1px solid #ddd",
      borderRadius: "4px",
      fontFamily: "inherit",
      width: "100%",
      boxSizing: "border-box",
      color: "#1a1a1a",
      backgroundColor: "#fff",
    },

    // Form label
    label: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#333",
    },

    // Required field indicator
    required: {
      color: "#e74c3c",
      marginLeft: "0.25rem",
    },
  },
};
