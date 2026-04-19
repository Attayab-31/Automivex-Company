import { apiErrorResponseSchema } from "@automivex/shared/schemas";
import { frontendEnv } from "@/lib/env";
import { logger } from "@/lib/monitoring/logger";

const retryableStatusCodes = new Set([408, 425, 429, 500, 502, 503, 504]);

export class ApiClientError extends Error {
  constructor({ error, status = 0, code = "request_failed", cause }) {
    super(error);
    this.name = "ApiClientError";
    this.success = false;
    this.error = error;
    this.status = status;
    this.code = code;
    this.cause = cause;
  }
}

export function toApiErrorResponse(error) {
  if (error instanceof ApiClientError) {
    return {
      success: false,
      error: error.error,
      status: error.status,
      code: error.code,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Request failed.",
    status: 0,
    code: "request_failed",
  };
}

function createRequestController(signal, timeoutMs) {
  if (typeof AbortController === "undefined") {
    return {
      didTimeout() {
        return false;
      },
      cleanup() {},
      signal,
    };
  }

  const controller = new AbortController();
  let timeoutId;
  let timedOut = false;

  const abortFromCaller = () => {
    controller.abort();
  };

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener("abort", abortFromCaller, { once: true });
    }
  }

  if (typeof timeoutMs === "number" && timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);
  }

  return {
    didTimeout() {
      return timedOut;
    },
    cleanup() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (signal) {
        signal.removeEventListener("abort", abortFromCaller);
      }
    },
    signal: controller.signal,
  };
}

function createDelay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function shouldRetryRequest({ error, status, attempt, maxRetries }) {
  if (attempt >= maxRetries) {
    return false;
  }

  if (error instanceof ApiClientError) {
    return error.code === "network_error" || error.code === "timeout";
  }

  return typeof status === "number" && retryableStatusCodes.has(status);
}

export async function request(path, options = {}, schema) {
  const {
    headers,
    signal,
    timeoutMs = 8000,
    maxRetries = 1,
    retryDelayMs = 350,
    ...requestInit
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    let response;
    const requestController = createRequestController(signal, timeoutMs);
    const requestOptions = {
      ...requestInit,
      headers: {
        ...(requestInit.body ? { "Content-Type": "application/json" } : {}),
        ...(headers || {}),
      },
      signal: requestController.signal,
    };

    try {
      response = await fetch(`${frontendEnv.apiBase}${path}`, requestOptions);
    } catch (error) {
      requestController.cleanup();

      if (requestController.didTimeout()) {
        lastError = new ApiClientError({
          error: "Request timed out. Please try again.",
          code: "timeout",
          cause: error,
        });
        logger.warn("frontend_api_timeout", {
          path,
          attempt,
        });
      } else if (error.name === "AbortError") {
        throw new ApiClientError({
          error: "Request was cancelled.",
          code: "aborted",
          cause: error,
        });
      } else {
        logger.warn("frontend_api_unreachable", {
          error,
          path,
          attempt,
        });
        lastError = new ApiClientError({
          error: "Could not reach the server.",
          code: "network_error",
          cause: error,
        });
      }

      if (shouldRetryRequest({ error: lastError, attempt, maxRetries })) {
        await createDelay(retryDelayMs * (attempt + 1));
        continue;
      }

      throw lastError;
    }

    requestController.cleanup();

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await response.json() : null;

    if (!response.ok) {
      const parsedError = apiErrorResponseSchema.safeParse(payload);
      const nextError = new ApiClientError({
        error: parsedError.success
          ? parsedError.data.error
          : `Request failed with status ${response.status}.`,
        status: response.status,
        code: "http_error",
      });
      logger.warn("frontend_api_http_error", {
        path,
        attempt,
        status: response.status,
        error: nextError.error,
      });

      if (
        shouldRetryRequest({
          status: response.status,
          attempt,
          maxRetries,
        })
      ) {
        lastError = nextError;
        await createDelay(retryDelayMs * (attempt + 1));
        continue;
      }

      throw nextError;
    }

    if (!schema) {
      return payload;
    }

    const parsedResponse = schema.safeParse(payload);

    if (!parsedResponse.success) {
      logger.warn("frontend_api_schema_mismatch", {
        path,
        issues: parsedResponse.error.issues,
      });
      throw new ApiClientError({
        error: "Received an unexpected response from the server.",
        code: "schema_mismatch",
      });
    }

    return parsedResponse.data;
  }

  throw (
    lastError ||
    new ApiClientError({
      error: "Request failed.",
    })
  );
}
