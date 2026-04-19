import { Link } from "react-router-dom";
import { Seo } from "@/shared/ui/Seo";

export default function NotFoundPage() {
  return (
    <>
      <Seo
        title="Page Not Found | Automivex"
        description="The page you requested could not be found."
        pathname="/404"
        noIndex
      />

      <main className="route-loader" id="main-content">
        <div className="container app-shell-error-card">
          <p className="eyebrow">404</p>
          <h1>The page you requested was not found.</h1>
          <p className="muted-note">
            The link may be outdated, or the page may have moved during a site update.
          </p>
          <div className="step-actions">
            <Link className="btn" to="/">
              Return Home
            </Link>
            <Link className="btn ghost" to="/privacy">
              View Policies
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
