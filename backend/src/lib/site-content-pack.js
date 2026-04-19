import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { siteContentBundleSchema } from "@automivex/shared/schemas";

const libDir = dirname(fileURLToPath(import.meta.url));
const defaultSiteContentPackPath = resolve(
  libDir,
  "../../content/public-site-content.json"
);

export function getDefaultSiteContentPackPath() {
  return defaultSiteContentPackPath;
}

export async function readSiteContentPack(filePath = defaultSiteContentPackPath) {
  const fileContents = await readFile(filePath, "utf8");
  return siteContentBundleSchema.parse(JSON.parse(fileContents));
}
