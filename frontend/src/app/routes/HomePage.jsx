import { Suspense, lazy, useMemo } from "react";
import { AsyncSectionFallback } from "@/components/feedback/AsyncSectionFallback";
import HeroSection from "@/features/hero/components/HeroSection";
import { useSiteContentQuery } from "@/hooks/useSiteContentQuery";
import { Seo } from "@/shared/ui/Seo";
import { RouteErrorState } from "@/components/feedback/RouteErrorState";
import { PageLoader } from "@/components/feedback/PageLoader";

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

  // Extract published content - no fallback
  const publishedContent =
    siteContentQuery.data?.status === "published" ? siteContentQuery.data.content : null;

  const seoData = useMemo(() => {
    if (!publishedContent?.siteConfig || !publishedContent?.organizationStructuredData) {
      return null;
    }
    return {
      title: publishedContent.siteConfig.title,
      description: publishedContent.siteConfig.description,
      structuredData: publishedContent.organizationStructuredData,
    };
  }, [publishedContent]);

  // Show loading state while fetching
  if (siteContentQuery.isPending) {
    return <PageLoader />;
  }

  // Show error state if request failed
  if (siteContentQuery.isError) {
    return (
      <RouteErrorState
        title="Content unavailable"
        message="The website content is currently unavailable. Please try again in a few moments."
      />
    );
  }

  // Show error state if no published content available
  if (!publishedContent || siteContentQuery.data?.status !== "published") {
    return (
      <RouteErrorState
        title="No content available"
        message="The website content has not been configured. Please contact the administrator."
      />
    );
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
        />
      )}

      <main id="main-content">
        <HeroSection heroContent={publishedContent.hero} />

        <Suspense
          fallback={
            <AsyncSectionFallback
              eyebrow="Why Automivex"
              title="A smaller team, a clearer process, and software built for production"
            />
          }
        >
          <WhyChooseSection whyChooseContent={publishedContent.whyChoose} />
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
            proofSnapshot={publishedContent.proofSnapshot}
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
            services={publishedContent.services}
            contentMeta={{
              publishedAt: publishedContent.publishedAt,
              sourceLabel: publishedContent.sourceLabel,
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
            caseStudies={publishedContent.caseStudies}
            contentMeta={{
              publishedAt: publishedContent.publishedAt,
              sourceLabel: publishedContent.sourceLabel,
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
            qualificationQuestions={publishedContent.qualificationQuestions}
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
            trustItems={publishedContent.trustItems}
            contentMeta={{
              publishedAt: publishedContent.publishedAt,
              sourceLabel: publishedContent.sourceLabel,
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
            projectTypeOptions={publishedContent.projectTypeOptions}
            budgetOptions={publishedContent.budgetOptions}
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
            siteConfig={publishedContent.siteConfig}
            legalLinks={publishedContent.legalLinks}
          />
        </Suspense>
      </main>
    </>
  );
}
