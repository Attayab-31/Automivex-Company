import FormField from "../FormField.jsx";
import { adminTheme } from "../../../shared/ui/adminTheme.js";

export default function TrustItemsEditor({ trustItems = [], onChange }) {
  const handleItemChange = (index, field, value) => {
    const updated = [...trustItems];
    updated[index][field] = value;
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Trust & Delivery Items</h2>

      {trustItems && trustItems.length === 0 ? (
        <p style={styles.emptyState}>No trust items. Items are managed from the backend configuration.</p>
      ) : (
        trustItems.map((item, index) => (
          <div key={index} style={styles.itemCard}>
            <h3 style={styles.itemIndex}>Item {index + 1}</h3>

            <FormField
              label="ID"
              value={item.id || ""}
              onChange={(value) => handleItemChange(index, "id", value)}
              placeholder="e.g., 'scope-clarity'"
            />

            <FormField
              label="Icon Key"
              value={item.iconKey || ""}
              onChange={(value) => handleItemChange(index, "iconKey", value)}
              placeholder="e.g., 'shield'"
            />

            <FormField
              label="Title"
              value={item.title || ""}
              onChange={(value) => handleItemChange(index, "title", value)}
              placeholder="Item title"
            />

            <FormField
              label="Summary"
              value={item.summary || ""}
              onChange={(value) => handleItemChange(index, "summary", value)}
              placeholder="Brief description"
              type="textarea"
              rows={2}
            />

            {item.commitments && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Commitments</h4>
                {item.commitments.map((commitment, cIndex) => (
                  <div key={cIndex} style={styles.subItem}>
                    <FormField
                      label={`Commitment ${cIndex + 1}`}
                      value={commitment}
                      onChange={(value) => {
                        const updated = [...trustItems];
                        updated[index].commitments[cIndex] = value;
                        onChange(updated);
                      }}
                      placeholder="Commitment statement"
                      type="textarea"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}

            {item.evidence && (
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Evidence</h4>
                {item.evidence.map((evidence, eIndex) => (
                  <div key={eIndex} style={styles.subItem}>
                    <FormField
                      label={`Evidence ${eIndex + 1}`}
                      value={evidence}
                      onChange={(value) => {
                        const updated = [...trustItems];
                        updated[index].evidence[eIndex] = value;
                        onChange(updated);
                      }}
                      placeholder="Evidence or proof"
                      type="textarea"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <div style={styles.infoBox}>
        <strong>Trust & Delivery Section</strong>
        <p>Items that show how scope, communication, and security are handled.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px" },
  title: {
    fontSize: adminTheme.typography.fontSize.xl,
    fontWeight: adminTheme.typography.fontWeight.medium,
    marginBottom: adminTheme.spacing.lg,
    color: adminTheme.colors.text,
  },
  itemCard: {
    padding: adminTheme.spacing.lg,
    marginBottom: adminTheme.spacing.lg,
    backgroundColor: adminTheme.colors.surface,
    borderRadius: "6px",
    border: `1px solid ${adminTheme.colors.borderLight}`,
  },
  itemIndex: {
    margin: `0 0 ${adminTheme.spacing.md} 0`,
    fontSize: adminTheme.typography.fontSize.lg,
    fontWeight: adminTheme.typography.fontWeight.medium,
    color: adminTheme.colors.text,
  },
  section: {
    marginTop: adminTheme.spacing.lg,
    paddingTop: adminTheme.spacing.lg,
    borderTop: `1px solid ${adminTheme.colors.border}`,
  },
  sectionTitle: {
    margin: `0 0 ${adminTheme.spacing.md} 0`,
    fontSize: adminTheme.typography.fontSize.base,
    fontWeight: adminTheme.typography.fontWeight.medium,
    color: adminTheme.colors.textMuted,
  },
  subItem: {
    marginBottom: adminTheme.spacing.md,
    padding: adminTheme.spacing.md,
    backgroundColor: adminTheme.colors.white,
    borderRadius: "4px",
    border: `1px solid ${adminTheme.colors.border}`,
  },
  emptyState: {
    padding: adminTheme.spacing.xl,
    textAlign: "center",
    color: adminTheme.colors.textLight,
    fontSize: adminTheme.typography.fontSize.base,
  },
  infoBox: {
    marginTop: adminTheme.spacing.xl,
    padding: adminTheme.spacing.md,
    backgroundColor: adminTheme.colors.primaryLight,
    borderRadius: "6px",
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.text,
  },
};
