import { siteContentResponseSchema } from "@automivex/shared/schemas";
import { request } from "@/shared/api/httpClient";

export function getSiteContent(options) {
  return request("/site-content", options, siteContentResponseSchema);
}
