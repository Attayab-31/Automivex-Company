import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Seo } from "@/shared/ui/Seo";
import { useSiteContentQuery } from "@/hooks/useSiteContentQuery";
import { RouteErrorState } from "@/components/feedback/RouteErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";
import { Section } from "@/shared/ui/Section";

// Service metadata for SEO
const serviceMetadata = {
  "quick-wins": {
    title: "Quick Fixes & Support | Automivex",
    description: "Fast 2-10 day support sprints for bug fixes, integrations, and small improvements.",
    keywords: "quick fixes, support, bug fixes, small integrations, website fixes",
  },
  ai: {
    title: "AI Features & Automation | Automivex",
    description: "Practical AI assistants, recommendations, document processing, and forecasting for your business.",
    keywords: "AI development, machine learning, AI features, artificial intelligence, automation",
  },
  cv: {
    title: "Computer Vision & OCR | Automivex",
    description: "Vision systems for OCR, inspection, detection, and document workflows. Process images automatically.",
    keywords: "computer vision, OCR, image processing, document automation, vision AI",
  },
  automation: {
    title: "Workflow Automation Services | Automivex",
    description: "Automate repetitive tasks across your tools. Eliminate manual data entry and approval workflows.",
    keywords: "workflow automation, business automation, RPA, process automation, efficiency",
  },
  shopify: {
    title: "Shopify Development & Support | Automivex",
    description: "Shopify store fixes, conversion improvements, integrations, and ongoing technical support.",
    keywords: "Shopify development, store optimization, Shopify customization, e-commerce",
  },
  saas: {
    title: "SaaS Product Development | Automivex",
    description: "Full-stack SaaS development from MVP to scale. Build, launch, and grow your software product.",
    keywords: "SaaS development, product development, MVP, full-stack development, software startup",
  },
};

export default function ServiceLandingPage() {
  const { serviceKey } = useParams();
  const siteContentQuery = useSiteContentQuery();

  const publishedContent =
    siteContentQuery.data?.status === "published" ? siteContentQuery.data.content : null;

  const service = useMemo(() => {
    if (!publishedContent?.services) return null;
    return publishedContent.services.find((s) => s.key === serviceKey);
  }, [publishedContent?.services, serviceKey]);

  const seoData = useMemo(() => {
    const metadata = serviceMetadata[serviceKey];
    if (!metadata) return null;
    return {
      title: metadata.title,
      description: metadata.description,
      pathname: `/services/${serviceKey}`,
    };
  }, [serviceKey]);

  if (siteContentQuery.isPending) {
    return <PageLoader />;
  }

  if (siteContentQuery.isError || !service || !seoData) {
    return (
      <RouteErrorState
        title="Service not found"
        message="This service page is not available. Please check the URL or return to the homepage."
      />
    );
  }

  return (
    <>
      <Seo
        title={seoData.title}
        description={seoData.description}
        pathname={seoData.pathname}
        siteConfig={publishedContent?.siteConfig}
      />
      <main id="main-content">
        <Section>
          <div className="service-hero">
            <p className="eyebrow">{service.name}</p>
            <h1>{service.name}</h1>
            <p className="lead-text">{service.summary}</p>
          </div>

          <div className="service-grid">
            <article className="service-card">
              <h2>Best For</h2>
              <p>{service.bestFor}</p>
            </article>

            <article className="service-card">
              <h2>The Problem We Solve</h2>
              <p>{service.pain}</p>
            </article>

            <article className="service-card">
              <h2>Expected Outcomes</h2>
              <p>{service.outcomes}</p>
            </article>

            <article className="service-card">
              <h2>Engagement Model</h2>
              <p>{service.engagementModel}</p>
            </article>

            <article className="service-card">
              <h2>Timeline</h2>
              <p>{service.timeline}</p>
            </article>

            <article className="service-card">
              <h2>Typical Range</h2>
              <p>{service.range}</p>
            </article>
          </div>

          <div className="service-deliverables">
            <h2>What You'll Get</h2>
            <ul>
              {service.deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="service-cta">
            <h2>{service.nextStep}</h2>
            <a href="#book-call" className="btn">
              Get a Scoped Plan
            </a>
          </div>
        </Section>
      </main>
    </>
  );
}
