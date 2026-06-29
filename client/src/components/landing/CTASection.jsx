import React from "react";
import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="cta-section" id="demo">
      <div className="cta-banner">
        <h2>Ready To Streamline Your Inventory Operations?</h2>
        <p>
          Get complete visibility, automate workflows, and eliminate stock
          management headaches starting today.
        </p>
        <Link to="/login" className="btn btn-primary">
          Get Started Now
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </Link>
      </div>
    </section>
  );
}