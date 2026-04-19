import { adminTheme } from "../../shared/ui/adminTheme.js";
import AdminAlert from "./AdminAlert.jsx";

export default function DraftPublishStatus({
  draft,
  published,
  isSaving,
  isPublishing,
  onPublish,
  saveMessage,
  error,
}) {
  const draftDate = draft?.updatedAt ? new Date(draft.updatedAt).toLocaleString() : "Never";
  const publishedDate = published?.updatedAt ? new Date(published.updatedAt).toLocaleString() : "Never";

  const isDraftOutOfSync = draft?.updatedAt !== published?.updatedAt;

  // Debug logging
  if (draft?.updatedAt && published?.updatedAt) {
    console.log("Draft/Published sync check:", {
      draftUpdatedAt: draft.updatedAt,
      publishedUpdatedAt: published.updatedAt,
      isDraftOutOfSync,
    });
  }

  return (
    <div style={styles.container}>
      <div style={styles.statusGrid}>
        <div style={styles.statusCard}>
          <h3 style={styles.statusTitle}>Draft</h3>
          <p style={styles.statusDate}>Updated: {draftDate}</p>
          <p style={styles.statusInfo}>
            {isDraftOutOfSync ? "Not published" : "Published"}
          </p>
        </div>

        <div style={styles.statusCard}>
          <h3 style={styles.statusTitle}>Published</h3>
          <p style={styles.statusDate}>Updated: {publishedDate}</p>
          <p style={styles.statusInfo}>Live on website</p>
        </div>
      </div>

      {isDraftOutOfSync && (
        <AdminAlert type="warning">
          Your draft has unpublished changes
        </AdminAlert>
      )}

      <div style={styles.actions}>
        <button
          onClick={onPublish}
          disabled={isPublishing || !isDraftOutOfSync}
          style={{
            ...styles.publishButton,
            opacity: isPublishing || !isDraftOutOfSync ? 0.6 : 1,
          }}
        >
          {isPublishing ? "Publishing..." : "Publish Draft"}
        </button>
      </div>

      {saveMessage && (
        <AdminAlert type="success">{saveMessage}</AdminAlert>
      )}

      {error && (
        <AdminAlert type="error">{error}</AdminAlert>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: adminTheme.spacing.xl,
    padding: adminTheme.spacing.lg,
    backgroundColor: adminTheme.colors.white,
    borderRadius: "8px",
    border: `1px solid ${adminTheme.colors.borderLight}`,
  },
  statusGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: adminTheme.spacing.md,
    marginBottom: adminTheme.spacing.md,
  },
  statusCard: {
    padding: adminTheme.spacing.md,
    backgroundColor: adminTheme.colors.surface,
    borderRadius: "6px",
    border: `1px solid ${adminTheme.colors.borderLight}`,
  },
  statusTitle: {
    margin: `0 0 ${adminTheme.spacing.sm} 0`,
    fontSize: adminTheme.typography.fontSize.lg,
    fontWeight: adminTheme.typography.fontWeight.medium,
    color: adminTheme.colors.text,
  },
  statusDate: {
    margin: `${adminTheme.spacing.sm} 0`,
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.textMuted,
  },
  statusInfo: {
    margin: `${adminTheme.spacing.sm} 0`,
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.textMuted,
  },
  actions: {
    display: "flex",
    gap: adminTheme.spacing.md,
    marginBottom: adminTheme.spacing.md,
  },
  publishButton: {
    ...adminTheme.styles.buttonSuccess,
  },
};
