import React from "react";
import { Link } from "react-router-dom";
import dashboard from "../../assets/dashboard.png";

export default function HeroSection() {
  return (
    <section className="hero" id="top">
      <div className="hero__content">
        <h1>
          Next-Gen Inventory Management for Modern Businesses.
        </h1>
        <p className="hero__subtitle">
          A complete MERN-stack inventory and sales platform to manage products,
          customers, purchases, sales, and business operations in real time.
        </p>
        <div className="hero__cta">
          <Link to="/login" className="btn btn-primary">
            Get Started
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="hero__mockup-wrap">
        <div className="hero__mockup">
          <img src={dashboard} alt="Dashboard screenshot" className="hero__screenshot" />
        

    
        </div>
      </div>
    </section>
  );
}