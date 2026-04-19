/**
 * Shared Admin Editor Styles
 * Consistent styling for all admin panel editor components
 * These styles are reused across QualificationEditor, CaseStudiesEditor, ServicesEditor, etc.
 */

export const adminEditorStyles = {
  // Container
  container: {
    maxWidth: "700px",
  },

  // Header section (title + add button)
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },

  // Section title
  title: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: 0,
  },

  // Primary action button (add item)
  addButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  // Card containing an item (question, case study, service)
  card: {
    padding: "1.5rem",
    marginBottom: "2rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    border: "1px solid #eee",
  },

  // Item header (title + remove button)
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },

  // Item index/title
  cardIndex: {
    margin: 0,
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1a1a1a",
  },

  // Destructive action button (remove item)
  removeButton: {
    padding: "0.5rem 1rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },

  // Subsection within an editor (e.g., "Project Scope" within case study)
  section: {
    marginTop: "1.5rem",
    paddingTop: "1.5rem",
    borderTop: "1px solid #e0e0e0",
  },

  // Subsection header
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },

  // Subsection title
  sectionTitle: {
    margin: 0,
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#333",
  },

  // Secondary action button (within subsection)
  smallButton: {
    padding: "0.35rem 0.75rem",
    fontSize: "0.75rem",
    fontWeight: "600",
    backgroundColor: "#0066cc",
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },

  // Item within an array (deliverable, metric, evidence, etc.)
  arrayItem: {
    padding: "1rem",
    marginBottom: "0.75rem",
    backgroundColor: "white",
    borderRadius: "4px",
    border: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },

  // Small remove button for array items
  removeItemButton: {
    alignSelf: "flex-start",
    padding: "0.35rem 0.75rem",
    fontSize: "0.7rem",
    fontWeight: "600",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer",
  },

  // Empty state message when no items exist
  emptyState: {
    padding: "2rem",
    textAlign: "center",
    color: "#999",
    fontSize: "0.875rem",
  },

  // Information box at bottom of editor
  infoBox: {
    marginTop: "2rem",
    padding: "1rem",
    backgroundColor: "#e8f4f8",
    borderRadius: "6px",
    fontSize: "0.875rem",
    color: "#333",
  },
};
