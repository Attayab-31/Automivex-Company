import { Outlet, useLocation } from "react-router-dom";
import { AnalyticsProvider } from "@/app/providers/AnalyticsProvider";
import { CookieBanner } from "@/components/feedback/CookieBanner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { useLenis } from "@/hooks/useLenis";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { usePreferencesStore } from "@/shared/stores/preferencesStore";

export function AppLayout() {
  const location = useLocation();
  const scrollProgress = useScrollProgress();
  const prefersReducedMotion = usePrefersReducedMotion();
  const theme = usePreferencesStore((state) => state.theme);
  const cookieConsent = usePreferencesStore((state) => state.cookieConsent);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const setCookieConsent = usePreferencesStore((state) => state.setCookieConsent);
  const isLandingRoute = location.pathname === "/";

  useLenis({ enabled: !prefersReducedMotion });

  return (
    <div className="page-shell">
      <AnalyticsProvider />

      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <div className="scroll-progress" aria-hidden="true">
        <div
          className="scroll-progress-bar"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {isLandingRoute && (
        <Header
          theme={theme}
          onToggleTheme={() =>
            setTheme(theme === "dark" ? "light" : "dark")
          }
        />
      )}

      <Outlet />

      {isLandingRoute && <Footer year={new Date().getFullYear()} />}

      {cookieConsent === "pending" && (
        <CookieBanner
          onAccept={() => setCookieConsent("accepted")}
          onReject={() => setCookieConsent("rejected")}
        />
      )}
    </div>
  );
}
