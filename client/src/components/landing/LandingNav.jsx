import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getToken } from "../../services/authService";

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Workflow", href: "#workflow" },
  { label: "Roles", href: "#roles" },
];

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLinks, setShowLinks] = useState(true);
  const lastScrollY = useRef(0);
  const token = getToken();
  const ctaLabel = token ? "Go to Dashboard" : "Get Started";
  const ctaTo = token ? "/dashboard" : "/login";

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY <= 40) {
        setShowLinks(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowLinks(false);
      } else {
        setShowLinks(true);
      }

      lastScrollY.current = currentScrollY;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="landing-nav">
      <a href="#top" className="landing-nav__logo" onClick={closeMenu}>
        <span className="landing-nav__logo-mark">📦</span>
        <span>Inven<span>Pro</span></span>
      </a>

      <nav className={`landing-nav__links${showLinks ? " landing-nav__links--visible" : ""}`} aria-label="Primary navigation">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="landing-nav__cta">
        <Link to={ctaTo} className="btn btn-primary" onClick={closeMenu}>
          <span className="full">{ctaLabel}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </Link>
      </div>

      <button
        type="button"
        className="landing-nav__toggle"
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      {menuOpen && (
        <div className="landing-nav__mobile-menu">
          <nav className="landing-nav__mobile-links" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </nav>
          <Link to={ctaTo} className="btn btn-primary" onClick={closeMenu}>
            {ctaLabel}
          </Link>
        </div>
      )}
    </header>
  );
}