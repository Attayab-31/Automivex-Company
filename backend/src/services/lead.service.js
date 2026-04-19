import { env } from "../config/env.js";
import {
  isMongoConfigured,
  isMongoConnectionCoolingDown,
  isMongoConnectivityError,
} from "../lib/mongo.js";
import { getLogger } from "../lib/logger.js";
import { createLeadSubmission } from "../repositories/lead.repository.js";
import { sendLeadEmailNotification } from "./lead-email-notification.service.js";

function getEmailDomain(email) {
  return email.includes("@") ? email.split("@").pop().toLowerCase() : "unknown";
}

function buildLeadUnavailableError() {
  const error = new Error(
    "Project brief intake is temporarily unavailable. Please try again shortly."
  );

  error.statusCode = 503;
  return error;
}

function buildDevelopmentLeadCaptureResponse(lead, metadata, receivedAt, emailDomain) {
  if (env.logLeadsToConsole) {
    const log = getLogger({ requestId: metadata.requestId });
    log.info(
      {
        service: lead.service,
        budget: lead.budget,
        emailDomain,
        detailLength: lead.details.length,
      },
      "lead_captured_dev_only"
    );
  }

  return {
    ok: true,
    message: "Project brief captured in development mode. Configure MongoDB to persist submissions.",
    referenceId: metadata.requestId,
  };
}

export async function captureLead(lead, metadata) {
  const log = getLogger({ requestId: metadata.requestId });
  const receivedAt = new Date().toISOString();
  const emailDomain = getEmailDomain(lead.email);

  if (!isMongoConfigured()) {
    if (env.isProduction) {
      throw buildLeadUnavailableError();
    }

    return buildDevelopmentLeadCaptureResponse(lead, metadata, receivedAt, emailDomain);
  }

  if (!env.isProduction && isMongoConnectionCoolingDown()) {
    return buildDevelopmentLeadCaptureResponse(lead, metadata, receivedAt, emailDomain);
  }

  let storedLead;

  try {
    storedLead = await createLeadSubmission({
      requestId: metadata.requestId,
      name: lead.name,
      email: lead.email,
      emailDomain,
      service: lead.service,
      budget: lead.budget,
      details: lead.details,
      origin: metadata.origin,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
    });
  } catch (error) {
    if (!isMongoConnectivityError(error)) {
      throw error;
    }

    log.error(
      {
        message: error.message,
      },
      "lead_storage_unavailable"
    );

    if (env.isProduction) {
      throw buildLeadUnavailableError();
    }

    return buildDevelopmentLeadCaptureResponse(lead, metadata, receivedAt, emailDomain);
  }

  try {
    await sendLeadEmailNotification({
      referenceId: storedLead.id,
      receivedAt,
      requestId: metadata.requestId,
      name: lead.name,
      email: lead.email,
      emailDomain,
      service: lead.service,
      budget: lead.budget,
      details: lead.details,
      origin: metadata.origin,
      userAgent: metadata.userAgent,
    });
  } catch (error) {
    log.error(
      {
        referenceId: storedLead.id,
        message: error.message,
      },
      "lead_email_notification_failed"
    );
  }

  if (env.logLeadsToConsole) {
    log.info(
      {
        referenceId: storedLead.id,
        service: lead.service,
        budget: lead.budget,
        emailDomain,
        detailLength: lead.details.length,
      },
      "lead_captured"
    );
  }

  return {
    ok: true,
    message: "Project brief received. We will review it and follow up soon.",
    referenceId: storedLead.id,
  };
}
