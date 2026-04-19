import { useEffect } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { logger } from "@/lib/monitoring/logger";

export function RouteErrorState() {
  const error = useRouteError();
  const routeError = isRouteErrorResponse(error)
    ? new Error(error.statusText)
    : error instanceof Error
      ? error
      : new Error("Unknown route failure.");

  useEffect(() => {
    logger.error("frontend_route_error", {
      error: routeError,
    });
  }, [routeError]);

  return (
    <main className="route-loader" id="main-content">
      <div className="container app-shell-error-card">
        <p className="eyebrow">Route Error</p>
        <h1>We could not load this page.</h1>
        <p className="muted-note">
          Please return to the homepage or try refreshing the current route.
        </p>
        <a className="btn" href="/">
          Return Home
        </a>
      </div>
    </main>
  );
}
