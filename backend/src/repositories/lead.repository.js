import { z } from "zod";
import { getMongoDb } from "../lib/mongo.js";

const COLLECTION_NAME = "leads";

const leadDocumentSchema = z.object({
  source: z.literal("website"),
  status: z.literal("new"),
  requestId: z.string().trim().min(1).max(120),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  emailDomain: z.string().trim().min(1).max(120),
  service: z.string().trim().min(2).max(120),
  budget: z.string().trim().min(2).max(80),
  details: z.string().trim().min(10).max(2500),
  origin: z.string().trim().min(1).max(300).nullable().optional(),
  userAgent: z.string().trim().min(1).max(500).nullable().optional(),
  ipAddress: z.string().trim().min(1).max(120).nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

async function getLeadCollection() {
  const db = await getMongoDb();
  const collection = db.collection(COLLECTION_NAME);

  await Promise.all([
    collection.createIndex({ createdAt: -1 }),
    collection.createIndex({ status: 1, createdAt: -1 }),
    collection.createIndex({ email: 1, createdAt: -1 }),
  ]);

  return collection;
}

export async function createLeadSubmission(lead) {
  const collection = await getLeadCollection();
  const timestamp = new Date();

  const document = leadDocumentSchema.parse({
    source: "website",
    status: "new",
    ...lead,
    origin: lead.origin ?? null,
    userAgent: lead.userAgent ?? null,
    ipAddress: lead.ipAddress ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  const result = await collection.insertOne(document);

  return {
    id: result.insertedId.toString(),
    createdAt: document.createdAt,
  };
}
