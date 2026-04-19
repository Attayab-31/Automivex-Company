import { CACHE_CONTROL } from "../config/constants.js";

export function notFoundHandler(req, res) {
  res.set("Cache-Control", CACHE_CONTROL.NO_STORE).status(404).json({
    error: "Not found",
    requestId: req.id,
  });
}
