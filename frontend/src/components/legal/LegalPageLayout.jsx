import { Link } from "react-router-dom";

export function LegalPageLayout({
  eyebrow,
  title,
  description,
  highlights,
  primarySections,
  secondarySections,
  footerCopy,
  footerLinks,
  cta,
  siteConfig = {},
}) {
  return (
    <main className="legal-main" id="main-content">
      <div className="policy-shell">
        <header className="policy-topbar">
          <Link className="policy-brand" to="/">
            <span className="policy-dot" />
            {siteConfig.brand}
          </Link>

          <nav className="policy-links" aria-label="Policy navigation">
            <Link to="/">Home</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </nav>
        </header>

        <section className="policy-hero">
          <p className="policy-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>

          <div className="policy-pill-row">
            {highlights.map((item) => (
              <span key={item} className="policy-pill">
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="policy-grid">
          <div className="policy-stack">
            {primarySections.map((section) => (
              <article key={section.title} className="policy-card">
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items ? (
                  <ul className="policy-list">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>

          <aside className="policy-stack">
            {secondarySections.map((section) => (
              <article key={section.title} className="policy-card">
                <h3>{section.title}</h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.items ? (
                  <ul className="policy-list">
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                {section.link ? (
                  <Link className="policy-cta" to={section.link.href}>
                    {section.link.label}
                  </Link>
                ) : null}
              </article>
            ))}
          </aside>
        </section>

        <footer className="policy-footer">
          <p>{footerCopy}</p>
          <div className="policy-footer-links">
            {footerLinks.map((link) => (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ))}
            {cta ? <Link to={cta.href}>{cta.label}</Link> : null}
          </div>
        </footer>
      </div>
    </main>
  );
}
