import { z } from "zod";

const isoDateTimeString = z.string().datetime({ offset: true });

export const apiErrorResponseSchema = z.object({
  error: z.string().min(1),
  requestId: z.string().min(1).optional(),
});

export const proofSnapshotSchema = z.object({
  projectsDelivered: z.number().int().nonnegative(),
  workflowsAutomated: z.number().int().nonnegative(),
  clientSatisfaction: z.number().int().min(0).max(100),
  averageResponseHours: z.number().int().nonnegative(),
  publishedAt: isoDateTimeString,
  sourceLabel: z.string().trim().min(1).max(160),
});

export const proofResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("published"),
    snapshot: proofSnapshotSchema,
  }),
  z.object({
    status: z.literal("unavailable"),
    message: z.string().trim().min(1).max(300),
  }),
]);

export const governanceMetadataSchema = z.object({
  owner: z.string().trim().min(2).max(120),
  lastReviewedAt: isoDateTimeString,
  reviewCycle: z.string().trim().min(2).max(120),
  evidenceSummary: z.string().trim().min(10).max(400),
});

export const serviceOfferingSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9-]+$/).min(1).max(40),
  iconKey: z.string().trim().regex(/^[a-z0-9-]+$/).min(1).max(40),
  name: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(220),
  bestFor: z.string().trim().min(10).max(240),
  pain: z.string().trim().min(10).max(220),
  outcomes: z.string().trim().min(10).max(260),
  deliverables: z.array(z.string().trim().min(2).max(120)).min(2).max(8),
  engagementModel: z.string().trim().min(2).max(120),
  timeline: z.string().trim().min(2).max(120),
  range: z.string().trim().min(2).max(80),
  nextStep: z.string().trim().min(10).max(240),
  basePrice: z.number().int().nonnegative(),
  availability: z.enum(["active", "limited", "waitlist"]),
  governance: governanceMetadataSchema,
});

export const caseStudyMetricSchema = z.object({
  label: z.string().trim().min(1).max(80),
  value: z.string().trim().min(1).max(80),
});

export const caseStudySchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).min(1).max(80),
  title: z.string().trim().min(2).max(160),
  client: z.string().trim().min(2).max(120),
  sector: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(240),
  before: z.string().trim().min(10).max(240),
  after: z.string().trim().min(10).max(240),
  scope: z.array(z.string().trim().min(2).max(140)).min(2).max(8),
  timeline: z.array(z.string().trim().min(2).max(140)).min(2).max(8),
  metrics: z.array(caseStudyMetricSchema).min(2).max(6),
  architecture: z.array(z.string().trim().min(2).max(120)).min(2).max(10),
  evidence: z.array(z.string().trim().min(4).max(160)).min(1).max(6),
  governance: governanceMetadataSchema,
});

export const trustItemSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/).min(1).max(40),
  iconKey: z.string().trim().regex(/^[a-z0-9-]+$/).min(1).max(40),
  title: z.string().trim().min(2).max(120),
  summary: z.string().trim().min(10).max(260),
  commitments: z.array(z.string().trim().min(4).max(160)).min(2).max(8),
  evidence: z.array(z.string().trim().min(4).max(160)).min(1).max(6),
  governance: governanceMetadataSchema,
});

// ========== HERO CONTENT ==========
export const heroCtaSchema = z.object({
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(300),
});

export const heroContentSchema = z.object({
  eyebrow: z.string().trim().min(1).max(160),
  title: z.string().trim().min(5).max(300),
  description: z.string().trim().min(10).max(500),
  primaryCta: heroCtaSchema,
  secondaryCta: heroCtaSchema,
  trustLine: z.string().trim().min(5).max(200),
});

// ========== WHY CHOOSE CONTENT ==========
export const whyChoosePointSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(280),
});

export const whyChooseContentSchema = z.object({
  eyebrow: z.string().trim().min(1).max(120),
  title: z.string().trim().min(5).max(200),
  description: z.string().trim().min(10).max(400),
  points: z.array(whyChoosePointSchema).min(4).max(8),
});

// ========== NAVIGATION & LINKS ==========
export const navItemSchema = z.object({
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(300),
});

