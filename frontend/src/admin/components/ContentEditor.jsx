import { useState } from "react";
import { adminTheme } from "../../shared/ui/adminTheme.js";
import HeroEditor from "./editors/HeroEditor.jsx";
import WhyChooseEditor from "./editors/WhyChooseEditor.jsx";
import SiteConfigEditor from "./editors/SiteConfigEditor.jsx";
import ServicesEditor from "./editors/ServicesEditor.jsx";
import CaseStudiesEditor from "./editors/CaseStudiesEditor.jsx";
import ProofEditor from "./editors/ProofEditor.jsx";
import NavEditor from "./editors/NavEditor.jsx";
import QualificationEditor from "./editors/QualificationEditor.jsx";
import TrustItemsEditor from "./editors/TrustItemsEditor.jsx";

export default function ContentEditor({ content, onSave, isSaving }) {
  const [activeTab, setActiveTab] = useState("hero");
  const [hasChanges, setHasChanges] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const tabs = [
    { id: "hero", label: "Hero" },
    { id: "whyChoose", label: "Why Choose" },
    { id: "nav", label: "Navigation" },
    { id: "services", label: "Services" },
    { id: "caseStudies", label: "Case Studies" },
    { id: "trust", label: "Trust & Delivery" },
    { id: "proof", label: "Proof Metrics" },
    { id: "qualification", label: "Qualification" },
    { id: "siteConfig", label: "Site Config" },
  ];

  const handleContentChange = (fieldPath, value) => {
    const newContent = { ...editedContent };
    const keys = fieldPath.split(".");
    let current = newContent;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setEditedContent(newContent);
    setHasChanges(true);
  };

  const handleSave = async () => {
    await onSave(editedContent);
    setHasChanges(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              borderBottomColor: activeTab === tab.id ? "#0066cc" : "transparent",
              color: activeTab === tab.id ? "#0066cc" : "#666",
              fontWeight: activeTab === tab.id ? "600" : "500",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {activeTab === "hero" && (
          <HeroEditor
            hero={editedContent.hero}
            onChange={(value) => handleContentChange("hero", value)}
          />
        )}
        {activeTab === "whyChoose" && (
          <WhyChooseEditor
            whyChoose={editedContent.whyChoose}
            onChange={(value) => handleContentChange("whyChoose", value)}
          />
        )}
        {activeTab === "nav" && (
          <NavEditor
            nav={editedContent.nav}
            onChange={(value) => handleContentChange("nav", value)}
          />
        )}
        {activeTab === "services" && (
          <ServicesEditor
            services={editedContent.services}
            onChange={(value) => handleContentChange("services", value)}
          />
        )}
        {activeTab === "caseStudies" && (
          <CaseStudiesEditor
            caseStudies={editedContent.caseStudies}
            onChange={(value) => handleContentChange("caseStudies", value)}
          />
        )}
        {activeTab === "trust" && (
          <TrustItemsEditor
            trustItems={editedContent.trustItems}
            onChange={(value) => handleContentChange("trustItems", value)}
          />
        )}
        {activeTab === "proof" && (
          <ProofEditor
            proof={editedContent.proofSnapshot}
            onChange={(value) => handleContentChange("proofSnapshot", value)}
          />
        )}
        {activeTab === "qualification" && (
          <QualificationEditor
            questions={editedContent.qualificationQuestions}
            onChange={(value) => handleContentChange("qualificationQuestions", value)}
          />
        )}
        {activeTab === "siteConfig" && (
          <SiteConfigEditor
            config={editedContent.siteConfig}
            onChange={(value) => handleContentChange("siteConfig", value)}
          />
        )}
      </div>

      <div style={styles.footer}>
        <button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          style={{
            ...styles.saveButton,
            opacity: !hasChanges || isSaving ? 0.6 : 1,
          }}
        >
          {isSaving ? "Saving..." : "Save Draft"}
        </button>
        {hasChanges && (
          <span style={styles.unsavedIndicator}>⚠ You have unsaved changes</span>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: adminTheme.colors.white,
    borderRadius: "8px",
    border: `1px solid ${adminTheme.colors.borderLight}`,
    overflow: "hidden",
  },
  tabs: {
    display: "flex",
    borderBottom: `2px solid ${adminTheme.colors.borderLight}`,
    backgroundColor: "#fafafa",
  },
  tabButton: {
    padding: adminTheme.spacing.md,
    fontSize: adminTheme.typography.fontSize.base,
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    transition: "all 0.2s",
  },
  content: {
    padding: adminTheme.spacing.xl,
  },
  footer: {
    padding: `${adminTheme.spacing.lg} ${adminTheme.spacing.xl}`,
    borderTop: `1px solid ${adminTheme.colors.borderLight}`,
    backgroundColor: "#fafafa",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveButton: {
    ...adminTheme.styles.buttonPrimary,
  },
  unsavedIndicator: {
    fontSize: adminTheme.typography.fontSize.base,
    color: adminTheme.colors.danger,
    fontWeight: adminTheme.typography.fontWeight.bold,
  },
};
