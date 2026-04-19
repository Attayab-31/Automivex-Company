import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDir = dirname(fileURLToPath(import.meta.url));

config({ path: resolve(backendDir, ".env") });

await import("./src/server.js");
