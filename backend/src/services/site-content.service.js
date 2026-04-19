import { siteContentBundleSchema } from "@automivex/shared/schemas";
import { isMongoConfigured, isMongoConnectionCoolingDown } from "../lib/mongo.js";
import {
  findPublishedSiteContent,
  findDraftSiteContent,
  saveDraftSiteContent,
  publishDraftSiteContent,
} from "../repositories/site-content.repository.js";

const unavailableMessage =
  "Published website content is currently unavailable. Please try again in a few moments.";

function buildUnavailableError(detail) {
  const error = new Error(detail);
  error.statusCode = 503;
  return error;
}

export function validateSiteContentInput(payload) {
  return siteContentBundleSchema.parse(payload);
}

/**
 * Get published site content for the public website.
 * Returns only published content - never falls back to draft or stale files.
 */
export async function getPublicSiteContent() {
  // If MongoDB is not configured or connection is cooling down, content is unavailable
  if (!isMongoConfigured() || isMongoConnectionCoolingDown()) {
    return {
      status: "unavailable",
      message: unavailableMessage,
    };
  }

  try {
    const publishedContent = await findPublishedSiteContent();

    if (!publishedContent) {
      return {
        status: "unavailable",
        message:
          "No published content has been configured yet. Contact the administrator.",
      };
    }

    return {
      status: "published",
      content: publishedContent,
    };
  } catch (error) {
    console.error("site_content_fetch_failed", {
      message: error.message,
    });

    return {
      status: "unavailable",
      message: unavailableMessage,
    };
  }
}

/**
 * Save draft content.
 * Used by admin API to update draft without publishing.
 */
export async function saveDraftContent(payload) {
  const parsedPayload = validateSiteContentInput(payload);

  if (!isMongoConfigured()) {
    throw buildUnavailableError(
      "MongoDB is required to save content. Configure MONGODB_URI and MONGODB_DB_NAME."
    );
  }

  return saveDraftSiteContent(parsedPayload);
}

/**
 * Get draft content.
 * Used by admin API to preview edits before publishing.
 */
export async function getDraftContent() {
  if (!isMongoConfigured()) {
    throw buildUnavailableError(
      "MongoDB is required to retrieve draft content. Configure MONGODB_URI and MONGODB_DB_NAME."
    );
  }

  const draft = await findDraftSiteContent();

  if (!draft) {
    // If no draft exists, return a copy of published as the starting point
    const published = await findPublishedSiteContent();
    return published || null;
  }

  return draft;
}

/**
 * Publish the current draft.
 * This is the main publish operation used both by CLI and future admin panel.
 */
export async function publishSiteContent() {
  if (!isMongoConfigured()) {
    throw buildUnavailableError(
      "MongoDB is required to publish content. Configure MONGODB_URI and MONGODB_DB_NAME."
    );
  }

  return publishDraftSiteContent();
}
