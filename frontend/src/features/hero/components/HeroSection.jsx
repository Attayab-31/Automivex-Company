import { motion } from "framer-motion";
import { HeroScene } from "@/features/hero/components/HeroScene";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { trackEvent } from "@/lib/analytics";

export default function HeroSection({ heroContent }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const contentAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.65 },
      };
  const visualAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.97 },
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0.75, delay: 0.05 },
      };

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
    <section id="top" className="hero container">
      <motion.div {...contentAnimation} className="hero-left">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
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
      </motion.div>

      <motion.div {...visualAnimation} className="hero-right">
        <HeroScene reducedMotion={prefersReducedMotion} />
      </motion.div>
    </section>
  );
}
