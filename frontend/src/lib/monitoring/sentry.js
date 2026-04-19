import { frontendEnv } from "@/lib/env";

function dispatchToProductionSink(payload) {
  // Only send if monitoring URL is configured
  if (!frontendEnv.monitoringUrl || typeof window === "undefined") {
    return;
  }

  const body = JSON.stringify(payload);

  // Use navigator.sendBeacon for reliability - doesn't need to wait for response
  if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon(frontendEnv.monitoringUrl, blob);
    return;
  }

  // Fallback to fetch if sendBeacon not available (unlikely but safe)
  void fetch(frontendEnv.monitoringUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Silently fail - we don't want error reporting to break the app
  });
}

function createMonitoringPayload(level, message, context = {}) {
  return {
    level,
    message,
    pathname: typeof window !== "undefined" ? window.location.pathname : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    timestamp: new Date().toISOString(),
    ...context,
  };
}

export function captureException(error, context = {}) {
  const payload = createMonitoringPayload(
    "error",
    error instanceof Error ? error.message : String(error),
    {
      errorName: error instanceof Error ? error.name : "Error",
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    }
  );

  if (import.meta.env.DEV) {
    console.error("monitoring.captureException", payload);
  }

  dispatchToProductionSink(payload);
}

export function captureMessage(message, context = {}) {
  const payload = createMonitoringPayload(context.level || "info", message, context);

  if (import.meta.env.DEV) {
    console.info("monitoring.captureMessage", payload);
  }

  dispatchToProductionSink(payload);
}

export function setupGlobalErrorMonitoring() {
  if (typeof window === "undefined" || window.__AUTOMIVEX_MONITORING_READY__) {
    return;
  }

  window.__AUTOMIVEX_MONITORING_READY__ = true;

  window.addEventListener("error", (event) => {
    captureException(event.error || new Error(event.message || "Window error"), {
      type: "window_error",
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason || "Unhandled promise rejection"));

    captureException(reason, {
      type: "unhandled_rejection",
    });
  });
}
