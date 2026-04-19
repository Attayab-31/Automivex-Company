import { useEffect, useMemo, useState } from "react";
import { StatusCard } from "@/components/feedback/StatusCard";
import { useCaseStudyPdf } from "@/features/case-studies/hooks/useCaseStudyPdf";
import { Section } from "@/shared/ui/Section";
import { formatDateLabel } from "@/shared/utils/formatDate";

export default function CaseStudiesSection({ caseStudies, contentMeta }) {
  const [activeTitle, setActiveTitle] = useState(caseStudies[0]?.title || "");

  useEffect(() => {
    if (!caseStudies.some((caseStudy) => caseStudy.title === activeTitle)) {
      setActiveTitle(caseStudies[0]?.title || "");
    }
  }, [activeTitle, caseStudies]);

  const activeCaseStudy = useMemo(() => {
    return (
      caseStudies.find((caseStudy) => caseStudy.title === activeTitle) ||
      caseStudies[0] ||
      null
    );
  }, [activeTitle, caseStudies]);

  const downloadPdf = useCaseStudyPdf(activeCaseStudy);

  return (
    <Section
      id="case-studies"
      eyebrow="Selected Client Work"
      title="Recent projects, what changed, and why it mattered"
    >
      <p className="section-intro">
        A few examples of the problems we solved, the delivery approach we used, and
        the outcomes that mattered to the client.
      </p>

      {!activeCaseStudy ? (
        <StatusCard>Published case-study content is temporarily unavailable.</StatusCard>
      ) : (
        <>
          <div className="study-switch">
            {caseStudies.map((caseStudy) => (
              <button
                key={caseStudy.title}
                className={`tab-btn ${activeTitle === caseStudy.title ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTitle(caseStudy.title)}
              >
                {caseStudy.title}
              </button>
            ))}
          </div>

          <div className="study-authority">
            <article>
              <div className="content-meta-row">
                <h3>{activeCaseStudy.title}</h3>
                <span className="content-badge">{activeCaseStudy.sector}</span>
              </div>
              <p>
                <strong>Client:</strong> {activeCaseStudy.client}
              </p>
              <p>
                <strong>Overview:</strong> {activeCaseStudy.summary}
              </p>
              <p>
                <strong>Problem:</strong> {activeCaseStudy.before}
              </p>
              <p>
                <strong>Result:</strong> {activeCaseStudy.after}
              </p>

              <div className="content-pill-row">
                {activeCaseStudy.scope.map((item) => (
                  <span key={item} className="content-pill">
                    {item}
                  </span>
                ))}
              </div>

              <ul>
                {activeCaseStudy.timeline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="metric-row">
                {activeCaseStudy.metrics.map((metric) => (
                  <span key={metric.label}>{`${metric.label}: ${metric.value}`}</span>
                ))}
              </div>

              <div className="case-study-evidence">
                <h4>Delivery Notes</h4>
                <ul>
                  {activeCaseStudy.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <button className="btn" type="button" onClick={() => void downloadPdf()}>
                Download case study summary
              </button>

              <p className="section-footnote">
                {activeCaseStudy.governance.evidenceSummary}
              </p>
              <p className="section-footnote">
                {`Last reviewed ${formatDateLabel(activeCaseStudy.governance.lastReviewedAt)}. ${activeCaseStudy.governance.reviewCycle} review cycle.`}
              </p>
            </article>

            <div className="arch-diagram">
              <h4>Delivery Path</h4>
              {activeCaseStudy.architecture.map((node, index) => (
                <div key={node} className="arch-node">
                  <span>{node}</span>
                  {index < activeCaseStudy.architecture.length - 1 ? (
                    <div className="arch-arrow">-&gt;</div>
                  ) : null}
                </div>
              ))}

              <p className="section-footnote">
                {`Content updated ${formatDateLabel(contentMeta.publishedAt)}.`}
              </p>
            </div>
          </div>
        </>
      )}
    </Section>
  );
}
