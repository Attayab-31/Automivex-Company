import { useMutation } from "@tanstack/react-query";
import { submitLead } from "@/features/booking/api/submitLead";

export function useLeadSubmission() {
  return useMutation({
    mutationFn: (payload) => submitLead(payload),
  });
}
