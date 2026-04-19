import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendDir = resolve(scriptDir, "..");

config({ path: resolve(backendDir, ".env") });

function parseArgs(argv) {
  return argv.reduce((accumulator, argument) => {
    if (!argument.startsWith("--")) {
      return accumulator;
    }

    const [rawKey, ...rawValueParts] = argument.slice(2).split("=");
    const value = rawValueParts.join("=");

    if (!rawKey || !value) {
      return accumulator;
    }

    accumulator[rawKey] = value;
    return accumulator;
  }, {});
}

function printUsage() {
  console.info(`
Usage:
  npm run publish:site-content
  npm run publish:site-content -- --file=content/public-site-content.json
  npm run publish:site-content -- --draft-only

Flags:
  --file=path/to/file.json       Load content from a specific file (default: backend/content/public-site-content.json)
  --draft-only                   Save to draft without publishing (for admin use)
`);
}

async function main() {
  const [
    { env },
    { publishSiteContent, saveDraftContent },
    { getDefaultSiteContentPackPath, readSiteContentPack },
  ] = await Promise.all([
    import("../src/config/env.js"),
    import("../src/services/site-content.service.js"),
    import("../src/lib/site-content-pack.js"),
  ]);

  if (!env.mongodbUri || !env.mongodbDbName) {
    console.error("MongoDB is not configured. Set MONGODB_URI and MONGODB_DB_NAME in backend/.env.");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));

  if (
    Object.keys(args).filter((k) => k !== "file" && k !== "draft-only").length > 0 ||
    ("file" in args && !args.file)
  ) {
    printUsage();
    process.exit(1);
  }

  const sourceFilePath = args.file
    ? resolve(process.cwd(), args.file)
    : getDefaultSiteContentPackPath();

  try {
    const content = await readSiteContentPack(sourceFilePath);

    if (args["draft-only"]) {
      const draftContent = await saveDraftContent(content);
      console.info("site_content_draft_saved", {
        sourceFilePath,
        publishedAt: draftContent.publishedAt,
        services: draftContent.services.length,
        caseStudies: draftContent.caseStudies.length,
        trustItems: draftContent.trustItems.length,
      });
    } else {
      // Save to draft first, then publish
      await saveDraftContent(content);
      const publishedContent = await publishSiteContent();
      console.info("site_content_published", {
        sourceFilePath,
        publishedAt: publishedContent.publishedAt,
        services: publishedContent.services.length,
        caseStudies: publishedContent.caseStudies.length,
        trustItems: publishedContent.trustItems.length,
      });
    }
  } catch (error) {
    console.error("Error publishing content:", error.message);
    process.exit(1);
  }
}

try {
  await main();
} finally {
  const { closeMongoClient } = await import("../src/lib/mongo.js");
  await closeMongoClient();
}
