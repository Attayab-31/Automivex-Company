import { z } from "zod";
import { getMongoDb } from "../lib/mongo.js";
import { getLogger } from "../lib/logger.js";

const COLLECTION_NAME = "admins";

/**
 * Admin User Schema
 * Stores bcrypt-hashed passwords, never plain text
 */
const adminDocumentSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  passwordHash: z.string().min(60), // bcryptjs hashed password
  fullName: z.string().min(1).max(200).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastLoginAt: z.date().nullable().optional(),
  isActive: z.boolean().default(true),
  passwordResetToken: z.string().optional(), // One-time password reset token
  passwordResetExpiresAt: z.date().optional(), // When the reset token expires
});

// AdminUser type (for JSDoc documentation)
// @typedef {Object} AdminUser
// @property {string} _id - MongoDB document ID
// @property {string} email - Admin email (unique)
// @property {string} passwordHash - bcryptjs hashed password
// @property {string} [fullName] - Admin's full name
// @property {Date} createdAt - Date admin was created
// @property {Date} updatedAt - Last update date
// @property {Date} [lastLoginAt] - Last login timestamp
// @property {boolean} isActive - Whether admin is active

/**
 * Initialize admin collection with indexes
 */
async function getAdminCollection() {
  const db = await getMongoDb();
  const collection = db.collection(COLLECTION_NAME);

  // Ensure email is unique
  await collection.createIndex({ email: 1 }, { unique: true });
  // Index for querying by active status
  await collection.createIndex({ isActive: 1 });

  return collection;
}

/**
 * Initialize password reset token collection with indexes
 */
async function getPasswordResetCollection() {
  const db = await getMongoDb();
  const collection = db.collection("password_reset_tokens");

  // Ensure token is unique and indexed for queries
  await collection.createIndex({ token: 1 }, { unique: true });
  // Index for admin ID to find reset requests
  await collection.createIndex({ adminId: 1 });
  // TTL index to auto-delete expired tokens (30 minutes)
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  return collection;
}

/**
 * Find admin by email
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findAdminByEmail(email) {
  const collection = await getAdminCollection();
  const admin = await collection.findOne({ email: email.toLowerCase() });

  if (!admin) {
    return null;
  }

  // Convert ObjectId to string for schema validation
  if (admin._id) {
    admin._id = admin._id.toString();
  }

  return adminDocumentSchema.parse(admin);
}

/**
 * Find admin by ID
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function findAdminById(id) {
  const collection = await getAdminCollection();
  const { ObjectId } = await import("mongodb");

  let adminId;
  try {
    adminId = new ObjectId(id);
  } catch {
    return null;
  }

  const admin = await collection.findOne({ _id: adminId });

  if (!admin) {
    return null;
  }

  // Convert ObjectId to string for schema validation
  if (admin._id) {
    admin._id = admin._id.toString();
  }

  return adminDocumentSchema.parse(admin);
}

/**
 * Create a new admin user
 * @param {object} data - { email, passwordHash, fullName? }
 * @returns {Promise<object>}
 */
export async function createAdmin(data) {
  const log = getLogger();
  const collection = await getAdminCollection();
  const timestamp = new Date();

  const document = {
    email: data.email.toLowerCase(),
    passwordHash: data.passwordHash,
    fullName: data.fullName || null,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLoginAt: null,
    isActive: true,
  };

  try {
    const result = await collection.insertOne(document);

    log.info({ adminEmail: data.email }, "admin_user_created");

    return {
      id: result.insertedId.toString(),
      email: document.email,
      fullName: document.fullName,
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("duplicate key")) {
      log.warn({ adminEmail: data.email }, "admin_email_already_exists");
      const err = new Error("Email already exists");
      err.statusCode = 409;
      throw err;
    }
    throw error;
  }
}

/**
 * Update last login timestamp
 * @param {string} adminId
 * @returns {Promise<void>}
 */
export async function updateLastLogin(adminId) {
  const collection = await getAdminCollection();
  const { ObjectId } = await import("mongodb");

  await collection.updateOne(
    { _id: new ObjectId(adminId) },
    {
      $set: {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      },
    }
  );
}

/**
 * List all active admins (for management)
 * @returns {Promise<array>}
 */
