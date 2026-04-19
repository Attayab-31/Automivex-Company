import { z } from "zod";
import crypto from "crypto";

function emptyStringToUndefined(value) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

const optionalEnvString = () =>
  z.preprocess(emptyStringToUndefined, z.string().trim().min(1).optional());
const optionalEnvEmail = () =>
  z.preprocess(emptyStringToUndefined, z.string().trim().email().optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),
  TRUST_PROXY: z.coerce.number().int().min(0).max(1).default(1),
  CORS_ORIGINS: optionalEnvString(),
  CORS_ORIGIN: optionalEnvString(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_LEADS_TO_CONSOLE: z.string().optional().default("true"),
  MONGODB_URI: optionalEnvString(),
  MONGODB_DB_NAME: optionalEnvString(),
  MONGODB_APP_NAME: z.string().trim().min(1).default("automivex-backend"),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  MONGODB_RETRY_COOLDOWN_MS: z.coerce.number().int().nonnegative().default(30000),
  RESEND_API_KEY: optionalEnvString(),
  LEAD_NOTIFICATION_FROM: optionalEnvString(),
  LEAD_NOTIFICATION_TO: optionalEnvEmail(),
  ADMIN_TOKEN: optionalEnvString(), // Legacy: kept for CLI tools, not used in API
  JWT_SECRET: z.string().min(32).optional(), // REQUIRED in production; auto-generated in dev/test
  REDIS_URL: optionalEnvString(),  // REQUIRED in production for CSRF token storage
  COOKIE_SECRET: z.string().min(32).optional(), // For signed cookies (optional in dev, should be set in prod)
  FRONTEND_URL: optionalEnvString(),  // Frontend URL for password reset links
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("invalid_env", parsedEnv.error.flatten().fieldErrors);
  process.exit(1);
}

// Validate production-critical environment variables
if (parsedEnv.data.NODE_ENV === "production") {
  const productionErrors = [];
  
  if (!parsedEnv.data.JWT_SECRET) {
    productionErrors.push("JWT_SECRET is required in production");
  }
  
  if (!parsedEnv.data.REDIS_URL) {
    productionErrors.push("REDIS_URL is required in production (for CSRF token storage)");
  }
  
  if (!parsedEnv.data.MONGODB_URI || !parsedEnv.data.MONGODB_DB_NAME) {
    productionErrors.push("MONGODB_URI and MONGODB_DB_NAME are required in production");
  }
  
  if (productionErrors.length > 0) {
    console.error("❌ PRODUCTION ENVIRONMENT CONFIGURATION ERRORS:");
    productionErrors.forEach(err => console.error(`  - ${err}`));
    process.exit(1);
  }
}

// Generate a JWT secret for development/test if not provided
function getJwtSecret() {
  if (parsedEnv.data.JWT_SECRET) {
    return parsedEnv.data.JWT_SECRET;
  }

  // In production, JWT_SECRET is required
  if (parsedEnv.data.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is required in production");
  }

  // Auto-generate for development/test
  return crypto.randomBytes(32).toString("hex");
}

const rawCorsOrigins =
  parsedEnv.data.CORS_ORIGINS ||
  parsedEnv.data.CORS_ORIGIN ||
  "http://localhost:5173,http://127.0.0.1:5173";

export const env = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  isProduction: parsedEnv.data.NODE_ENV === "production",
  port: parsedEnv.data.PORT,
  trustProxy: Boolean(parsedEnv.data.TRUST_PROXY),
  corsOrigins: rawCorsOrigins
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  logLevel: parsedEnv.data.LOG_LEVEL,
  logLeadsToConsole: parsedEnv.data.LOG_LEADS_TO_CONSOLE !== "false",
  mongodbUri: parsedEnv.data.MONGODB_URI,
  mongodbDbName: parsedEnv.data.MONGODB_DB_NAME,
  mongodbAppName: parsedEnv.data.MONGODB_APP_NAME,
  mongodbServerSelectionTimeoutMs: parsedEnv.data.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
  mongodbRetryCooldownMs: parsedEnv.data.MONGODB_RETRY_COOLDOWN_MS,
  resendApiKey: parsedEnv.data.RESEND_API_KEY,
  leadNotificationFrom: parsedEnv.data.LEAD_NOTIFICATION_FROM,
  leadNotificationTo: parsedEnv.data.LEAD_NOTIFICATION_TO,
  adminToken: parsedEnv.data.ADMIN_TOKEN || "dev-admin-token-change-in-production",
  jwtSecret: getJwtSecret(),
  redisUrl: parsedEnv.data.REDIS_URL,
  cookieSecret: parsedEnv.data.COOKIE_SECRET || "dev-cookie-secret-change-in-production",
  frontendUrl: parsedEnv.data.FRONTEND_URL || "http://localhost:5173",
};
