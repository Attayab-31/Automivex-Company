import { leadResponseSchema } from "@automivex/shared/schemas";
import { request } from "@/shared/api/httpClient";

export function submitLead(payload, options) {
  return request(
    "/leads",
    {
      ...(options || {}),
      method: "POST",
      body: JSON.stringify(payload),
    },
    leadResponseSchema
  );
}
