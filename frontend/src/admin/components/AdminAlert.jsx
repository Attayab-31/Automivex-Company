import { adminTheme } from "../../shared/ui/adminTheme.js";

export default function AdminAlert({
  type = "info",
  children,
  dismissible = false,
  onDismiss,
}) {
  const typeStyles = {
    success: {
      bg: "#d4edda",
      text: "#155724",
      border: "#c3e6cb",
      icon: "✓",
    },
    error: {
      bg: "#f8d7da",
      text: "#721c24",
      border: "#f5c6cb",
      icon: "✕",
    },
    warning: {
      bg: "#fff8e6",
      text: "#333",
      border: "#ffb81c",
      icon: "⚠",
    },
    info: {
      bg: "#e8f2ff",
      text: "#004a99",
      border: "#0066cc",
      icon: "ⓘ",
    },
  };

  const alertStyle = typeStyles[type] || typeStyles.info;

  const styles = {
    container: {
      padding: "0.75rem 1rem",
      marginBottom: "1rem",
      backgroundColor: alertStyle.bg,
      color: alertStyle.text,
      borderRadius: "4px",
      fontSize: "0.875rem",
      borderLeft: `4px solid ${alertStyle.border}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "1rem",
    },
    content: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      flex: 1,
    },
    icon: {
      fontWeight: "bold",
      fontSize: "1rem",
    },
    dismissButton: {
      background: "none",
      border: "none",
      color: alertStyle.text,
      cursor: "pointer",
      fontSize: "1.25rem",
      padding: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "1.5rem",
      height: "1.5rem",
      opacity: 0.7,
      transition: "opacity 0.2s",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <span style={styles.icon}>{alertStyle.icon}</span>
        <span>{children}</span>
      </div>
      {dismissible && (
        <button
          style={styles.dismissButton}
          onClick={onDismiss}
          onMouseEnter={(e) => (e.target.style.opacity = 1)}
          onMouseLeave={(e) => (e.target.style.opacity = 0.7)}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}
