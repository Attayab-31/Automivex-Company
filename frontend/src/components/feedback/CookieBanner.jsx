import { memo } from "react";

export const CookieBanner = memo(function CookieBanner({
  onAccept,
  onReject,
}) {
  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <p>
        We use analytics only after consent so we can improve site performance
        and conversion quality without collecting data by default.
      </p>
      <div className="cookie-actions">
        <button className="btn ghost" type="button" onClick={onReject}>
          Reject
        </button>
        <button className="btn" type="button" onClick={onAccept}>
          Accept
        </button>
      </div>
    </div>
  );
});
