import { useEffect, useMemo, useState } from "react";
import { FaBrain, FaCogs, FaEye, FaRocket, FaShopify } from "react-icons/fa";
import { StatusCard } from "@/components/feedback/StatusCard";
import { useServiceEstimate } from "@/features/services/hooks/useServiceEstimate";
import { trackEvent } from "@/lib/analytics";
import { Section } from "@/shared/ui/Section";
import { formatDateLabel } from "@/shared/utils/formatDate";

const serviceIcons = {
  ai: FaBrain,
  automation: FaCogs,
  cv: FaEye,
  "quick-wins": FaCogs,
  saas: FaRocket,
  shopify: FaShopify,
};

const availabilityLabels = {
  active: "Open for new work",
  limited: "A few slots left",
  waitlist: "Join the waitlist",
};

export default function ServicesSection({ services, contentMeta }) {
  const defaultSelectedKey =
    services.find((service) => service.key === "saas")?.key || services[0]?.key || "";
  const [selectedKey, setSelectedKey] = useState(defaultSelectedKey);
  const [complexity, setComplexity] = useState(0);
  const [integrations, setIntegrations] = useState(0);
  const [urgency, setUrgency] = useState(0);

  useEffect(() => {
    if (!services.some((service) => service.key === selectedKey)) {
      setSelectedKey(defaultSelectedKey);
    }
  }, [defaultSelectedKey, selectedKey, services]);

  const selectedService = useMemo(() => {
    return services.find((service) => service.key === selectedKey) || services[0] || null;
  }, [selectedKey, services]);

  const estimate = useServiceEstimate({
    selectedService,
    complexity,
    integrations,
    urgency,
  });

  const publicationNote = useMemo(() => {
    if (!contentMeta?.publishedAt) {
      return "Pricing guidance will appear once service content is available.";
    }

    return `Pricing and scope guide last updated ${formatDateLabel(contentMeta.publishedAt)}.`;
  }, [contentMeta]);

  return (
    <Section
      id="services"
      eyebrow="Services For Every Stage"
      title="Software delivery for quick wins, growth projects, and serious builds"
    >
      <p className="section-intro">
        Start with the closest fit below. We handle urgent fixes, scoped delivery
        sprints, and larger product work with clear scope, realistic pricing, and a
        straightforward next step.
      </p>

      {!selectedService || !estimate ? (
        <StatusCard>Published service content is temporarily unavailable.</StatusCard>
      ) : (
        <>
          <div className="cards-grid">
            {services.map((service) => {
              const Icon = serviceIcons[service.iconKey] || FaRocket;
              const isSelected = service.key === selectedKey;

              return (
                <button
                  key={service.key}
                  className={`card-button ${isSelected ? "selected" : ""}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedKey(service.key)}
                >
                  <Icon />
                  <h3>{service.name}</h3>
                  <p>{service.summary}</p>
                </button>
              );
            })}
          </div>

          <div className="product-estimator">
            <div>
              <div className="content-meta-row">
                <h3>{selectedService.name}</h3>
                <span className="content-badge">
                  {availabilityLabels[selectedService.availability]}
                </span>
              </div>

              <div className="service-price-row">
                <span className="content-badge">
                  Starting from ${selectedService.basePrice.toLocaleString()}
                </span>
                <span className="content-badge">
                  Most projects {selectedService.range}
                </span>
              </div>

              <p>
                <strong>Scope summary:</strong> {selectedService.summary}
              </p>
              <p>
                <strong>Best for:</strong> {selectedService.bestFor}
              </p>
              <p>
                <strong>Pain point:</strong> {selectedService.pain}
              </p>
              <p>
                <strong>Expected outcomes:</strong> {selectedService.outcomes}
              </p>
              <p>
                <strong>Engagement model:</strong> {selectedService.engagementModel}
              </p>
              <p>
                <strong>Typical timeline:</strong> {selectedService.timeline}
              </p>
              <p>
                <strong>Typical range:</strong> {selectedService.range}
              </p>
              <p>
                <strong>Best next step:</strong> {selectedService.nextStep}
              </p>

              <div className="content-pill-row">
                {selectedService.deliverables.map((deliverable) => (
                  <span key={deliverable} className="content-pill">
                    {deliverable}
                  </span>
                ))}
              </div>

              <p className="section-footnote">
                {selectedService.governance.evidenceSummary}
              </p>
              <p className="section-footnote">
                {`Last reviewed ${formatDateLabel(selectedService.governance.lastReviewedAt)}. ${selectedService.governance.reviewCycle} review cycle.`}
              </p>
            </div>

            <div className="estimator-controls">
              <label>
                <span className="range-label">Project complexity: {complexity}/5</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={complexity}
                  onChange={(event) => setComplexity(Number(event.target.value))}
                />
              </label>

              <label>
                <span className="range-label">Connected tools: {integrations}/6</span>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={integrations}
                  onChange={(event) => setIntegrations(Number(event.target.value))}
                />
              </label>

              <label>
                <span className="range-label">Speed needed: {urgency}/3</span>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={urgency}
                  onChange={(event) => setUrgency(Number(event.target.value))}
                />
              </label>

              <div className="estimate-box">
                <span>Typical budget range for this scope</span>
                <strong>
                  ${estimate.low.toLocaleString()} - ${estimate.high.toLocaleString()}
                </strong>
                <a
                  href="#book-call"
                  className="btn"
                  onClick={() =>
                    trackEvent("cta_click", {
                      cta: "get_quick_quote",
                      service: selectedService.name,
                    })
                  }
                >
                  Get a scoped plan
                </a>
              </div>

              <p className="estimator-note">
                Smaller jobs can land near the lower end. More workflow depth, more
                integrations, and faster deadlines push the range upward.
              </p>
              <p className="section-footnote">{publicationNote}</p>
            </div>
          </div>
        </>
      )}
    </Section>
  );
}
