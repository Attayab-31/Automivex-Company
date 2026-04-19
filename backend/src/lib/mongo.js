import {
  MongoClient,
  MongoNetworkError,
  MongoNetworkTimeoutError,
  MongoServerSelectionError,
} from "mongodb";
import { env } from "../config/env.js";
import { getLogger } from "./logger.js";

let clientPromise;
let clientInstance;
let lastConnectionError;
let retryAfter = 0;

export class MongoConnectionUnavailableError extends Error {
  constructor(message, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = "MongoConnectionUnavailableError";
    this.retryAfter = options.retryAfter ?? null;
  }
}

export function isMongoConfigured() {
  return Boolean(env.mongodbUri && env.mongodbDbName);
}

export function isMongoConnectionCoolingDown() {
  return Boolean(lastConnectionError && Date.now() < retryAfter);
}

export function isMongoHealthy() {
  return isMongoConfigured() && !isMongoConnectionCoolingDown() && clientInstance !== undefined;
}

export function isMongoConnectivityError(error) {
  return (
    error instanceof MongoConnectionUnavailableError ||
    error instanceof MongoServerSelectionError ||
    error instanceof MongoNetworkError ||
    error instanceof MongoNetworkTimeoutError
  );
}

function clearMongoConnectionFailure() {
  lastConnectionError = undefined;
  retryAfter = 0;
}

function clearMongoClientState() {
  clientPromise = undefined;
  clientInstance = undefined;
}

async function handleMongoConnectionFailure(client, error) {
  const log = getLogger();
  retryAfter = Date.now() + env.mongodbRetryCooldownMs;
  lastConnectionError = new MongoConnectionUnavailableError(
    error instanceof Error ? error.message : String(error),
    {
      cause: error instanceof Error ? error : undefined,
      retryAfter,
    }
  );
  clearMongoClientState();

  try {
    await client.close();
  } catch {
    // Ignore close errors after a failed connection attempt.
  }

  log.error(
    {
      message: error instanceof Error ? error.message : String(error),
      cooldownMs: env.mongodbRetryCooldownMs,
    },
    "mongodb_connection_failed"
  );

  throw lastConnectionError;
}

export async function getMongoDb() {
  if (!isMongoConfigured()) {
    throw new Error("MongoDB is not configured.");
  }

  if (isMongoConnectionCoolingDown()) {
    throw lastConnectionError;
  }

  if (!clientPromise) {
    const log = getLogger();
    const client = new MongoClient(env.mongodbUri, {
      appName: env.mongodbAppName,
      serverSelectionTimeoutMS: env.mongodbServerSelectionTimeoutMs,
      maxPoolSize: 50,
      minPoolSize: 10,
    });

    clientPromise = client
      .connect()
      .then((connectedClient) => {
        clientInstance = connectedClient;
        clearMongoConnectionFailure();
        log.info({ poolSize: 50 }, "mongodb_connected");
        return connectedClient;
      })
      .catch((error) => handleMongoConnectionFailure(client, error));
  }

  const client = await clientPromise;
  return client.db(env.mongodbDbName);
}

export async function closeMongoClient() {
  const log = getLogger();
  
  if (!clientPromise && !clientInstance) {
    clearMongoConnectionFailure();
    return;
  }

  try {
    const client = clientInstance || (await clientPromise);
    await client.close();
    log.info("mongodb_connection_closed");
  } catch (error) {
    log.warn(
      { message: error instanceof Error ? error.message : String(error) },
      "error_closing_mongodb_connection"
    );
  } finally {
    clearMongoClientState();
    clearMongoConnectionFailure();
  }
}
