import FormField from "../FormField.jsx";
import { adminTheme } from "../../../shared/ui/adminTheme.js";

export default function WhyChooseEditor({ whyChoose, onChange }) {
  if (!whyChoose) return <div>No why choose content</div>;

  const handleChange = (field, value) => {
    const updated = { ...whyChoose, [field]: value };
    onChange(updated);
  };

  const handlePointChange = (index, field, value) => {
    const updated = { ...whyChoose };
    updated.points[index][field] = value;
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Why Choose Section</h2>

      <FormField
        label="Eyebrow Text"
        value={whyChoose.eyebrow || ""}
        onChange={(value) => handleChange("eyebrow", value)}
        placeholder="e.g., 'Why Automivex'"
      />

      <FormField
        label="Title"
        value={whyChoose.title || ""}
        onChange={(value) => handleChange("title", value)}
        placeholder="Section title"
        type="textarea"
        rows={2}
      />

      <FormField
        label="Description"
        value={whyChoose.description || ""}
        onChange={(value) => handleChange("description", value)}
        placeholder="Section description"
        type="textarea"
        rows={3}
      />

      <div style={styles.pointsSection}>
        <h3 style={styles.pointsTitle}>Why Choose Points</h3>
        {whyChoose.points && whyChoose.points.map((point, index) => (
          <div key={index} style={styles.pointCard}>
            <h4 style={styles.pointNumber}>Point {index + 1}</h4>
            <FormField
              label="Title"
              value={point.title || ""}
              onChange={(value) => handlePointChange(index, "title", value)}
              placeholder="Point title"
            />
            <FormField
              label="Description"
              value={point.description || ""}
              onChange={(value) => handlePointChange(index, "description", value)}
              placeholder="Point description"
              type="textarea"
              rows={2}
            />
          </div>
        ))}
      </div>

      <div style={styles.infoBox}>
        <strong>Why Choose Section</strong>
        <p>Update the reasons why customers should choose Automivex.</p>
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
  pointsSection: {
    marginTop: adminTheme.spacing.xl,
  },
  pointsTitle: {
    fontSize: adminTheme.typography.fontSize.lg,
    fontWeight: adminTheme.typography.fontWeight.medium,
    marginBottom: adminTheme.spacing.md,
    color: adminTheme.colors.text,
  },
  pointCard: {
    padding: adminTheme.spacing.md,
    marginBottom: adminTheme.spacing.md,
    backgroundColor: adminTheme.colors.surface,
    borderRadius: "6px",
    border: `1px solid ${adminTheme.colors.borderLight}`,
  },
  pointNumber: {
    margin: `0 0 ${adminTheme.spacing.md} 0`,
    fontSize: adminTheme.typography.fontSize.base,
    fontWeight: adminTheme.typography.fontWeight.medium,
    color: adminTheme.colors.textMuted,
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
