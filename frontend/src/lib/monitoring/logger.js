import { captureException, captureMessage } from "@/lib/monitoring/sentry";

function createPayload(context = {}) {
  return {
    timestamp: new Date().toISOString(),
    ...context,
  };
}

export const logger = {
  info(message, context = {}) {
    const payload = createPayload(context);
    console.info(message, payload);
    captureMessage(message, {
      ...payload,
      level: "info",
    });
  },
  warn(message, context = {}) {
    const payload = createPayload(context);
    console.warn(message, payload);
    captureMessage(message, {
      ...payload,
      level: "warn",
    });
  },
  error(message, context = {}) {
    const payload = createPayload(context);
    const error =
      context.error instanceof Error
        ? context.error
        : new Error(String(context.error || message));

    console.error(message, payload);
    captureException(error, payload);
  },
};
