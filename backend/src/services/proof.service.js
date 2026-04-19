import { proofSnapshotSchema } from "@automivex/shared/schemas";
import { getPublicSiteContent } from "./site-content.service.js";

const unavailableProofMessage =
  "Verified delivery metrics will be available once the first snapshot is published.";

export function validateProofSnapshotInput(payload) {
  // The proof snapshot is now part of the main content bundle validation,
  // so we validate it using the shared schema
  return proofSnapshotSchema.parse(payload);
}

/**
 * Get proof snapshot from the published site content.
 * The proof metrics are now part of the main content bundle at content.proofSnapshot.
 */
export async function getProofSnapshot() {
  try {
    const contentResponse = await getPublicSiteContent();

    if (contentResponse.status !== "published" || !contentResponse.content) {
      return {
        status: "unavailable",
        message: unavailableProofMessage,
      };
    }

    const { proofSnapshot } = contentResponse.content;

    if (!proofSnapshot) {
      return {
        status: "unavailable",
        message: unavailableProofMessage,
      };
    }

    return {
      status: "published",
      snapshot: proofSnapshot,
    };
  } catch (error) {
    console.error("proof_snapshot_fetch_failed", {
      message: error.message,
    });

    return {
      status: "unavailable",
      message:
        "Delivery metrics are temporarily unavailable. Please try again in a few moments.",
    };
  }
}
