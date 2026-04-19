import express from "express";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFoundHandler } from "./middleware/not-found.js";
import { requestId } from "./middleware/request-id.js";
import { applySecurity, generalLimiter } from "./middleware/security.js";
import { apiRouter } from "./routes/index.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");

  if (env.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(requestId);
  applySecurity(app);
  app.use(express.json({ limit: "120kb" }));
  app.use(express.urlencoded({ extended: false, limit: "120kb" }));
  app.use(cookieParser(env.cookieSecret));
  
  app.use("/api", generalLimiter, apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
