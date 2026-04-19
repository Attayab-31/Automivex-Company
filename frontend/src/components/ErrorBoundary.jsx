import React from "react";

/**
 * ErrorBoundary Component
 * Catches unhandled errors in React components and displays a fallback UI
 * Prevents blank screens by gracefully handling component crashes
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.box}>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.message}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <pre style={styles.error}>{this.state.error?.toString()}</pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={styles.button}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    padding: "2rem",
  },
  box: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    textAlign: "center",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#e74c3c",
    margin: "0 0 1rem 0",
  },
  message: {
    fontSize: "1rem",
    color: "#666",
    margin: "0 0 1rem 0",
  },
  error: {
    backgroundColor: "#f9f9f9",
    padding: "1rem",
    borderRadius: "4px",
    overflow: "auto",
    maxHeight: "200px",
    textAlign: "left",
    fontSize: "0.875rem",
    marginBottom: "1rem",
    color: "#333",
    border: "1px solid #e0e0e0",
  },
  button: {
    padding: "0.75rem 1.5rem",
    fontSize: "1rem",
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
