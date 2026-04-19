#!/usr/bin/env node

/**
 * Initial Admin Setup Script
 * 
 * Creates the first admin user for the application.
 * Run this once on fresh deployment to initialize the admin panel.
 * 
 * Usage:
 *   node scripts/setup-initial-admin.js
 */

import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import readline from "readline";

// Load .env BEFORE importing modules that depend on environment variables
const backendDir = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(backendDir, "../.env") });

// Dynamically import modules that depend on environment variables
const { getMongoDb } = await import("../src/lib/mongo.js");
const { initializeLogger, getLogger } = await import("../src/lib/logger.js");
const { hashPassword } = await import("../src/lib/auth.js");
const { createAdmin, findAdminByEmail } = await import("../src/repositories/admin.repository.js");

// Initialize logger
initializeLogger(true, "info");
const log = getLogger();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function validatePassword(password) {
  return password && password.length >= 8;
}

async function setupInitialAdmin() {
  console.log("\n========== AUTOMIVEX ADMIN SETUP ==========\n");

  try {
    // Ensure MongoDB is configured
    try {
      const db = await getMongoDb();
      log.info("MongoDB connection verified");
    } catch (err) {
      log.error({ err }, "MongoDB connection failed");
      console.error(
        "❌ Error: Cannot connect to MongoDB. Please verify MONGODB_URI and MONGODB_DB_NAME environment variables."
      );
      process.exit(1);
    }

    // Prompt for admin details
    console.log("Enter admin credentials for the first administrator.\n");

    let email = "";
    let emailValid = false;
    while (!emailValid) {
      email = await question("Email address: ");
      emailValid = await validateEmail(email);
      if (!emailValid) {
        console.log("❌ Invalid email format. Please try again.");
      }
    }

    // Check if admin already exists
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      console.log(`\n❌ Admin with email ${email} already exists.`);
      rl.close();
      process.exit(1);
    }

    let password = "";
    let passwordValid = false;
    while (!passwordValid) {
      password = await question("Password (minimum 8 characters): ");
      passwordValid = await validatePassword(password);
      if (!passwordValid) {
        console.log("❌ Password must be at least 8 characters. Please try again.");
      }
    }

    // Confirm password
    const passwordConfirm = await question("Confirm password: ");
    if (password !== passwordConfirm) {
      console.log("\n❌ Passwords do not match.");
      rl.close();
      process.exit(1);
    }

    const fullName = await question("Full name (optional): ");

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin
    console.log("\nCreating admin user...");
    const newAdmin = await createAdmin({
      email,
      passwordHash,
      fullName: fullName || null,
    });

    console.log("\n✅ Admin user created successfully!\n");
    console.log(`Email: ${newAdmin.email}`);
    console.log(`Name: ${newAdmin.fullName || "Not set"}`);
    console.log(`ID: ${newAdmin.id}\n`);

    console.log("You can now:");
    console.log("1. Start the backend server: npm run dev");
    console.log("2. Log in to the admin panel at /admin/login");
    console.log("3. Use your email and password to authenticate\n");

    rl.close();
    process.exit(0);
  } catch (error) {
    log.error({ err: error }, "Setup failed");
    console.error(`\n❌ Setup error: ${error.message}`);
    rl.close();
    process.exit(1);
  }
}

setupInitialAdmin();
