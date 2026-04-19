import { useMemo } from "react";

export function useServiceEstimate({
  selectedService,
  complexity,
  integrations,
  urgency,
}) {
  return useMemo(() => {
    if (!selectedService) {
      return null;
    }

    const base =
      selectedService.basePrice +
      complexity * 2200 +
      integrations * 900 +
      urgency * 1200;

    return {
      low: Math.round(base * 0.9),
      high: Math.round(base * 1.3),
    };
  }, [complexity, integrations, selectedService, urgency]);
}
