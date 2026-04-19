import { useMutation } from "@tanstack/react-query";
import { getQualificationRecommendation } from "@/features/qualification/api/getQualificationRecommendation";

export function useQualificationMutation() {
  return useMutation({
    mutationFn: (answers) => getQualificationRecommendation(answers),
  });
}
