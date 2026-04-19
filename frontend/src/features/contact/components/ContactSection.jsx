import { frontendEnv } from "@/lib/env";
import { Section } from "@/shared/ui/Section";

export default function ContactSection({ siteConfig = {}, legalLinks = [] }) {
  return (
    <Section
      id="contact-details"
      eyebrow="Contact"
      title="Easy next steps, clear response times"
    >
      <div className="contact-grid">
        <article className="contact-card">
          <h3>Start here</h3>
          <p>
            Send a brief if you want a written response, or book a call if you want to
            talk through scope live. Either way, we’ll tell you the best next step.
          </p>
          <ul className="contact-list">
            <li>
              <strong>Sales inbox:</strong>{" "}
              <a href={`mailto:${siteConfig.contact.primaryEmail}`}>
                {siteConfig.contact.primaryEmail}
              </a>
            </li>
            <li>
              <strong>Legal inbox:</strong>{" "}
              <a href={`mailto:${siteConfig.contact.legalEmail}`}>
                {siteConfig.contact.legalEmail}
              </a>
            </li>
            <li>
              <strong>Response time:</strong> {siteConfig.contact.responseWindow}
            </li>
            <li>
              <strong>What happens next:</strong> We review the scope, confirm fit, and
              recommend a quick sprint, scoped build, or discovery call.
            </li>
          </ul>
          <div className="contact-links">
            <a className="btn" href="#book-call">
              Get a scoped plan
            </a>
            <a
              className="btn ghost"
              href={frontendEnv.calendlyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book discovery call
            </a>
          </div>
        </article>

        <article className="contact-card">
          <h3>Company & verification</h3>
          <p>
            Use the channels below if you want to verify identity, review company
            presence, or continue the conversation through a public profile.
          </p>
          <ul className="contact-list">
            <li>
              <strong>Website:</strong>{" "}
              <a href={siteConfig.websiteUrl} target="_blank" rel="noopener noreferrer">
                {siteConfig.websiteUrl}
              </a>
            </li>
            {siteConfig.socialLinks.map((link) => (
              <li key={link.href}>
                <strong>{link.label}:</strong>{" "}
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.href}
                </a>
              </li>
            ))}
          </ul>
        </article>

        <article className="contact-card">
          <h3>Policies & public documents</h3>
          <p>
            Privacy, terms, and cookie policies are public so you can review how
            inquiries and site usage are handled before sharing project details.
          </p>
          <ul className="contact-list">
            <li>
              <strong>Policy contact:</strong>{" "}
              <a href={`mailto:${siteConfig.contact.legalEmail}`}>
                {siteConfig.contact.legalEmail}
              </a>
            </li>
            {legalLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </Section>
  );
}
