import { Section } from "@/shared/ui/Section";
import { StatusCard } from "@/components/feedback/StatusCard";

export function AsyncSectionFallback({ eyebrow, title, message }) {
  return (
    <Section eyebrow={eyebrow} title={title}>
      <StatusCard>{message || "Loading section content."}</StatusCard>
    </Section>
  );
}
