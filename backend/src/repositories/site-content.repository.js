import { z } from "zod";
import { siteContentBundleSchema } from "@automivex/shared/schemas";
import { getMongoDb } from "../lib/mongo.js";

const COLLECTION_NAME = "siteContent";
const DOCUMENT_ID = "primary";
const PUBLISHED_KEY = "published";
const DRAFT_KEY = "draft";

const siteContentDocumentSchema = z.object({
  _id: z.string(),
  [DRAFT_KEY]: siteContentBundleSchema.optional(),
  [PUBLISHED_KEY]: siteContentBundleSchema.optional(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

/**
 * Transform MongoDB document for validation
 * Converts ObjectId to string for schema validation
 */
function transformSiteContentDocument(doc) {
  if (!doc) return null;
  
  return {
    ...doc,
    _id: doc._id ? doc._id.toString() : DOCUMENT_ID,  // ✅ Convert ObjectId to string
  };
}

/**
 * Find published site content.
 * Returns null if no published content exists.
 */
export async function findPublishedSiteContent() {
  const db = await getMongoDb();
  const collection = db.collection(COLLECTION_NAME);
  const document = await collection.findOne({ _id: DOCUMENT_ID });

  if (!document || !document[PUBLISHED_KEY]) {
    return null;
  }

  const parsedDocument = siteContentDocumentSchema.safeParse(transformSiteContentDocument(document));  // ✅ Transform before parse

  if (!parsedDocument.success) {
    throw new Error("Site content document is invalid.");
  }

  // Include the published timestamp so frontend can distinguish from draft
  const content = parsedDocument.data[PUBLISHED_KEY];
  return {
    ...content,
    updatedAt: document.publishedUpdatedAt || document.updatedAt,
  };
}

/**
 * Find draft site content.
 * Returns null if no draft exists.
 */
export async function findDraftSiteContent() {
  const db = await getMongoDb();
  const collection = db.collection(COLLECTION_NAME);
  const document = await collection.findOne({ _id: DOCUMENT_ID });

  if (!document || !document[DRAFT_KEY]) {
    return null;
  }

  const parsedDocument = siteContentDocumentSchema.safeParse(transformSiteContentDocument(document));  // ✅ Transform before parse

  if (!parsedDocument.success) {
    throw new Error("Site content document is invalid.");
  }

  // Include the draft timestamp so frontend can distinguish from published
  const content = parsedDocument.data[DRAFT_KEY];
  return {
    ...content,
    updatedAt: document.draftUpdatedAt || document.updatedAt,
  };
}

/**
 * Save draft content without affecting published content.
 */
export async function saveDraftSiteContent(content) {
  const db = await getMongoDb();
  const collection = db.collection(COLLECTION_NAME);
  const timestamp = new Date().toISOString();

  // Validate the content against schema
  const validatedContent = siteContentBundleSchema.parse(content);

  // Note: _id is inherently unique, so we don't specify unique: true
  await collection.createIndex({ _id: 1 });
  await collection.updateOne(
    { _id: DOCUMENT_ID },
    {
      $set: {
        [DRAFT_KEY]: validatedContent,
        draftUpdatedAt: timestamp,
        updatedAt: timestamp,
      },
      $setOnInsert: {
        _id: DOCUMENT_ID,
        createdAt: timestamp,
      },
    },
    { upsert: true }
  );

  return findDraftSiteContent();
}

/**
 * Publish draft content: copy draft to published, atomically.
 * Both states are validated before saving.
 * Also updates proof metrics publishedAt timestamp.
 */
export async function publishDraftSiteContent() {
  const db = await getMongoDb();
  const collection = db.collection(COLLECTION_NAME);
  const timestamp = new Date().toISOString();

  // Fetch the current document to get draft
  const document = await collection.findOne({ _id: DOCUMENT_ID });

  if (!document || !document[DRAFT_KEY]) {
    throw new Error("No draft content to publish.");
  }

  // Validate draft before publishing
  let validatedDraft = siteContentBundleSchema.parse(document[DRAFT_KEY]);

  // Update proof metrics publishedAt timestamp if they exist
  if (validatedDraft.proofSnapshot) {
    validatedDraft = {
      ...validatedDraft,
      proofSnapshot: {
        ...validatedDraft.proofSnapshot,
        publishedAt: timestamp,
      },
    };
  }

  // Atomic update: copy draft to published and sync timestamps
  await collection.updateOne(
    { _id: DOCUMENT_ID },
    {
      $set: {
        [PUBLISHED_KEY]: validatedDraft,
        publishedUpdatedAt: timestamp,
        draftUpdatedAt: timestamp, // Sync draft timestamp with published
        updatedAt: timestamp,
      },
    }
  );

  return findPublishedSiteContent();
}

/**
 * Initialize connection on first access
 */
