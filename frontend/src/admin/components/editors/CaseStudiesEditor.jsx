import FormField from "../FormField.jsx";
import { adminEditorStyles as styles } from "@/shared/ui/adminEditorStyles";

export default function CaseStudiesEditor({ caseStudies = [], onChange }) {
  const handleStudyChange = (index, field, value) => {
    const updated = [...caseStudies];
    updated[index][field] = value;
    onChange(updated);
  };

  const handleArrayChange = (studyIndex, arrayField, itemIndex, value) => {
    const updated = [...caseStudies];
    updated[studyIndex][arrayField][itemIndex] = value;
    onChange(updated);
  };

  const handleArrayAdd = (studyIndex, arrayField) => {
    const updated = [...caseStudies];
    if (!updated[studyIndex][arrayField]) {
      updated[studyIndex][arrayField] = [];
    }
    // For metrics, add object; for others, add string
    if (arrayField === "metrics") {
      updated[studyIndex][arrayField].push({ label: "", value: "" });
    } else {
      updated[studyIndex][arrayField].push("");
    }
    onChange(updated);
  };

  const handleArrayRemove = (studyIndex, arrayField, itemIndex) => {
    const updated = [...caseStudies];
    updated[studyIndex][arrayField].splice(itemIndex, 1);
    onChange(updated);
  };

  const handleMetricChange = (studyIndex, metricIndex, field, value) => {
    const updated = [...caseStudies];
    updated[studyIndex].metrics[metricIndex][field] = value;
    onChange(updated);
  };

  const handleAddStudy = () => {
    const newStudy = {
      slug: `case-study-${Date.now()}`,
      title: "New Case Study",
      client: "",
      sector: "",
      summary: "",
      before: "",
      after: "",
      scope: [],
      timeline: [],
      metrics: [],
      architecture: [],
      evidence: [],
      governance: {
        owner: "",
        lastReviewedAt: new Date().toISOString(),
        reviewCycle: "",
        evidenceSummary: "",
      },
    };
    onChange([...caseStudies, newStudy]);
  };

  const handleRemoveStudy = (index) => {
    const updated = caseStudies.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Case Studies</h2>
        <button onClick={handleAddStudy} style={styles.addButton}>
          + Add Case Study
        </button>
      </div>

      {caseStudies && caseStudies.length === 0 ? (
        <p style={styles.emptyState}>No case studies. Click "Add Case Study" to get started.</p>
      ) : (
        caseStudies.map((study, studyIndex) => (
          <div key={study.slug} style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardIndex}>Case Study {studyIndex + 1}</h3>
              <button
                onClick={() => handleRemoveStudy(studyIndex)}
                style={styles.removeButton}
              >
                Remove
              </button>
            </div>

            <FormField
              label="Title"
              value={study.title || ""}
              onChange={(value) => handleStudyChange(studyIndex, "title", value)}
              placeholder="Case study title"
            />

            <FormField
              label="Slug"
              value={study.slug || ""}
              onChange={(value) => handleStudyChange(studyIndex, "slug", value)}
              placeholder="URL-friendly slug"
            />

            <FormField
              label="Client"
              value={study.client || ""}
              onChange={(value) => handleStudyChange(studyIndex, "client", value)}
              placeholder="Client name or category"
            />

            <FormField
              label="Sector"
              value={study.sector || ""}
              onChange={(value) => handleStudyChange(studyIndex, "sector", value)}
              placeholder="Industry or sector"
            />

            <FormField
              label="Summary"
              value={study.summary || ""}
              onChange={(value) => handleStudyChange(studyIndex, "summary", value)}
              placeholder="Brief project overview"
              type="textarea"
              rows={2}
            />

            <FormField
              label="Before / Challenge"
              value={study.before || ""}
              onChange={(value) => handleStudyChange(studyIndex, "before", value)}
              placeholder="The situation before the project"
              type="textarea"
              rows={2}
            />

            <FormField
              label="After / Result"
              value={study.after || ""}
              onChange={(value) => handleStudyChange(studyIndex, "after", value)}
              placeholder="The situation after the project"
              type="textarea"
              rows={2}
            />

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>Project Scope</h4>
                <button
                  onClick={() => handleArrayAdd(studyIndex, "scope")}
                  style={styles.smallButton}
                >
                  + Add Item
                </button>
              </div>
              {(study.scope || []).map((item, itemIndex) => (
                <div key={itemIndex} style={styles.arrayItem}>
                  <FormField
                    label={`Scope Item ${itemIndex + 1}`}
                    value={item || ""}
                    onChange={(value) => handleArrayChange(studyIndex, "scope", itemIndex, value)}
                    placeholder="e.g., 'API integration'"
                    type="textarea"
                    rows={1}
                  />
                  <button
                    onClick={() => handleArrayRemove(studyIndex, "scope", itemIndex)}
                    style={styles.removeItemButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>Project Timeline</h4>
                <button
                  onClick={() => handleArrayAdd(studyIndex, "timeline")}
                  style={styles.smallButton}
                >
                  + Add Phase
                </button>
              </div>
              {(study.timeline || []).map((item, itemIndex) => (
                <div key={itemIndex} style={styles.arrayItem}>
                  <FormField
                    label={`Phase ${itemIndex + 1}`}
                    value={item || ""}
                    onChange={(value) => handleArrayChange(studyIndex, "timeline", itemIndex, value)}
                    placeholder="e.g., 'Phase 1: Discovery (2 weeks)'"
                    type="textarea"
                    rows={1}
                  />
                  <button
                    onClick={() => handleArrayRemove(studyIndex, "timeline", itemIndex)}
                    style={styles.removeItemButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>Key Metrics</h4>
                <button
                  onClick={() => handleArrayAdd(studyIndex, "metrics")}
                  style={styles.smallButton}
                >
                  + Add Metric
                </button>
              </div>
              {(study.metrics || []).map((metric, metricIndex) => (
                <div key={metricIndex} style={styles.arrayItem}>
                  <FormField
                    label="Metric Label"
                    value={metric.label || ""}
                    onChange={(value) => handleMetricChange(studyIndex, metricIndex, "label", value)}
                    placeholder="e.g., 'Time Saved'"
                  />
                  <FormField
                    label="Metric Value"
                    value={metric.value || ""}
                    onChange={(value) => handleMetricChange(studyIndex, metricIndex, "value", value)}
                    placeholder="e.g., '40% annually'"
                  />
                  <button
                    onClick={() => handleArrayRemove(studyIndex, "metrics", metricIndex)}
                    style={styles.removeItemButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>Architecture / Tech Stack</h4>
                <button
                  onClick={() => handleArrayAdd(studyIndex, "architecture")}
                  style={styles.smallButton}
                >
                  + Add Item
                </button>
              </div>
              {(study.architecture || []).map((item, itemIndex) => (
                <div key={itemIndex} style={styles.arrayItem}>
                  <FormField
                    label={`Tech ${itemIndex + 1}`}
                    value={item || ""}
                    onChange={(value) => handleArrayChange(studyIndex, "architecture", itemIndex, value)}
                    placeholder="e.g., 'Node.js + PostgreSQL'"
                  />
                  <button
                    onClick={() => handleArrayRemove(studyIndex, "architecture", itemIndex)}
                    style={styles.removeItemButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div style={styles.section}>
              <div style={styles.sectionHeader}>
                <h4 style={styles.sectionTitle}>Evidence / Results</h4>
                <button
                  onClick={() => handleArrayAdd(studyIndex, "evidence")}
                  style={styles.smallButton}
                >
                  + Add Evidence
                </button>
              </div>
              {(study.evidence || []).map((item, itemIndex) => (
                <div key={itemIndex} style={styles.arrayItem}>
                  <FormField
                    label={`Evidence ${itemIndex + 1}`}
                    value={item || ""}
                    onChange={(value) => handleArrayChange(studyIndex, "evidence", itemIndex, value)}
                    placeholder="e.g., 'Dashboard shows 98% uptime'"
                    type="textarea"
                    rows={1}
                  />
                  <button
                    onClick={() => handleArrayRemove(studyIndex, "evidence", itemIndex)}
                    style={styles.removeItemButton}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div style={styles.infoBox}>
        <strong>Case Studies</strong>
        <p>Real client projects, challenges, and measurable outcomes.</p>
      </div>
    </div>
  );
}
