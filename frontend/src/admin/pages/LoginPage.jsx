import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth.jsx";
import { adminTheme } from "../../shared/ui/adminTheme.js";
import AdminAlert from "../components/AdminAlert.jsx";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/admin/dashboard");
      } else {
        setError("Authentication failed. Please check your credentials.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred during login");
      setIsLoading(false);
    }
  }, [email, password, login, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Automivex Admin</h1>
        <p style={styles.subtitle}>Content Management</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={styles.input}
              disabled={isLoading}
              required
              autoComplete="email"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={styles.input}
              disabled={isLoading}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <AdminAlert type="error">{error}</AdminAlert>}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.helpText}>
          Enter your admin email and password to access the content management dashboard.
        </p>

        <div style={styles.linksContainer}>
          <a href="/admin/signup" style={styles.link}>
            Don't have an account? Sign up
          </a>
          <span style={styles.linkSeparator}>•</span>
          <a href="/admin/reset-password" style={styles.link}>
            Forgot password?
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: adminTheme.colors.background,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    backgroundColor: adminTheme.colors.white,
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: adminTheme.spacing.xl,
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    margin: `0 0 ${adminTheme.spacing.sm} 0`,
    fontSize: "1.5rem",
    fontWeight: adminTheme.typography.fontWeight.bold,
    color: adminTheme.colors.text,
  },
  subtitle: {
    margin: `0 0 ${adminTheme.spacing.lg} 0`,
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.textMuted,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: adminTheme.spacing.md,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: adminTheme.spacing.sm,
  },
  label: {
    fontSize: adminTheme.typography.fontSize.base,
    fontWeight: adminTheme.typography.fontWeight.regular,
    color: "#333",
  },
  input: {
    ...adminTheme.styles.input,
    fontSize: adminTheme.typography.fontSize.lg,
  },
  button: {
    ...adminTheme.styles.buttonPrimary,
  },
  helpText: {
    marginTop: adminTheme.spacing.md,
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.textMuted,
    textAlign: "center",
  },
  linksContainer: {
    marginTop: adminTheme.spacing.lg,
    paddingTop: adminTheme.spacing.md,
    borderTop: `1px solid ${adminTheme.colors.borderLight}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: adminTheme.spacing.sm,
    fontSize: adminTheme.typography.fontSize.base,
  },
  link: {
    color: adminTheme.colors.primary,
    textDecoration: "none",
    fontWeight: adminTheme.typography.fontWeight.medium,
    transition: "color 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      color: adminTheme.colors.primaryDark,
    },
  },
  linkSeparator: {
    color: adminTheme.colors.borderLight,
  },
};
