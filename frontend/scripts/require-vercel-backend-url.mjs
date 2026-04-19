const isVercelBuild = Boolean(process.env.VERCEL);

if (!isVercelBuild) {
  process.exit(0);
}

const rawBackendUrl = (process.env.VERCEL_RENDER_BACKEND_URL || "").trim();

if (!rawBackendUrl) {
  console.error(
    "Missing VERCEL_RENDER_BACKEND_URL. Set it in the Vercel project to your Render service origin, for example https://your-backend.onrender.com."
  );
  process.exit(1);
}

let parsedUrl;

try {
  parsedUrl = new URL(rawBackendUrl);
} catch {
  console.error(
    `Invalid VERCEL_RENDER_BACKEND_URL: "${rawBackendUrl}". Use a full https origin such as https://your-backend.onrender.com.`
  );
  process.exit(1);
}

if (parsedUrl.protocol !== "https:") {
  console.error("VERCEL_RENDER_BACKEND_URL must use https.");
  process.exit(1);
}

if (parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
  console.error(
    "VERCEL_RENDER_BACKEND_URL must be the backend origin only, with no path, query, or hash. Example: https://your-backend.onrender.com"
  );
  process.exit(1);
}

if (
  rawBackendUrl.includes("your-backend") ||
  rawBackendUrl.includes("your-render-backend") ||
  rawBackendUrl.includes("example.com")
) {
  console.error(
    "VERCEL_RENDER_BACKEND_URL still looks like a placeholder. Replace it with the real Render backend origin before deploying."
  );
  process.exit(1);
}
