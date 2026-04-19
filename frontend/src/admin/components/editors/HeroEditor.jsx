import FormField from "../FormField.jsx";
import { adminTheme } from "../../../shared/ui/adminTheme.js";

export default function HeroEditor({ hero, onChange }) {
  if (!hero) return <div>No hero content</div>;

  const handleChange = (field, value) => {
    const updated = { ...hero, [field]: value };
    onChange(updated);
  };

  const handleCtaChange = (ctaType, field, value) => {
    const updated = { ...hero };
    updated[ctaType] = { ...updated[ctaType], [field]: value };
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Hero Section</h2>
      
      <FormField
        label="Eyebrow Text"
        value={hero.eyebrow || ""}
        onChange={(value) => handleChange("eyebrow", value)}
        placeholder="e.g., 'AI Delivery | Automation | SaaS Builds'"
      />

      <FormField
        label="Main Title"
        value={hero.title || ""}
        onChange={(value) => handleChange("title", value)}
        placeholder="Main headline for the hero section"
        type="textarea"
        rows={3}
      />

      <FormField
        label="Description"
        value={hero.description || ""}
        onChange={(value) => handleChange("description", value)}
        placeholder="Hero description text"
        type="textarea"
        rows={2}
      />

      <FormField
        label="Primary CTA Text"
        value={hero.primaryCta?.label || ""}
        onChange={(value) => handleCtaChange("primaryCta", "label", value)}
        placeholder="e.g., 'Get a scoped plan'"
      />

      <FormField
        label="Primary CTA Link"
        value={hero.primaryCta?.href || ""}
        onChange={(value) => handleCtaChange("primaryCta", "href", value)}
        placeholder="e.g., '#book-call'"
      />

      <FormField
        label="Secondary CTA Text"
        value={hero.secondaryCta?.label || ""}
        onChange={(value) => handleCtaChange("secondaryCta", "label", value)}
        placeholder="e.g., 'Check project fit'"
      />

      <FormField
        label="Secondary CTA Link"
        value={hero.secondaryCta?.href || ""}
        onChange={(value) => handleCtaChange("secondaryCta", "href", value)}
        placeholder="e.g., '#assistant'"
      />

      <FormField
        label="Trust Line"
        value={hero.trustLine || ""}
        onChange={(value) => handleChange("trustLine", value)}
        placeholder="e.g., 'Clear scope before build starts...'"
      />

      <div style={styles.infoBox}>
        <strong>Hero Section Fields</strong>
        <p>Update the main hero section displayed at the top of the homepage.</p>
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
  infoBox: {
    marginTop: adminTheme.spacing.xl,
    padding: adminTheme.spacing.md,
    backgroundColor: adminTheme.colors.primaryLight,
    borderRadius: "6px",
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.text,
  },
};
