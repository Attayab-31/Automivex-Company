import { useEffect } from "react";
import { usePreferencesStore } from "@/shared/stores/preferencesStore";

export function ConsentProvider({ children }) {
  const cookieConsent = usePreferencesStore((state) => state.cookieConsent);

  useEffect(() => {
    window.__analyticsConsent = cookieConsent;
  }, [cookieConsent]);

  return children;
}
