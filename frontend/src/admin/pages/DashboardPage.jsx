import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "../hooks/useAdminAuth.jsx";
import { adminApi } from "../api/adminApi.js";
import { useTimedMessage } from "@/hooks/useTimedMessage.js";
import { adminTheme } from "../../shared/ui/adminTheme.js";
import AdminAlert from "../components/AdminAlert.jsx";
import ContentEditor from "../components/ContentEditor.jsx";
import DraftPublishStatus from "../components/DraftPublishStatus.jsx";

export default function DashboardPage() {
  const queryClient = useQueryClient();
  const [draftContent, setDraftContent] = useState(null);
  const [publishedContent, setPublishedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { logout } = useAdminAuth();
  const { message: saveMessage, showMessage } = useTimedMessage();

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [draft, published] = await Promise.all([
        adminApi.getDraftContent(),
        adminApi.getPublished(),
      ]);
      setDraftContent(draft.content);
      setPublishedContent(published.content);
    } catch (err) {
      setError(err.message);
      // Check for auth errors and logout if needed
      if (err instanceof Error && (err.message === "Unauthorized" || err.status === 401)) {
        logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async (updatedContent) => {
    setIsSaving(true);
    setError(null);
    try {
      const result = await adminApi.saveDraft(updatedContent);
      setDraftContent(result.content);
      showMessage("Draft saved successfully!");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    console.log("Publish button clicked");
    if (!window.confirm("Are you sure you want to publish the current draft? This will update the live website.")) {
      console.log("Publish cancelled by user");
      return;
    }

    console.log("Publish confirmed, starting...");
    setIsPublishing(true);
    setError(null);
    try {
      console.log("Calling adminApi.publish()...");
      const result = await adminApi.publish();
      console.log("Publish result:", result);
      setPublishedContent(result.content);
      
      // Invalidate the public site content cache immediately
      // This forces the public website to refetch the new content
      console.log("Invalidating site-content cache...");
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      
      showMessage("✅ Content published successfully! The public website is now updated.");
      // Reload the draft after publishing
      console.log("Reloading content...");
      loadContent();
    } catch (err) {
      console.error("Publish error:", err);
      const errorMsg = err.message || JSON.stringify(err) || "Unknown error occurred";
      setError(`Publish failed: ${errorMsg}`);
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return <div style={styles.container}><p>Loading...</p></div>;
  }

  if (!draftContent) {
    return (
      <div style={styles.container}>
        <p>No draft content found. Please initialize the system first.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <button
          onClick={logout}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </div>

      <DraftPublishStatus
        draft={draftContent}
        published={publishedContent}
        isSaving={isSaving}
        isPublishing={isPublishing}
        onPublish={handlePublish}
        saveMessage={saveMessage}
        error={error}
      />

      <ContentEditor
        content={draftContent}
        onSave={handleSaveDraft}
        isSaving={isSaving}
      />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: adminTheme.spacing.xl,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: adminTheme.spacing.xl,
  },
  title: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: adminTheme.typography.fontWeight.bold,
    color: adminTheme.colors.text,
  },
  logoutButton: {
    ...adminTheme.styles.buttonDanger,
  },
};
