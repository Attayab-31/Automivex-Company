import { qualificationResponseSchema } from "@automivex/shared/schemas";
import { request } from "@/shared/api/httpClient";

export function getQualificationRecommendation(answers, options) {
  return request(
    "/qualify",
    {
      ...(options || {}),
      method: "POST",
      body: JSON.stringify({ answers }),
    },
    qualificationResponseSchema
  );
}
