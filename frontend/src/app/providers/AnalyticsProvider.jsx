import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { frontendEnv } from "@/lib/env";
import { syncAnalyticsConsent, trackEvent } from "@/lib/analytics";
import { usePreferencesStore } from "@/shared/stores/preferencesStore";

export function AnalyticsProvider() {
  const location = useLocation();
  const cookieConsent = usePreferencesStore((state) => state.cookieConsent);
  const lastTrackedPathRef = useRef("");

  useEffect(() => {
    syncAnalyticsConsent({
      gaId: frontendEnv.gaId,
      consent: cookieConsent,
    });
  }, [cookieConsent]);

  useEffect(() => {
    if (cookieConsent !== "accepted") {
      return;
    }

    const nextPath = `${location.pathname}${location.search}`;

    if (lastTrackedPathRef.current === nextPath) {
      return;
    }

    lastTrackedPathRef.current = nextPath;
    trackEvent("page_view_custom", { page: nextPath });
  }, [cookieConsent, location.pathname, location.search]);

  return null;
}
