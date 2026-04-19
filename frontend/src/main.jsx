import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppErrorBoundary } from "@/components/feedback/AppErrorBoundary";
import { setupGlobalErrorMonitoring } from "@/lib/monitoring/sentry";
import "@/styles/globals.css";

setupGlobalErrorMonitoring();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </AppErrorBoundary>
  </React.StrictMode>
);
