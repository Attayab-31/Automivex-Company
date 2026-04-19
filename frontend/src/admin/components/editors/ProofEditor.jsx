import FormField from "../FormField.jsx";
import { adminTheme } from "../../../shared/ui/adminTheme.js";

export default function ProofEditor({ proof, onChange }) {
  if (!proof) return <div>No proof metrics</div>;

  const handleChange = (field, value) => {
    const updated = { ...proof };
    // Convert number fields from string if needed
    if (["projectsDelivered", "workflowsAutomated", "clientSatisfaction", "averageResponseHours"].includes(field)) {
      updated[field] = parseInt(value, 10) || 0;
    } else {
      updated[field] = value;
    }
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Proof Metrics</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Delivery Metrics</h3>

        <FormField
          label="Projects Delivered"
          value={proof.projectsDelivered?.toString() || ""}
          onChange={(value) => handleChange("projectsDelivered", value)}
          placeholder="e.g., '18'"
          type="number"
        />

        <FormField
          label="Workflows Automated"
          value={proof.workflowsAutomated?.toString() || ""}
          onChange={(value) => handleChange("workflowsAutomated", value)}
          placeholder="e.g., '42'"
          type="number"
        />

        <FormField
          label="Client Satisfaction (%)"
          value={proof.clientSatisfaction?.toString() || ""}
          onChange={(value) => handleChange("clientSatisfaction", value)}
          placeholder="0-100"
          type="number"
        />

        <FormField
          label="Average Response Time (hours)"
          value={proof.averageResponseHours?.toString() || ""}
          onChange={(value) => handleChange("averageResponseHours", value)}
          placeholder="e.g., '24'"
          type="number"
        />
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Publication Metadata</h3>

        <FormField
          label="Published At"
          value={proof.publishedAt || ""}
          onChange={(value) => handleChange("publishedAt", value)}
          placeholder="ISO date (auto-set)"
          disabled
        />

        <FormField
          label="Source Label"
          value={proof.sourceLabel || ""}
          onChange={(value) => handleChange("sourceLabel", value)}
          placeholder="e.g., 'Internally verified delivery snapshot'"
          type="textarea"
          rows={2}
        />
      </div>

      <div style={styles.infoBox}>
        <strong>Proof Metrics</strong>
        <p>Update delivery metrics. These metrics are displayed on the homepage to showcase track record.</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
  },
  title: {
    fontSize: adminTheme.typography.fontSize.xl,
    fontWeight: adminTheme.typography.fontWeight.medium,
    marginBottom: adminTheme.spacing.lg,
    color: adminTheme.colors.text,
  },
  section: {
    marginBottom: adminTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: adminTheme.typography.fontSize.lg,
    fontWeight: adminTheme.typography.fontWeight.medium,
    marginBottom: adminTheme.spacing.md,
    color: adminTheme.colors.text,
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
