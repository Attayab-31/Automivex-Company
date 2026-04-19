import { FaCogs, FaComments, FaLayerGroup, FaRocket, FaTools, FaUserCog } from "react-icons/fa";
import { trackEvent } from "@/lib/analytics";
import { Section } from "@/shared/ui/Section";

const icons = [FaCogs, FaUserCog, FaRocket, FaLayerGroup, FaComments, FaTools];

export default function WhyChooseSection({ whyChooseContent }) {
  // Fallback values if content is not yet loaded
  const content = whyChooseContent || {
    eyebrow: "",
    title: "",
    description: "",
    points: [],
  };

  return (
    <Section
      id="why-automivex"
      eyebrow={content.eyebrow}
      title={content.title}
    >
      <p className="section-intro">{content.description}</p>

      <div className="why-choose-grid">
        {content.points.map((point, index) => {
          const Icon = icons[index] || FaLayerGroup;

          return (
            <article key={point.title} className="why-card">
              <Icon />
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </article>
          );
        })}
      </div>

      <div className="hero-actions">
        <a
          className="btn"
          href="#book-call"
          onClick={() => trackEvent("cta_click", { cta: "why_choose_primary" })}
        >
          Get a scoped plan
        </a>
        <a
          className="btn ghost"
          href="#assistant"
          onClick={() => trackEvent("cta_click", { cta: "why_choose_secondary" })}
        >
          Check project fit
        </a>
      </div>
    </Section>
  );
}
