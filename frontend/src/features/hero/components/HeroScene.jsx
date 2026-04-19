import { memo } from "react";

export const HeroScene = memo(function HeroScene({ reducedMotion = false }) {
  return (
    <div
      className={`hero-scene ${reducedMotion ? "hero-scene-reduced" : ""}`}
      aria-hidden="true"
    >
      <div className="hero-scene-grid" />
      <div className="hero-orb hero-orb-primary" />
      <div className="hero-orb hero-orb-secondary" />

      <div className="hero-visual-shell hero-visual-shell-primary">
        <span className="hero-shell-label">From brief to release</span>
        <strong>{"Scope -> Build -> Launch"}</strong>
      </div>

      <div className="hero-visual-shell hero-visual-shell-secondary">
        <span className="hero-shell-label">Built for real teams</span>
        <strong>Quick fixes, internal tools, AI features, product builds</strong>
      </div>

      <div className="hero-diagram">
        <div className="hero-diagram-node">Project Brief</div>
        <div className="hero-diagram-arrow" />
        <div className="hero-diagram-node">Scoped Plan</div>
        <div className="hero-diagram-arrow" />
        <div className="hero-diagram-node">Working Release</div>
      </div>

      <div className="hero-chip-row">
        <span>AI Features</span>
        <span>Automation</span>
        <span>SaaS</span>
        <span>Shopify</span>
      </div>
    </div>
  );
});
