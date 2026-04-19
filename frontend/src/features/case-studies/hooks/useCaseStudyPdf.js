import { useCallback } from "react";
import { trackEvent } from "@/lib/analytics";

export function useCaseStudyPdf(activeCaseStudy) {
  return useCallback(async () => {
    if (!activeCaseStudy) {
      return;
    }

    const { jsPDF } = await import("jspdf");
    const documentPdf = new jsPDF();

    documentPdf.setFontSize(16);
    documentPdf.text(activeCaseStudy.title, 14, 20);
    documentPdf.setFontSize(11);
    documentPdf.text(`Client: ${activeCaseStudy.client}`, 14, 30);
    documentPdf.text(`Sector: ${activeCaseStudy.sector}`, 14, 38);
    documentPdf.text(`Summary: ${activeCaseStudy.summary}`, 14, 48, { maxWidth: 180 });
    documentPdf.text(`Before: ${activeCaseStudy.before}`, 14, 66, { maxWidth: 180 });
    documentPdf.text(`After: ${activeCaseStudy.after}`, 14, 84, { maxWidth: 180 });
    documentPdf.text(`Scope: ${activeCaseStudy.scope.join(" | ")}`, 14, 102, {
      maxWidth: 180,
    });
    documentPdf.text(
      `Timeline: ${activeCaseStudy.timeline.join(" | ")}`,
      14,
      120,
      { maxWidth: 180 }
    );
    documentPdf.text(
      `Metrics: ${activeCaseStudy.metrics.map((metric) => `${metric.label}: ${metric.value}`).join(", ")}`,
      14,
      138,
      { maxWidth: 180 }
    );
    documentPdf.text(
      `Architecture: ${activeCaseStudy.architecture.join(" -> ")}`,
      14,
      156,
      { maxWidth: 180 }
    );
    documentPdf.save(
      `${activeCaseStudy.title.replace(/\s+/g, "-").toLowerCase()}-summary.pdf`
    );

    trackEvent("case_study_pdf_downloaded", {
      title: activeCaseStudy.title,
    });
  }, [activeCaseStudy]);
}
