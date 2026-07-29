import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { frontendEnv } from "@/lib/env";
import { usePreferencesStore } from "@/shared/stores/preferencesStore";

export function AnalyticsProvider() {
  const location = useLocation();
  const cookieConsent = usePreferencesStore((state) => state.cookieConsent);
  const lastTrackedPathRef = useRef("");

  useEffect(() => {
    if (!frontendEnv.gaId || typeof window === "undefined") {
      return;
    }

    void import("@/lib/analytics").then(({ syncAnalyticsConsent }) => {
      syncAnalyticsConsent({
        gaId: frontendEnv.gaId,
        consent: cookieConsent,
      });
    });
  }, [cookieConsent]);

  useEffect(() => {
    if (cookieConsent !== "accepted" || !frontendEnv.gaId || typeof window === "undefined") {
      return;
    }

    const nextPath = `${location.pathname}${location.search}`;

    if (lastTrackedPathRef.current === nextPath) {
      return;
    }

    lastTrackedPathRef.current = nextPath;

    void import("@/lib/analytics").then(({ trackEvent }) => {
      trackEvent("page_view_custom", { page: nextPath });
    });
  }, [cookieConsent, location.pathname, location.search]);

  return null;
}
