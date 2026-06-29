import React from "react";

const FOOTER_LINKS = [
  { label: "The Problem", href: "#problem" },
  { label: "Feautres", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Roles", href: "#roles" },
];

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12a10 10 0 10-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0022 12z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.3-.8.5-1.7.8-2.6 1a4 4 0 00-6.9 3.6A11.4 11.4 0 014 4.9a4 4 0 001.2 5.3 4 4 0 01-1.8-.5 4 4 0 003.2 3.9 4 4 0 01-1.8.1 4 4 0 003.7 2.8A11.4 11.4 0 012 18.6 11.4 11.4 0 008.3 20c7.5 0 11.7-6.3 11.7-11.7v-.5c.8-.6 1.5-1.3 2-2z" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm5.6 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.1.2-3.4-.7-2.9-1.1-4.7-4-4.9-4.3-.1-.2-1.1-1.5-1.1-2.8 0-1.4.7-2 1-2.3.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .6-.3.6-.6.8-.9 1.2-.1.1-.2.3 0 .6.3.6 1 1.4 1.8 2.1.9.8 1.7 1.1 2.1 1.3.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.7.9c.2.1.4.2.4.4.1.2.1.6-.1 1.3z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.9 4 12 4 12 4s-3.9 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.7v1.6c0 1.8.2 3.5.2 3.5s.2 1.5.8 2.1c.8.8 1.8.8 2.3.9 1.7.2 7.1.2 7.1.2s3.9 0 6.7-.3c.4 0 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.7.2-3.5v-1.6c0-1.7-.2-3.5-.2-3.5zM9.9 14.6V8.9l5.4 2.9-5.4 2.8z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 2 .2 2.8.5.7.3 1.3.7 1.9 1.3.6.6 1 1.2 1.3 1.9.3.8.4 1.6.5 2.8.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 2-.5 2.8a5 5 0 01-1.3 1.9c-.6.6-1.2 1-1.9 1.3-.8.3-1.6.4-2.8.5-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-2-.2-2.8-.5a5 5 0 01-1.9-1.3 5 5 0 01-1.3-1.9c-.3-.8-.4-1.6-.5-2.8C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-2 .5-2.8.3-.7.7-1.3 1.3-1.9.6-.6 1.2-1 1.9-1.3.8-.3 1.6-.4 2.8-.5C8.4 2.2 8.8 2.2 12 2.2zm0 2.6c-.9 0-1.1 0-3.4.1-1 .1-1.7.2-2.1.4-.5.2-.9.4-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1.1-.4 2.1-.1 2.3-.1 2.5-.1 3.4s0 1.1.1 3.4c.1 1 .2 1.7.4 2.1.2.5.4.9.8 1.3.4.4.8.6 1.3.8.4.2 1.1.3 2.1.4 2.3.1 2.5.1 3.4.1s1.1 0 3.4-.1c1-.1 1.7-.2 2.1-.4.5-.2.9-.4 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1.1.4-2.1.1-2.3.1-2.5.1-3.4s0-1.1-.1-3.4c-.1-1-.2-1.7-.4-2.1-.2-.5-.4-.9-.8-1.3a2.4 2.4 0 00-1.3-.8c-.4-.2-1.1-.3-2.1-.4-2.3-.1-2.5-.1-3.4-.1zm0 4.4a4.8 4.8 0 110 9.6 4.8 4.8 0 010-9.6zm0 2.6a2.2 2.2 0 100 4.4 2.2 2.2 0 000-4.4zm6.1-3.3a1.1 1.1 0 11-2.2 0 1.1 1.1 0 012.2 0z" />
    </svg>
  );
}

const SOCIALS = [
  { label: "Facebook", href: "#", Icon: FacebookIcon },
  { label: "Twitter", href: "#", Icon: TwitterIcon },
  { label: "WhatsApp", href: "#", Icon: WhatsappIcon },
  { label: "YouTube", href: "#", Icon: YoutubeIcon },
  { label: "Instagram", href: "#", Icon: InstagramIcon },
];

export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="landing-footer">
      <div className="landing-footer__logo">
        <span className="landing-footer__logo-mark"></span>
        <span>InvenPro</span>
      </div>

      <nav className="landing-footer__links">
        {FOOTER_LINKS.map((link) => (
          <a key={link.label} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>

      <div className="landing-footer__socials">
        {SOCIALS.map(({ label, href, Icon }) => (
          <a key={label} href={href} aria-label={label}>
            <Icon />
          </a>
        ))}
      </div>

      <div className="landing-footer__bottom">
        Copyright © {year} InvenPro | All Rights Reserved |{" "}
        <a href="#terms">Terms and Conditions</a> | <a href="#privacy">Privacy Policy</a>
      </div>
    </footer>
  );
}