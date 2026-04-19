const defaultCalendlyUrl = "https://calendly.com/automivex/30min";

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

export const frontendEnv = {
  apiBase: normalizeBaseUrl(import.meta.env.VITE_API_URL || "/api"),
  backendUrl: normalizeBaseUrl(import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"),
  gaId: (import.meta.env.VITE_GA_ID || "").trim(),
  calendlyUrl: (import.meta.env.VITE_CALENDLY_URL || defaultCalendlyUrl).trim(),
  monitoringUrl: (import.meta.env.VITE_MONITORING_URL || "").trim(),
};
