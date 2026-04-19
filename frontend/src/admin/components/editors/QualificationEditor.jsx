import FormField from "../FormField.jsx";
import { adminEditorStyles } from "@/shared/ui/adminEditorStyles";
import { adminTheme } from "../../../shared/ui/adminTheme.js";

export default function QualificationEditor({ questions = [], onChange }) {
  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    onChange(updated);
  };

  const handleAddQuestion = () => {
    onChange([...questions, "New question"]);
  };

  const handleRemoveQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Qualification Questions</h2>
        <button onClick={handleAddQuestion} style={styles.addButton}>
          + Add Question
        </button>
      </div>

      {questions && questions.length === 0 ? (
        <p style={styles.emptyState}>No qualification questions configured.</p>
      ) : (
        questions.map((question, qIndex) => (
          <div key={qIndex} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardIndex}>Question {qIndex + 1}</h3>
              <button
                onClick={() => handleRemoveQuestion(qIndex)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>

            <FormField
              label="Question"
              value={question || ""}
              onChange={(value) => handleQuestionChange(qIndex, value)}
              placeholder="e.g., 'What do you need help building or improving?'"
              type="textarea"
              rows={2}
            />
          </div>
        ))
      )}

      <div style={styles.infoBox}>
        <strong>Qualification Questions</strong>
        <p>Questions asked during the qualification process to understand project fit.</p>
      </div>
    </div>
  );
}

// Merged styles: adminEditorStyles for structure + adminTheme for colors/spacing
const styles = {
  container: adminEditorStyles.container,
  header: adminEditorStyles.header,
  title: adminEditorStyles.title,
  addButton: adminEditorStyles.addButton,
  card: adminEditorStyles.card,
  cardHeader: adminEditorStyles.cardHeader,
  cardIndex: adminEditorStyles.cardIndex,
  removeButton: adminEditorStyles.removeButton,
  emptyState: adminEditorStyles.emptyState,
  infoBox: adminEditorStyles.infoBox,
};

