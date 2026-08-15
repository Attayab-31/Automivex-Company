import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/shared/ui/Seo";
import { useSiteContentQuery } from "@/hooks/useSiteContentQuery";
import { PageLoader } from "@/components/feedback/PageLoader";
import { Section } from "@/shared/ui/Section";
import { getServicePageContent } from "@/app/routes/servicePageContent";

export default function ServiceLandingPage() {
  const { serviceKey } = useParams();
  const siteContentQuery = useSiteContentQuery();

  const publishedContent =
    siteContentQuery.data?.status === "published" ? siteContentQuery.data.content : null;

  const pageContent = useMemo(() => getServicePageContent(serviceKey, publishedContent), [
    publishedContent,
    serviceKey,
  ]);

  if (siteContentQuery.isPending) {
    return <PageLoader />;
  }

  if (!pageContent) {
    return null;
  }

  const { service, seo } = pageContent;

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        pathname={seo.pathname}
        siteConfig={publishedContent?.siteConfig}
        keywords={seo.keywords}
      />
      <main id="main-content" aria-labelledby="service-page-title">
        <Section>
          <nav className="service-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/services">Services</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{service.name}</span>
          </nav>

          <div className="service-hero">
            <p className="eyebrow">{service.name}</p>
            <h1 id="service-page-title">{service.name}</h1>
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
