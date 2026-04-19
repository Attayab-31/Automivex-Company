import { adminEditorStyles as styles } from "@/shared/ui/adminEditorStyles";

/**
 * ListEditor Component
 * Generic, reusable editor for managing arrays of items (questions, case studies, services, etc.)
 * Handles common patterns: add, remove, update items with consistent UI.
 *
 * Usage:
 *   <ListEditor
 *     items={questions}
 *     onChange={setQuestions}
 *     renderItem={(item, index, handlers) => (
 *       <FormField
 *         label={`Item ${index + 1}`}
 *         value={item}
 *         onChange={(v) => handlers.update(index, v)}
 *       />
 *     )}
 *     title="Questions"
 *     addLabel="+ Add Question"
 *     onAdd={() => "New question"}
 *     emptyMessage="No questions configured"
 *     infoText="Questions asked during qualification."
 *   />
 *
 * @param {array} items - Array of items to edit
 * @param {function} onChange - Called when items change: onChange(newItems)
 * @param {function} renderItem - Render function: (item, index, handlers) => JSX
 *                                handlers = { update(index, val), remove(index) }
 * @param {string} title - Editor title
 * @param {string} addLabel - Text for add button
 * @param {function} onAdd - Callback to create new item: () => newItem
 * @param {string} [emptyMessage] - Message when no items exist
 * @param {string} [infoText] - Info box text at bottom
 * @param {object} [containerStyle] - Override container style
 */
export default function ListEditor({
  items = [],
  onChange,
  renderItem,
  title,
  addLabel,
  onAdd,
  emptyMessage = "No items configured",
  infoText = "",
  containerStyle = {},
}) {
  const handleAdd = () => {
    const newItem = onAdd();
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (index, value) => {
    const updated = [...items];
    updated[index] = value;
    onChange(updated);
  };

  const handleRemove = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handlers = { update: handleUpdate, remove: handleRemove };

  return (
    <div style={{ ...styles.container, ...containerStyle }}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <button onClick={handleAdd} style={styles.addButton}>
          {addLabel}
        </button>
      </div>

      {!items || items.length === 0 ? (
        <p style={styles.emptyState}>{emptyMessage}</p>
      ) : (
        items.map((item, index) => (
          <div key={index} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardIndex}>Item {index + 1}</h3>
              <button
                onClick={() => handleRemove(index)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>
            {renderItem(item, index, handlers)}
          </div>
        ))
      )}

      {infoText && (
        <div style={styles.infoBox}>
          <p>{infoText}</p>
        </div>
      )}
    </div>
  );
}
