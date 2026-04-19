import { Router } from "express";
import { z } from "zod";
import {
  leadRequestSchema,
  qualificationRequestSchema,
  siteContentBundleSchema,
} from "@automivex/shared/schemas";
import { validateBody } from "../middleware/validate-body.js";
import { requireAdminAuth } from "../middleware/auth-protect.js";
import { captureLead } from "../services/lead.service.js";

// Wrapper to handle async middleware
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
import { getProofSnapshot } from "../services/proof.service.js";
import { buildQualificationRecommendation } from "../services/qualification.service.js";
import {
  getPublicSiteContent,
  getDraftContent,
  saveDraftContent,
  publishSiteContent,
} from "../services/site-content.service.js";
import {
  qualificationLimiter as qualificationRouteLimiter,
  leadSubmissionLimiter as leadRouteLimiter,
  adminLimiter,
} from "../middleware/security.js";
import { requireCsrfToken, handleCsrfTokenGeneration } from "../middleware/csrf.js";
import { healthCheck } from "../middleware/health-check.js";
import { env } from "../config/env.js";
import { CACHE_CONTROL } from "../config/constants.js";
import adminAuthRouter from "./admin-auth.js";

export const apiRouter = Router();

// Mount admin auth routes
apiRouter.use("/admin/auth", adminAuthRouter);

// ========== PUBLIC ROUTES ==========

apiRouter.get("/health", healthCheck);

apiRouter.get("/proof", async (_req, res) => {
  res.set("Cache-Control", CACHE_CONTROL.PUBLIC_READ);
  res.status(200).json(await getProofSnapshot());
});

apiRouter.get("/site-content", async (_req, res) => {
  res.set("Cache-Control", CACHE_CONTROL.PUBLIC_READ);
  res.status(200).json(await getPublicSiteContent());
});

apiRouter.post(
  "/qualify",
  qualificationRouteLimiter,
  validateBody(qualificationRequestSchema),
  (req, res) => {
    res.set("Cache-Control", CACHE_CONTROL.NO_STORE);
    res.status(200).json(buildQualificationRecommendation(req.body.answers));
  }
);

apiRouter.post(
  "/leads",
  leadRouteLimiter,
  validateBody(leadRequestSchema),
  async (req, res) => {
    res.set("Cache-Control", CACHE_CONTROL.NO_STORE);
    res.status(201).json(
      await captureLead(req.body, {
        requestId: req.id,
        origin: req.get("origin") || null,
        userAgent: req.get("user-agent") || null,
        ipAddress: req.ip || null,
      })
    );
  }
);

// ========== ADMIN AUTHENTICATION ==========
// Admin auth routes are now mounted at /admin/auth via adminAuthRouter (see above)
// No additional auth endpoints should be defined here.

// ========== ADMIN ROUTES (NOW WITH AUTH) ==========

/**
 * GET /api/admin/csrf-token
 * Generate a CSRF token for the admin.
 * The token must be included in POST/PUT/DELETE requests to admin endpoints.
 * Tokens expire after 1 hour.
 * Requires valid admin auth token.
 * Rate limited to prevent token generation spam.
 */
apiRouter.get(
  "/admin/csrf-token",
  adminLimiter,
  requireAdminAuth,
  asyncHandler(handleCsrfTokenGeneration)
);

/**
 * GET /api/admin/content/draft
 * Retrieve the current draft content for editing.
 * Requires valid admin auth token.
 * Rate limited to prevent enumeration or brute force.
 */
apiRouter.get("/admin/content/draft", adminLimiter, requireAdminAuth, async (req, res) => {
  res.set("Cache-Control", CACHE_CONTROL.NO_STORE);
  
  try {
    const draft = await getDraftContent();
    
    if (!draft) {
      return res.status(404).json({
        error: "No draft content found. Please create one first.",
      });
    }

    res.status(200).json({
      status: "ok",
      content: draft,
    });
  } catch (error) {
    res.status(503).json({
      error: error.message || "Failed to retrieve draft content.",
    });
  }
});

/**
 * POST /api/admin/content/draft
 * Save changes to the draft content without publishing.
 * Requires valid admin auth token and valid CSRF token.
 * Rate limited to prevent abuse.
 * Body must validate against siteContentBundleSchema.
 */
apiRouter.post(
  "/admin/content/draft",
  adminLimiter,
  requireAdminAuth,
  asyncHandler(requireCsrfToken),
  validateBody(siteContentBundleSchema),
  async (req, res) => {
    res.set("Cache-Control", CACHE_CONTROL.NO_STORE);

    try {
      const draft = await saveDraftContent(req.body);
      
      res.status(200).json({
        status: "ok",
        message: "Draft content saved successfully.",
        content: draft,
      });
    } catch (error) {
      res.status(400).json({
        error: error.message || "Failed to save draft content.",
      });
    }
  }
);

/**
 * GET /api/admin/content/published
 * Retrieve the currently published content for comparison with draft.
 * Requires valid admin auth token.
 * Rate limited to prevent enumeration.
 */
apiRouter.get("/admin/content/published", adminLimiter, requireAdminAuth, async (req, res) => {
  res.set("Cache-Control", CACHE_CONTROL.NO_STORE);

  const contentResponse = await getPublicSiteContent();
  res.status(200).json(contentResponse);
});

/**
 * POST /api/admin/content/publish
 * Publish the current draft content to live.
 * This operation is atomic: validation happens before publication.
 * Requires valid admin auth token and valid CSRF token.
 * Rate limited to prevent abuse of critical operation.
 */
apiRouter.post("/admin/content/publish", adminLimiter, requireAdminAuth, asyncHandler(requireCsrfToken), async (req, res) => {
  res.set("Cache-Control", CACHE_CONTROL.NO_STORE);

  try {
    const published = await publishSiteContent();
    
    res.status(200).json({
      status: "ok",
      message: "Content published successfully.",
      content: published,
    });
  } catch (error) {
    res.status(503).json({
      error: error.message || "Failed to publish content.",
    });
  }
});
