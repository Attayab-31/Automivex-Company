import FormField from "../FormField.jsx";
import { adminTheme } from "../../../shared/ui/adminTheme.js";

export default function SiteConfigEditor({ config, onChange }) {
  if (!config) return <div>No site config</div>;

  const handleChange = (field, value) => {
    const updated = { ...config, [field]: value };
    onChange(updated);
  };

  const handleContactChange = (field, value) => {
    const updated = { ...config };
    updated.contact = { ...updated.contact, [field]: value };
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Site Configuration</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Basic Settings</h3>

        <FormField
          label="Brand Name"
          value={config.brand || ""}
          onChange={(value) => handleChange("brand", value)}
          placeholder="e.g., 'Automivex'"
        />

        <FormField
          label="Website URL"
          value={config.websiteUrl || ""}
          onChange={(value) => handleChange("websiteUrl", value)}
          placeholder="e.g., 'https://automivex.com'"
        />

        <FormField
          label="Page Title"
          value={config.title || ""}
          onChange={(value) => handleChange("title", value)}
          placeholder="Main page title"
        />

        <FormField
          label="Page Description"
          value={config.description || ""}
          onChange={(value) => handleChange("description", value)}
          placeholder="Meta description"
          type="textarea"
          rows={2}
        />
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Contact Information</h3>

        <FormField
          label="Primary Email"
          value={config.contact?.primaryEmail || ""}
          onChange={(value) => handleContactChange("primaryEmail", value)}
          placeholder="support@example.com"
          type="email"
        />

        <FormField
          label="Legal Email"
          value={config.contact?.legalEmail || ""}
          onChange={(value) => handleContactChange("legalEmail", value)}
          placeholder="legal@example.com"
          type="email"
        />

        <FormField
          label="Response Window"
          value={config.contact?.responseWindow || ""}
          onChange={(value) => handleContactChange("responseWindow", value)}
          placeholder="e.g., '24-48 hours'"
        />
      </div>

      <div style={styles.infoBox}>
        <strong>Site Configuration</strong>
        <p>Update basic site settings and contact information.</p>
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
    paddingBottom: adminTheme.spacing.lg,
    borderBottom: `1px solid ${adminTheme.colors.borderLight}`,
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
