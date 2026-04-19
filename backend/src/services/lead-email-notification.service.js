import { env } from "../config/env.js";
import { getLogger } from "../lib/logger.js";

const logger = getLogger({ module: "lead-email" });
const resendApiUrl = "https://api.resend.com/emails";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return replacements[character];
  });
}

function buildLeadEmailSubject(payload) {
  return `New Automivex lead: ${payload.name} - ${payload.service}`;
}

function buildLeadEmailHtml(payload) {
  const detailsHtml = escapeHtml(payload.details).replace(/\n/g, "<br />");

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #122033;">
      <h2 style="margin-bottom: 12px;">New project brief received</h2>
      <p style="margin: 0 0 14px;">
        A new lead was captured on the Automivex website and stored in MongoDB.
      </p>
      <table style="border-collapse: collapse; width: 100%; max-width: 720px;">
        <tbody>
          <tr><td style="padding: 6px 0; font-weight: 700;">Reference ID</td><td style="padding: 6px 0;">${escapeHtml(payload.referenceId)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Received</td><td style="padding: 6px 0;">${escapeHtml(payload.receivedAt)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Name</td><td style="padding: 6px 0;">${escapeHtml(payload.name)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Email</td><td style="padding: 6px 0;">${escapeHtml(payload.email)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Service</td><td style="padding: 6px 0;">${escapeHtml(payload.service)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Budget</td><td style="padding: 6px 0;">${escapeHtml(payload.budget)}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 700;">Origin</td><td style="padding: 6px 0;">${escapeHtml(payload.origin || "n/a")}</td></tr>
        </tbody>
      </table>
      <div style="margin-top: 18px;">
        <div style="font-weight: 700; margin-bottom: 6px;">Project details</div>
        <div style="padding: 14px; border: 1px solid #d5e3f0; border-radius: 10px; background: #f6fbff;">
          ${detailsHtml}
        </div>
      </div>
    </div>
  `.trim();
}

function buildLeadEmailText(payload) {
  return [
    "New project brief received",
    "",
    `Reference ID: ${payload.referenceId}`,
    `Received: ${payload.receivedAt}`,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Service: ${payload.service}`,
    `Budget: ${payload.budget}`,
    `Origin: ${payload.origin || "n/a"}`,
    "",
    "Project details:",
    payload.details,
  ].join("\n");
}

export function isLeadEmailNotificationConfigured() {
  return Boolean(
    env.resendApiKey &&
      env.leadNotificationFrom &&
      env.leadNotificationTo
  );
}

export async function sendLeadEmailNotification(payload) {
  if (!isLeadEmailNotificationConfigured()) {
    return { delivered: false, reason: "not_configured" };
  }

  // Retry logic with exponential backoff
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(resendApiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `lead-${payload.referenceId}`,
        },
        body: JSON.stringify({
          from: env.leadNotificationFrom,
          to: [env.leadNotificationTo],
          subject: buildLeadEmailSubject(payload),
          html: buildLeadEmailHtml(payload),
          text: buildLeadEmailText(payload),
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (response.ok) {
        const responseBody = await response.json();
        logger.info(
          { referenceId: payload.referenceId, attempt },
          "email_sent_successfully"
        );
        return {
          delivered: true,
          providerMessageId: responseBody.id,
        };
      }

      // Non-2xx status - prepare for retry or fail
      const errorBody = await response.text();
      lastError = new Error(
        `Email send failed (${response.status}): ${errorBody}`
      );

      // If 4xx (client error), don't retry
      if (response.status >= 400 && response.status < 500) {
        logger.error(
          {
            referenceId: payload.referenceId,
            status: response.status,
            error: errorBody,
          },
          "email_send_client_error_no_retry"
        );
        throw lastError;
      }

      // 5xx or network error - retry
      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        logger.warn(
          {
            referenceId: payload.referenceId,
            attempt,
            nextRetryMs: backoffMs,
            status: response.status,
          },
          "email_send_failed_retrying"
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        logger.warn(
          {
            referenceId: payload.referenceId,
            attempt,
            nextRetryMs: backoffMs,
            error: error.message,
          },
          "email_send_error_retrying"
        );
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  // All retries exhausted
  logger.error(
    { referenceId: payload.referenceId, error: lastError?.message },
    "email_send_failed_all_retries"
  );
  throw lastError || new Error("Email delivery failed after retries");
}
