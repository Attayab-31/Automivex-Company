import { promises as fs } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendDir = resolve(__dirname, "..");

const isVercelBuild = Boolean(process.env.VERCEL);

if (!isVercelBuild) {
  process.exit(0);
}

// Get backend URL from environment
const backendUrl = (process.env.VITE_BACKEND_URL || "").trim();

if (!backendUrl) {
  console.error(
    "❌ Missing VITE_BACKEND_URL environment variable. Set it in Vercel project settings."
  );
  process.exit(1);
}

// Validate URL format
let parsedUrl;
try {
  parsedUrl = new URL(backendUrl);
} catch {
  console.error(
    `❌ Invalid VITE_BACKEND_URL: "${backendUrl}". Must be a full HTTPS URL like https://your-backend.onrender.com`
  );
  process.exit(1);
}

if (parsedUrl.protocol !== "https:") {
  console.error("❌ VITE_BACKEND_URL must use https:// protocol.");
  process.exit(1);
}

if (parsedUrl.pathname !== "/" || parsedUrl.search || parsedUrl.hash) {
  console.error(
    `❌ VITE_BACKEND_URL must be just the origin, no path. Got: ${backendUrl}\nUse: ${parsedUrl.origin}`
  );
  process.exit(1);
}

// Generate vercel.json dynamically
const vercelConfig = {
  rewrites: [
    {
      source: "/api/(.*)",
      destination: `${backendUrl}/api/$1`,
    },
    {
      source: "/(.*)",
      destination: "/index.html",
    },
  ],
};

// Write vercel.json
const vercelJsonPath = resolve(frontendDir, "vercel.json");

try {
  await fs.writeFile(
    vercelJsonPath,
    JSON.stringify(vercelConfig, null, 2) + "\n",
    "utf-8"
  );
  console.log(`✅ Generated vercel.json with backend: ${backendUrl}`);
} catch (error) {
  console.error(`❌ Failed to write vercel.json: ${error.message}`);
  process.exit(1);
}

