import { useQuery } from "@tanstack/react-query";
import { getSiteContent } from "@/shared/api/siteContentApi";

export function useSiteContentQuery() {
  return useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
    // Keep cache fresh - refetch every 30 seconds
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Cache garbage collected after 5 minutes
  });
}
