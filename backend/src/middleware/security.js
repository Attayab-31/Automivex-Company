import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { env } from "../config/env.js";

const allowedOrigins = new Set(env.corsOrigins);

function buildCorsError() {
  const error = new Error("Origin is not allowed.");
  error.statusCode = 403;
  return error;
}

function buildLimitHandler(message) {
  return (req, res, _next, options) => {
    res.status(options.statusCode).json({
      error: message,
      requestId: req.id,
    });
  };
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 180 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildLimitHandler("Too many requests. Please try again later."),
});

export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 35 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildLimitHandler("Too many submissions. Please wait before trying again."),
});

export const qualificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 25 : 80,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildLimitHandler("Too many qualification attempts. Please try again later."),
});

export const leadSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 10 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildLimitHandler("Too many brief submissions. Please wait before trying again."),
});

/**
 * Admin operations limiter.
 * Stricter than general limiter to protect admin endpoints from abuse.
 * Production: 50 requests per 15 minutes
 * Development: 150 requests per 15 minutes
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 50 : 150,
  standardHeaders: true,
  legacyHeaders: false,
  handler: buildLimitHandler("Admin rate limit exceeded. Please try again later."),
});

/**
 * Strict auth limiter: 5 attempts per 15 minutes per IP+email combination
 * Production: Aggressive protection against brute-force attacks
 * Development: Permissive for testing
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.isProduction ? 5 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP + email (prevent targeted attacks on single account)
    // Use IPv6-safe ipKeyGenerator helper with email for compound key
    const ipKey = ipKeyGenerator(req);
    const email = req.body?.email || "unknown";
    return `${ipKey}-${email}`;
  },
  handler: buildLimitHandler(
    "Too many login attempts. Please try again in 15 minutes."
  ),
  skip: (req) => {
    // Don't rate limit health checks or public endpoints
    return req.path === "/health";
  },
});

export function applySecurity(app) {
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );
  app.use(compression());
  app.use(hpp());
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(buildCorsError());
      },
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
      credentials: true, // ✅ Allow cookies to be sent/received in cross-origin requests
      maxAge: 60 * 60 * 24,
      optionsSuccessStatus: 204,
    })
  );
}
