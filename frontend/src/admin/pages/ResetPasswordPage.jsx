import { useState, useCallback, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { adminApi } from "../api/adminApi.js";
import { adminTheme } from "../../shared/ui/adminTheme.js";
import AdminAlert from "../components/AdminAlert.jsx";

export default function ResetPasswordPage() {
  // Check if we're on the reset confirmation step (has token in URL)
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  // Step 1: Request reset with email
  const [step, setStep] = useState(resetToken ? 2 : 1);

  // Step 1 state
  const [email, setEmail] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // Step 2 state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const navigate = useNavigate();

  // Request password reset email
  const handleRequestReset = useCallback(
    async (e) => {
      e.preventDefault();
      setEmailError("");
      setEmailSuccess("");
      setEmailLoading(true);

      try {
        const result = await adminApi.requestPasswordReset(email);
        setEmailSuccess(
          "If an account exists with this email, a password reset link has been sent. Check your email for instructions."
        );
        setEmail("");

        // After showing success, redirect to login after delay
        setTimeout(() => {
          navigate("/admin/login", {
            state: { message: "Check your email for password reset instructions." },
          });
        }, 3000);
      } catch (err) {
        setEmailError(err.message || "Failed to send reset email");
        setEmailLoading(false);
      }
    },
    [email, navigate]
  );

  // Reset password with token
  const handleResetPassword = useCallback(
    async (e) => {
      e.preventDefault();
      setPasswordError("");
      setPasswordSuccess("");

      // Validation
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters");
        return;
      }

      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match");
        return;
      }

      setPasswordLoading(true);

      try {
        const result = await adminApi.resetPassword(resetToken, password);
        setPasswordSuccess("Password reset successful! Redirecting to login...");
        setPassword("");
        setConfirmPassword("");

        // Redirect to login after showing success
        setTimeout(() => {
          navigate("/admin/login", {
            state: { message: "Your password has been reset. Please log in with your new password." },
          });
        }, 2000);
      } catch (err) {
        if (err.response?.status === 401) {
          setPasswordError(
            "This password reset link has expired or is invalid. Please request a new one."
          );
        } else {
          setPasswordError(err.message || "Failed to reset password");
        }
        setPasswordLoading(false);
      }
    },
    [resetToken, password, confirmPassword, navigate]
  );

  // If no token, show reset request form
  if (step === 1) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Reset Your Password</h1>
          <p style={styles.subtitle}>
            Enter your admin email and we'll send you a link to reset your password
          </p>

          <form onSubmit={handleRequestReset} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="email" style={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                style={styles.input}
                disabled={emailLoading}
                required
                autoComplete="email"
              />
            </div>

            {emailError && <AdminAlert type="error">{emailError}</AdminAlert>}
            {emailSuccess && <AdminAlert type="success">{emailSuccess}</AdminAlert>}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: emailLoading ? 0.6 : 1,
              }}
              disabled={emailLoading}
            >
              {emailLoading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p style={styles.helpText}>
            Remember your password?{" "}
            <Link to="/admin/login" style={styles.linkInline}>
              Log in here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Reset password with token
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create New Password</h1>
        <p style={styles.subtitle}>Enter a new password for your account</p>

        {!resetToken && (
          <AdminAlert type="error">
            No reset token provided. Please use the link from your reset email.
          </AdminAlert>
        )}

        {resetToken && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="password" style={styles.label}>
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
                style={styles.input}
                disabled={passwordLoading}
                required
                minLength="8"
                autoComplete="new-password"
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="confirmPassword" style={styles.label}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={styles.input}
                disabled={passwordLoading}
                required
                minLength="8"
                autoComplete="new-password"
              />
            </div>

            {passwordError && <AdminAlert type="error">{passwordError}</AdminAlert>}
            {passwordSuccess && <AdminAlert type="success">{passwordSuccess}</AdminAlert>}

            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: passwordLoading ? 0.6 : 1,
              }}
              disabled={passwordLoading}
            >
              {passwordLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {!resetToken && (
          <div style={{ marginTop: adminTheme.spacing.lg }}>
            <Link to="/admin/reset-password" style={styles.linkBlock}>
              Request a new password reset link
            </Link>
          </div>
        )}
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
  linkBlock: {
    color: adminTheme.colors.primary,
    textDecoration: "none",
    fontWeight: adminTheme.typography.fontWeight.medium,
    display: "block",
    textAlign: "center",
    transition: "color 0.2s ease",
  },
};
