import { useMemo } from "react";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalPages } from "@/features/legal/content/pages";
import { Seo } from "@/shared/ui/Seo";
import { useSiteContentQuery } from "@/hooks/useSiteContentQuery";

export default function LegalContentPage({ pageKey }) {
  const page = legalPages[pageKey];
  const { data: content } = useSiteContentQuery();
  const siteConfig = useMemo(() => content?.siteConfig, [content?.siteConfig]);

  if (!page) {
    return null;
  }

  return (
    <>
      <Seo
        title={page.title}
        description={page.description}
        pathname={`/${pageKey}`}
        siteConfig={siteConfig}
      />
      <LegalPageLayout
        eyebrow={page.eyebrow}
        title={page.heroTitle}
        description={page.heroDescription}
        highlights={page.highlights}
        primarySections={page.primarySections}
        secondarySections={page.secondarySections}
        footerCopy={page.footerCopy}
        footerLinks={page.footerLinks}
        cta={page.cta}
        siteConfig={siteConfig}
      />
    </>
  );
}
