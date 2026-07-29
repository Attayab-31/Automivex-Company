import { Link } from "react-router-dom";
import { Seo } from "@/shared/ui/Seo";
import { Section } from "@/shared/ui/Section";

const services = [
  {
    key: "quick-wins",
    title: "Quick Fixes & Support",
    summary: "Fast response for urgent bugs, Shopify issues, small integrations, and support work.",
  },
  {
    key: "ai",
    title: "AI Features & Automation",
    summary: "Practical AI assistants, recommendations, document processing, and workflow automation.",
  },
  {
    key: "cv",
    title: "Computer Vision & OCR",
    summary: "Vision systems for OCR, inspection, image sorting, and manual document workflows.",
  },
  {
    key: "automation",
    title: "Workflow Automation",
    summary: "Automate repetitive approvals, reporting, handoffs, and manual admin processes.",
  },
  {
    key: "shopify",
    title: "Shopify Development & Support",
    summary: "Store improvements, app integrations, conversion fixes, and ongoing engineering support.",
  },
  {
    key: "saas",
    title: "SaaS Product Development",
    summary: "MVP builds, internal tooling, client portals, and full-stack product development.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Seo
        title="Services | Automivex"
        description="Explore Automivex services for AI development, automation, SaaS products, Shopify engineering, and computer vision."
        pathname="/services"
        keywords="AI development, automation engineering, SaaS development, Shopify development, computer vision, workflow automation"
      />

      <main id="main-content">
        <Section eyebrow="Services" title="Software delivery for fast-moving teams" ariaLabel="services-page-title">
          <div className="service-hero">
            <h1 id="services-page-title">Software delivery for fast-moving teams</h1>
            <p className="lead-text">
              We help founders and operators ship practical software without bloated agency overhead.
            </p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article key={service.key} className="service-card">
                <h2>{service.title}</h2>
                <p>{service.summary}</p>
                <Link to={`/services/${service.key}`} className="btn ghost">
                  See details
                </Link>
              </article>
            ))}
          </div>
        </Section>
      </main>
    </>
  );
}
