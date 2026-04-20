import { memo, useCallback, useEffect, useMemo } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useSiteContentQuery } from "@/hooks/useSiteContentQuery";
import { useUiStore } from "@/shared/stores/uiStore";

export const Header = memo(function Header({ theme, onToggleTheme }) {
  const { data: response } = useSiteContentQuery();
  const siteConfig = useMemo(() => response?.status === "published" ? response.content?.siteConfig : null, [response]);
  const navItems = useMemo(() => response?.status === "published" ? response.content?.nav || [] : [], [response]);
  
  const menuOpen = useUiStore((state) => state.mobileMenuOpen);
  const setMobileMenuOpen = useUiStore((state) => state.setMobileMenuOpen);
  const closeMobileMenu = useUiStore((state) => state.closeMobileMenu);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(min-width: 981px)");
    const handleChange = (event) => {
      if (event.matches) {
        closeMobileMenu();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [closeMobileMenu]);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen(!menuOpen);
  }, [menuOpen, setMobileMenuOpen]);

  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <a href="#top" className="brand brand-logo-only" onClick={closeMobileMenu}>
            <img src="/logo.svg" alt="Automivex - The Intelligent Solutions" className="logo-image" />
          </a>

          <nav className="site-nav" aria-label="Primary">
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              aria-pressed={theme === "light"}
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
              <span>{theme === "dark" ? "Day" : "Night"}</span>
            </button>

            <a href="#book-call" className="btn btn-sm">
              Get Scoped Plan
            </a>

            <button
              className={`nav-toggle ${menuOpen ? "open" : ""}`}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={toggleMenu}
            >
              <span />
              <span />
              <span />
              <span className="nav-toggle-label">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <button
        className={`mobile-nav-backdrop ${menuOpen ? "open" : ""}`}
        type="button"
        aria-hidden={!menuOpen}
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMobileMenu}
      />

      <aside
        id="mobile-navigation"
        className={`mobile-nav-panel ${menuOpen ? "open" : ""}`}
        aria-label="Mobile navigation"
      >
        <nav className="mobile-nav-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={closeMobileMenu}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mobile-nav-actions">
          <a href="#book-call" className="btn" onClick={closeMobileMenu}>
            Get Scoped Plan
          </a>
          {siteConfig?.contact?.primaryEmail && (
            <a
              href={`mailto:${siteConfig.contact.primaryEmail}`}
              className="mobile-nav-contact"
            >
              {siteConfig.contact.primaryEmail}
            </a>
          )}
        </div>
      </aside>
    </>
  );
});