export async function listActiveAdmins() {
  const collection = await getAdminCollection();
  const admins = await collection
    .find({ isActive: true })
    .project({ passwordHash: 0 }) // Never return password hashes
    .toArray();

  return admins.map((admin) => ({
    id: admin._id?.toString(),
    email: admin.email,
    fullName: admin.fullName,
    createdAt: admin.createdAt,
    lastLoginAt: admin.lastLoginAt,
  }));
}

/**
 * Deactivate an admin user
 * @param {string} adminId
 * @returns {Promise<void>}
 */
export async function deactivateAdmin(adminId) {
  const collection = await getAdminCollection();
  const { ObjectId } = await import("mongodb");

  const result = await collection.updateOne(
    { _id: new ObjectId(adminId) },
    {
      $set: {
        isActive: false,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("Admin not found");
  }

  getLogger().info({ adminId }, "admin_deactivated");
}

/**
 * Reactivate an admin user
 * @param {string} adminId
 * @returns {Promise<void>}
 */
export async function reactivateAdmin(adminId) {
  const collection = await getAdminCollection();
  const { ObjectId } = await import("mongodb");

  const result = await collection.updateOne(
    { _id: new ObjectId(adminId) },
    {
      $set: {
        isActive: true,
        updatedAt: new Date(),
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("Admin not found");
  }

  getLogger().info({ adminId }, "admin_reactivated");
}

/**
 * Update admin password
 * @param {string} adminId
 * @param {string} passwordHash
 * @returns {Promise<void>}
 */
export async function updateAdminPassword(adminId, passwordHash) {
  const collection = await getAdminCollection();
  const { ObjectId } = await import("mongodb");

  const result = await collection.updateOne(
    { _id: new ObjectId(adminId) },
    {
      $set: {
        passwordHash,
        updatedAt: new Date(),
      },
      // Clear reset token after password change
      $unset: {
        passwordResetToken: "",
        passwordResetExpiresAt: "",
      },
    }
  );

  if (result.matchedCount === 0) {
    throw new Error("Admin not found");
  }

  getLogger().info({ adminId }, "admin_password_updated");
}

/**
 * Store a password reset token for an admin
 * @param {string} adminId
 * @param {string} token - Reset token (should be cryptographically random)
 * @param {number} expiryMinutes - How long token is valid (default: 30)
 * @returns {Promise<void>}
 */
export async function storePasswordResetToken(adminId, token, expiryMinutes = 30) {
  const collection = await getPasswordResetCollection();
  const { ObjectId } = await import("mongodb");

  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  await collection.insertOne({
    adminId: new ObjectId(adminId),
    token,
    createdAt: new Date(),
    expiresAt,
  });

  getLogger().info({ adminId, expiryMinutes }, "password_reset_token_generated");
}

/**
 * Verify a password reset token
 * @param {string} token
 * @returns {Promise<{adminId: string, email: string} | null>}
 */
export async function verifyPasswordResetToken(token) {
  const resetCollection = await getPasswordResetCollection();
  const adminCollection = await getAdminCollection();
  const { ObjectId } = await import("mongodb");

  // Find the reset token
  const resetRecord = await resetCollection.findOne({
    token,
    expiresAt: { $gt: new Date() }, // Must not be expired
  });

  if (!resetRecord) {
    getLogger().warn({ token: token.slice(0, 8) }, "password_reset_token_not_found_or_expired");
    return null;
  }

  // Find the admin
  const admin = await adminCollection.findOne({
    _id: resetRecord.adminId,
  });

  if (!admin) {
    getLogger().warn({ adminId: resetRecord.adminId }, "admin_not_found_for_reset_token");
    return null;
  }

  return {
    adminId: admin._id.toString(),
    email: admin.email,
  };
}

/**
 * Consume a password reset token (delete after use)
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function consumePasswordResetToken(token) {
  const collection = await getPasswordResetCollection();

  const result = await collection.deleteOne({ token });

  if (result.deletedCount === 0) {
    getLogger().warn({ token: token.slice(0, 8) }, "password_reset_token_not_found_for_deletion");
  } else {
    getLogger().info({ token: token.slice(0, 8) }, "password_reset_token_consumed");
  }
}

/**
 * Clear expired reset tokens for an admin
 * @param {string} adminId
 * @returns {Promise<void>}
 */
export async function clearResetTokens(adminId) {
  const collection = await getPasswordResetCollection();
  const { ObjectId } = await import("mongodb");

  await collection.deleteMany({
    adminId: new ObjectId(adminId),
  });

  getLogger().info({ adminId }, "password_reset_tokens_cleared");
}
