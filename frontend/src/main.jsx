import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import "@/styles/globals.css";

if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    import("@/lib/monitoring/sentry").then(({ setupGlobalErrorMonitoring }) => {
      setupGlobalErrorMonitoring();
    });
  }, { once: true });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </AppErrorBoundary>
  </React.StrictMode>
);
