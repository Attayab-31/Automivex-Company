import FormField from "../FormField.jsx";
import { adminTheme } from "../../../shared/ui/adminTheme.js";

export default function NavEditor({ nav = [], onChange }) {
  const handleItemChange = (index, field, value) => {
    const updated = [...nav];
    updated[index][field] = value;
    onChange(updated);
  };

  const handleAddItem = () => {
    const newItem = {
      label: "New Item",
      href: "#new",
    };
    onChange([...nav, newItem]);
  };

  const handleRemoveItem = (index) => {
    const updated = nav.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Navigation Items</h2>
        <button onClick={handleAddItem} style={styles.addButton}>
          + Add Item
        </button>
      </div>

      {nav && nav.length === 0 ? (
        <p style={styles.emptyState}>No navigation items. Click "Add Item" to get started.</p>
      ) : (
        nav.map((item, index) => (
          <div key={index} style={styles.itemCard}>
            <div style={styles.itemHeader}>
              <h3 style={styles.itemIndex}>Item {index + 1}</h3>
              <button
                onClick={() => handleRemoveItem(index)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>

            <FormField
              label="Label"
              value={item.label || ""}
              onChange={(value) => handleItemChange(index, "label", value)}
              placeholder="Navigation label"
            />

            <FormField
              label="Link"
              value={item.href || ""}
              onChange={(value) => handleItemChange(index, "href", value)}
              placeholder="e.g., '#services' or 'https://example.com'"
            />
          </div>
        ))
      )}

      <div style={styles.infoBox}>
        <strong>Navigation Items</strong>
        <p>Update the top navigation links on the website.</p>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: adminTheme.spacing.lg,
  },
  title: {
    fontSize: adminTheme.typography.fontSize.xl,
    fontWeight: adminTheme.typography.fontWeight.medium,
    color: adminTheme.colors.text,
    margin: 0,
  },
  addButton: {
    ...adminTheme.styles.buttonSuccess,
  },
  itemCard: {
    padding: adminTheme.spacing.lg,
    marginBottom: adminTheme.spacing.md,
    backgroundColor: adminTheme.colors.surface,
    borderRadius: "6px",
    border: `1px solid ${adminTheme.colors.borderLight}`,
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: adminTheme.spacing.md,
  },
  itemIndex: {
    margin: 0,
    fontSize: adminTheme.typography.fontSize.lg,
    fontWeight: adminTheme.typography.fontWeight.medium,
    color: adminTheme.colors.text,
  },
  removeButton: {
    ...adminTheme.styles.buttonDanger,
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
