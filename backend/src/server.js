import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initializeLogger, getLogger } from "./lib/logger.js";
import { setupGracefulShutdown } from "./lib/graceful-shutdown.js";
import { initializeRedis } from "./lib/redis.js";

// Initialize logger FIRST with environment config
initializeLogger(env.isProduction, env.logLevel);

const log = getLogger();
const app = createApp();

// Initialize Redis for CSRF and session storage (if configured)
await initializeRedis();

const server = app.listen(env.port, () => {
  log.info({ port: env.port }, "server_started");
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

// Setup graceful shutdown handlers
setupGracefulShutdown(server);
