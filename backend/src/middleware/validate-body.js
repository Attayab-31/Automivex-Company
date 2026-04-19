import { CACHE_CONTROL } from "../config/constants.js";

export function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return res.set("Cache-Control", CACHE_CONTROL.NO_STORE).status(400).json({
        error: firstIssue?.message || "Invalid request payload.",
        requestId: req.id,
      });
    }

    req.body = parsed.data;
    return next();
  };
}
