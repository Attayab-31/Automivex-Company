const isVercelBuild = Boolean(process.env.VERCEL);

if (!isVercelBuild) {
  process.exit(0);
}

// Try both variable names: first system-populated, then our custom config
const rawBackendUrl = (process.env.VERCEL_RENDER_BACKEND_URL || process.env.VITE_BACKEND_URL || "").trim();

if (!rawBackendUrl) {
  console.error(
    "Missing backend URL. Set VITE_BACKEND_URL or VERCEL_RENDER_BACKEND_URL in Vercel environment variables, for example https://your-backend.onrender.com."
  );
  process.exit(1);
}

let parsedUrl;

try {
  parsedUrl = new URL(rawBackendUrl);
} catch {
  console.error(
    `Invalid backend URL: "${rawBackendUrl}". Use a full https origin such as https://your-backend.onrender.com.`
  );
  process.exit(1);
}

if (parsedUrl.protocol !== "https:") {
  console.error("Backend URL must use https.");
  process.exit(1);
}

if (parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
  console.error(
    "Backend URL must be the backend origin only, with no path, query, or hash. Example: https://your-backend.onrender.com"
  );
  process.exit(1);
}

if (
  rawBackendUrl.includes("your-backend") ||
  rawBackendUrl.includes("your-render-backend") ||
  rawBackendUrl.includes("example.com")
) {
  console.error(
    "Backend URL still looks like a placeholder. Replace it with the real backend origin before deploying."
  );
  process.exit(1);
}
