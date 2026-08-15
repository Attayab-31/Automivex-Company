import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { appRouter } from "@/app/routes/router";
import { frontendEnv } from "@/lib/env";

const KEEPALIVE_INTERVAL_MS = 5 * 60 * 1000;

async function pingBackendHealth() {
  try {
    await fetch(`${frontendEnv.apiBase}/health`, {
      method: "GET",
      cache: "no-store",
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    // Keep the app responsive and avoid noisy errors while the server wakes up.
  }
}

function BackendKeepAlive() {
  useEffect(() => {
    void pingBackendHealth();

    const intervalId = window.setInterval(() => {
      void pingBackendHealth();
    }, KEEPALIVE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <BackendKeepAlive />
      <RouterProvider router={appRouter} />
    </>
  );
}