export const legalLinkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(300),
});

export const socialLinkSchema = z.object({
  label: z.string().trim().min(1).max(100),
  href: z.string().trim().min(1).max(300),
});

// ========== SITE CONFIG & CONTACT ==========
export const contactInfoSchema = z.object({
  primaryEmail: z.string().trim().email().max(200),
  legalEmail: z.string().trim().email().max(200),
  responseWindow: z.string().trim().min(5).max(200),
});

export const siteConfigSchema = z.object({
  brand: z.string().trim().min(2).max(120),
  websiteUrl: z.string().trim().url().max(300),
  title: z.string().trim().min(5).max(160),
  description: z.string().trim().min(10).max(300),
  ogImage: z.string().trim().min(1).max(300),
  contact: contactInfoSchema,
  socialLinks: z.array(socialLinkSchema).min(0).max(10),
});

// ========== QUALIFICATION & BOOKING ==========
export const qualificationDataSchema = z.object({
  questions: z.array(z.string().trim().min(5).max(150)).min(4).max(8),
});

export const projectTypeOptionsSchema = z.object({
  options: z.array(z.string().trim().min(2).max(100)).min(3).max(12),
});

export const budgetOptionsSchema = z.object({
  options: z.array(z.string().trim().min(2).max(100)).min(3).max(8),
});

// ========== STRUCTURED DATA FOR SEO ==========
export const organizationContactPointSchema = z.object({
  "@type": z.literal("ContactPoint"),
  contactType: z.string().trim().min(2).max(50),
  email: z.string().trim().email().max(200),
  url: z.string().trim().url().max(300),
});

export const organizationStructuredDataSchema = z.object({
  "@context": z.literal("https://schema.org"),
  "@type": z.literal("Organization"),
  name: z.string().trim().min(2).max(120),
  url: z.string().trim().url().max(300),
  logo: z.string().trim().url().max(300),
  email: z.string().trim().email().max(200),
  sameAs: z.array(z.string().trim().url().max(300)).min(0).max(10),
  description: z.string().trim().min(10).max(500),
  contactPoint: organizationContactPointSchema,
});

// ========== UNIFIED CONTENT BUNDLE ==========
export const siteContentBundleSchema = z.object({
  // Metadata
  publishedAt: isoDateTimeString,
  sourceLabel: z.string().trim().min(1).max(160),

  // Page content
  hero: heroContentSchema,
  whyChoose: whyChooseContentSchema,
  nav: z.array(navItemSchema).min(5).max(15),
  services: z.array(serviceOfferingSchema).min(1).max(20),
  caseStudies: z.array(caseStudySchema).min(1).max(20),
  trustItems: z.array(trustItemSchema).min(1).max(20),
  proofSnapshot: proofSnapshotSchema,

  // Qualification & booking
  qualificationQuestions: z.array(z.string().trim().min(5).max(150)).min(4).max(8),
  projectTypeOptions: z.array(z.string().trim().min(2).max(100)).min(3).max(12),
  budgetOptions: z.array(z.string().trim().min(2).max(100)).min(3).max(8),

  // Site configuration
  siteConfig: siteConfigSchema,
  legalLinks: z.array(legalLinkSchema).min(2).max(10),
  socialLinks: z.array(socialLinkSchema).min(0).max(10),
  organizationStructuredData: organizationStructuredDataSchema,
});

export const siteContentResponseSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("published"),
    content: siteContentBundleSchema,
  }),
  z.object({
    status: z.literal("unavailable"),
    message: z.string().trim().min(1).max(300),
  }),
]);

export const qualificationRequestSchema = z.object({
  answers: z.array(z.string().trim().min(1).max(500)).min(4).max(8),
});

export const qualificationResponseSchema = z.object({
  tier: z.string().min(1),
  recommendedModel: z.string().min(1),
  eta: z.string().min(1),
});

export const leadRequestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  service: z.string().trim().min(2).max(120),
  budget: z.string().trim().min(2).max(80),
  details: z.string().trim().min(10).max(2500),
});

export const leadResponseSchema = z.object({
  ok: z.literal(true),
  message: z.string().min(1),
  referenceId: z.string().trim().min(1).max(120),
});
