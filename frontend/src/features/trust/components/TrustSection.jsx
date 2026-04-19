import { useEffect, useMemo, useState } from "react";
import { FaLock, FaServer, FaShieldAlt, FaTools } from "react-icons/fa";
import { StatusCard } from "@/components/feedback/StatusCard";
import { Section } from "@/shared/ui/Section";
import { formatDateLabel } from "@/shared/utils/formatDate";

const trustIcons = {
  data: FaLock,
  sdlc: FaTools,
  security: FaShieldAlt,
  support: FaServer,
};

export default function TrustSection({ trustItems, contentMeta }) {
  const [activeTabId, setActiveTabId] = useState(trustItems[0]?.id || "");

  useEffect(() => {
    if (!trustItems.some((item) => item.id === activeTabId)) {
      setActiveTabId(trustItems[0]?.id || "");
    }
  }, [activeTabId, trustItems]);

  const activeTab = useMemo(() => {
    return trustItems.find((item) => item.id === activeTabId) || trustItems[0] || null;
  }, [activeTabId, trustItems]);
  const Icon = trustIcons[activeTab?.iconKey] || FaShieldAlt;

  return (
    <Section
      id="trust-center"
      eyebrow="Trust & Delivery"
      title="How scope, communication, and security are handled"
    >
      <p className="section-intro">
        Clients should know how work is scoped, reviewed, shipped, and supported
        before they commit. This section explains how Automivex handles that in
        practice.
      </p>

      {!activeTab ? (
        <StatusCard>Published trust-center content is temporarily unavailable.</StatusCard>
      ) : (
        <>
          <div className="study-switch">
            {trustItems.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab.id === tab.id ? "active" : ""}`}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <div className="trust-panel">
            <Icon />
            <div>
              <div className="content-meta-row">
                <h3>{activeTab.title}</h3>
                <span className="content-badge">Reviewed</span>
              </div>
              <p>{activeTab.summary}</p>
              <ul>
                {activeTab.commitments.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="case-study-evidence">
                <h4>What this looks like in practice</h4>
                <ul>
                  {activeTab.evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <p className="section-footnote">{activeTab.governance.evidenceSummary}</p>
              <p className="section-footnote">
                {`Last reviewed ${formatDateLabel(activeTab.governance.lastReviewedAt)}. ${activeTab.governance.reviewCycle} review cycle.`}
              </p>
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
