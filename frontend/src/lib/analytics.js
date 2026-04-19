const deniedConsent = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
};

const grantedConsent = {
  ad_storage: "granted",
  ad_user_data: "granted",
  ad_personalization: "granted",
  analytics_storage: "granted",
};

function ensureAnalyticsBootstrap(gaId) {
  if (!gaId || typeof window === "undefined") {
    return false;
  }

  if (!document.querySelector(`script[data-ga="${gaId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    script.dataset.ga = gaId;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  return true;
}

function initializeAnalytics(gaId) {
  if (!ensureAnalyticsBootstrap(gaId)) {
    return false;
  }

  if (window.__analyticsBootstrap === gaId) {
    return true;
  }

  window.gtag("js", new Date());
  window.gtag("consent", "default", deniedConsent);
  window.__analyticsBootstrap = gaId;
  return true;
}

export function syncAnalyticsConsent({ gaId, consent }) {
  if (!gaId || typeof window === "undefined") {
    return;
  }

  window.__analyticsConsent = consent;

  if (consent !== "accepted") {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", deniedConsent);
    }
    return;
  }

  if (!initializeAnalytics(gaId) || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("consent", "update", grantedConsent);
  window.gtag("config", gaId, { anonymize_ip: true });
}

export function trackEvent(eventName, params = {}) {
  if (
    typeof window !== "undefined" &&
    typeof window.gtag === "function" &&
    window.__analyticsConsent === "accepted"
  ) {
    window.gtag("event", eventName, params);
  }
}
