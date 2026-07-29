import { Suspense, lazy, useMemo } from "react";
import { AsyncSectionFallback } from "@/components/feedback/AsyncSectionFallback";
import HeroSection from "@/features/hero/components/HeroSection";
import { useSiteContentQuery } from "@/hooks/useSiteContentQuery";
import { Seo } from "@/shared/ui/Seo";
import { PageLoader } from "@/components/feedback/PageLoader";
import { fallbackHomeContent } from "@/app/routes/homePageContent";

const ProofSection = lazy(() => import("@/features/proof/components/ProofSection"));
const WhyChooseSection = lazy(() =>
  import("@/features/why-choose/components/WhyChooseSection")
);
const ServicesSection = lazy(() =>
  import("@/features/services/components/ServicesSection")
);
const CaseStudiesSection = lazy(() =>
  import("@/features/case-studies/components/CaseStudiesSection")
);
const QualificationSection = lazy(() =>
  import("@/features/qualification/components/QualificationSection")
);
const TrustSection = lazy(() => import("@/features/trust/components/TrustSection"));
const BookingSection = lazy(() =>
  import("@/features/booking/components/BookingSection")
);
const ContactSection = lazy(() => import("@/features/contact/components/ContactSection"));

export default function HomePage() {
  const siteContentQuery = useSiteContentQuery();

  const publishedContent =
    siteContentQuery.data?.status === "published" ? siteContentQuery.data.content : null;

  const content = useMemo(() => {
    return publishedContent || fallbackHomeContent;
  }, [publishedContent]);

  const seoData = useMemo(() => {
    if (!content?.siteConfig || !content?.organizationStructuredData) {
      return null;
    }
    return {
      title: content.siteConfig.title,
      description: content.siteConfig.description,
      structuredData: content.organizationStructuredData,
    };
  }, [content]);

  if (siteContentQuery.isPending) {
    return <PageLoader />;
  }

  return (
    <>
      {seoData && (
        <Seo
          title={seoData.title}
          description={seoData.description}
          pathname="/"
          structuredData={seoData.structuredData}
          siteConfig={publishedContent.siteConfig}
          keywords="AI development, automation engineering, SaaS development, Shopify development, computer vision, software company"
        />
      )}

      <main id="main-content">
        <HeroSection heroContent={content.hero} />

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Why Automivex"
              title="A smaller team, a clearer process, and software built for production"
            />
          }
        >
          <WhyChooseSection whyChooseContent={content.whyChoose} />
        </Suspense>

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Delivery Snapshot"
              title="A few numbers behind the work"
            />
          }
        >
          <ProofSection
            proofSnapshot={content.proofSnapshot}
            isLoading={false}
            error={null}
          />
        </Suspense>

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Services For Every Stage"
              title="Software delivery for quick wins, growth projects, and serious builds"
            />
          }
        >
          <ServicesSection
            services={content.services}
            contentMeta={{
              publishedAt: content.publishedAt,
              sourceLabel: content.sourceLabel,
            }}
          />
        </Suspense>

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Selected Client Work"
              title="Recent projects, what changed, and why it mattered"
            />
          }
        >
          <CaseStudiesSection
            caseStudies={content.caseStudies}
            contentMeta={{
              publishedAt: content.publishedAt,
              sourceLabel: content.sourceLabel,
            }}
          />
        </Suspense>

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Project Fit Check"
              title="Tell us what you need. We'll recommend the right starting point."
            />
          }
        >
          <QualificationSection
            qualificationQuestions={content.qualificationQuestions}
          />
        </Suspense>

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Trust & Delivery"
              title="How scope, communication, and security are handled"
            />
          }
        >
          <TrustSection
            trustItems={content.trustItems}
            contentMeta={{
              publishedAt: content.publishedAt,
              sourceLabel: content.sourceLabel,
            }}
          />
        </Suspense>

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Get A Scoped Plan"
              title="Tell us what you need and we'll recommend the best next step"
            />
          }
        >
          <BookingSection
            projectTypeOptions={content.projectTypeOptions}
            budgetOptions={content.budgetOptions}
          />
        </Suspense>

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Contact"
              title="Easy next steps, clear response times"
            />
          }
        >
          <ContactSection
            siteConfig={content.siteConfig}
            legalLinks={content.legalLinks}
          />
        </Suspense>
      </main>
    </>
  );
}
