import { HeroScene } from "@/features/hero/components/HeroScene";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { trackEvent } from "@/lib/analytics";

export default function HeroSection({ heroContent }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const contentClassName = prefersReducedMotion ? "hero-left" : "hero-left hero-left-animate";
  const visualClassName = prefersReducedMotion ? "hero-right" : "hero-right hero-right-animate";

  // Fallback values if content is not yet loaded
  const content = heroContent || {
    eyebrow: "",
    title: "",
    description: "",
    primaryCta: { label: "", href: "#" },
    secondaryCta: { label: "", href: "#" },
    trustLine: "",
  };

  return (
    <section id="top" className="hero container" aria-labelledby="hero-title">
      <div className={contentClassName}>
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 id="hero-title">{content.title}</h1>
        <p>{content.description}</p>

        <div className="hero-actions">
          <a
            className="btn"
            href={content.primaryCta.href}
            onClick={() => trackEvent("cta_click", { cta: "hero_primary" })}
          >
            {content.primaryCta.label}
          </a>
          <a
            className="btn ghost"
            href={content.secondaryCta.href}
            onClick={() => trackEvent("cta_click", { cta: "hero_secondary" })}
          >
            {content.secondaryCta.label}
          </a>
        </div>

        <p className="muted-note">{content.trustLine}</p>
      </div>

      <div className={visualClassName}>
        <HeroScene reducedMotion={prefersReducedMotion} />
      </div>
    </section>
  );
}
