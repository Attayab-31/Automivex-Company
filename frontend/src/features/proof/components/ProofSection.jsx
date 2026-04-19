import { useMemo } from "react";
import { AsyncStateCard } from "@/components/feedback/AsyncStateCard";
import { useAnimatedCounter } from "@/features/proof/hooks/useAnimatedCounter";
import { Section } from "@/shared/ui/Section";
import { formatDateLabel } from "@/shared/utils/formatDate";

export default function ProofSection({ proofSnapshot, isLoading, error }) {
  const publishedAtLabel = useMemo(() => {
    return proofSnapshot && proofSnapshot.publishedAt
      ? formatDateLabel(proofSnapshot.publishedAt)
      : "";
  }, [proofSnapshot]);

  const projectsDelivered = useAnimatedCounter(proofSnapshot?.projectsDelivered || 0);
  const workflowsAutomated = useAnimatedCounter(proofSnapshot?.workflowsAutomated || 0);
  const clientSatisfaction = useAnimatedCounter(proofSnapshot?.clientSatisfaction || 0);
  const averageResponseHours = useAnimatedCounter(proofSnapshot?.averageResponseHours || 0);

  return (
    <Section id="proof" eyebrow="Delivery Snapshot" title="A few numbers behind the work">
      {isLoading ? (
        <AsyncStateCard
          state="loading"
          title="Loading recent metrics"
          message="Loading the latest reviewed delivery snapshot."
        />
      ) : null}

      {!isLoading && proofSnapshot ? (
        <>
          <div className="proof-grid">
            <article>
              <strong>{projectsDelivered}+</strong>
              <span>Projects Delivered</span>
            </article>
            <article>
              <strong>{workflowsAutomated}+</strong>
              <span>Workflows Automated</span>
            </article>
            <article>
              <strong>{clientSatisfaction}%</strong>
              <span>Client Satisfaction</span>
            </article>
            <article>
              <strong>{averageResponseHours}h</strong>
              <span>Average First Response</span>
            </article>
          </div>

          <p className="muted-note">
            {`Latest published delivery snapshot. Updated ${publishedAtLabel}.`}
          </p>
        </>
      ) : null}

      {!isLoading && !proofSnapshot ? (
        <AsyncStateCard
          state="error"
          title="Metrics coming soon"
          message={
            error || "Verified delivery metrics are temporarily unavailable."
          }
        />
      ) : null}
    </Section>
  );
}
