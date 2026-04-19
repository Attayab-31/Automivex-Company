import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuth } from "../hooks/useAdminAuth.jsx";
import { adminApi } from "../api/adminApi.js";
import { adminTheme } from "../../shared/ui/adminTheme.js";
import AdminAlert from "../components/AdminAlert.jsx";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setIsLoading(true);

      try {
        // Password validation
        if (password.length < 8) {
          setError("Password must be at least 8 characters long");
          setIsLoading(false);
          return;
        }

        if (fullName.trim().length < 2) {
          setError("Full name must be at least 2 characters");
          setIsLoading(false);
          return;
        }

        // Call signup endpoint
        const result = await adminApi.signup(email, password, fullName);

        setSuccess("Admin account created successfully! You are now logged in.");

        // Wait a moment to show success message
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1500);
      } catch (err) {
        if (err.response?.status === 409) {
          setError("Email already in use. Please use a different email address.");
        } else if (err.response?.status === 403) {
          setError("Admin signup is only available for initial setup.");
        } else {
          setError(err.message || "Failed to create admin account");
        }
        setIsLoading(false);
      }
    },
    [email, password, fullName, navigate]
  );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create Admin Account</h1>
        <p style={styles.subtitle}>Set up the first administrator account</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="fullName" style={styles.label}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              style={styles.input}
              disabled={isLoading}
              required
              minLength="2"
              maxLength="200"
            />
          </div>

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
              placeholder="Enter a secure password (min 8 characters)"
              style={styles.input}
              disabled={isLoading}
              required
              minLength="8"
              autoComplete="new-password"
            />
          </div>

          {error && <AdminAlert type="error">{error}</AdminAlert>}
          {success && <AdminAlert type="success">{success}</AdminAlert>}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: isLoading ? 0.6 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.helpText}>
          Already have an admin account?{" "}
          <Link to="/admin/login" style={styles.linkInline}>
            Log in here
          </Link>
        </p>
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
    padding: adminTheme.spacing.md,
  },
  card: {
    backgroundColor: adminTheme.colors.white,
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: adminTheme.spacing.xl,
    width: "100%",
    maxWidth: "450px",
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
    marginTop: adminTheme.spacing.lg,
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.textMuted,
    textAlign: "center",
    margin: "0",
  },
  linkInline: {
    color: adminTheme.colors.primary,
    textDecoration: "none",
    fontWeight: adminTheme.typography.fontWeight.medium,
    transition: "color 0.2s ease",
  },
};
