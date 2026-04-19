import { memo, useMemo } from "react";
import { frontendEnv } from "@/lib/env";
import { useSiteContentQuery } from "@/hooks/useSiteContentQuery";

export const Footer = memo(function Footer({ year }) {
  const { data: response } = useSiteContentQuery();
  const siteConfig = useMemo(() => response?.status === "published" ? response.content?.siteConfig : null, [response]);
  const legalLinks = useMemo(() => response?.status === "published" ? response.content?.legalLinks || [] : [], [response]);

  if (!siteConfig) {
    return null;
  }

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p>{`Copyright ${year} ${siteConfig.brand}. All rights reserved.`}</p>
          <p>AI, automation, SaaS, Shopify, and practical software delivery.</p>
          <a href={siteConfig.websiteUrl} target="_blank" rel="noopener noreferrer">
            {siteConfig.websiteUrl}
          </a>
          <a href={`mailto:${siteConfig.contact.primaryEmail}`}>
            {siteConfig.contact.primaryEmail}
          </a>
        </div>

        <div className="footer-links-group">
          <span>Start</span>
          <a href="#book-call">Get Scoped Plan</a>
          <a href="#assistant">Check Project Fit</a>
          <a
            href={frontendEnv.calendlyUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book Discovery Call
          </a>
          <a href="#contact-details">Contact</a>
        </div>

        <div className="footer-links-group">
          <span>Legal</span>
          {legalLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <div className="footer-links-group">
          <span>Presence</span>
          {siteConfig.socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
});
