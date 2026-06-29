import React, { useEffect } from "react";
import "../styles/landing.css";

import LandingNav from "../components/landing/LandingNav";
import HeroSection from "../components/landing/HeroSection";
import ProblemSolution from "../components/landing/ProblemSolution";
import FeaturesSection from "../components/landing/FeaturesSection";
import ShowcaseSection from "../components/landing/ShowcaseSection";
import WorkflowSection from "../components/landing/WorkflowSection";
import RolesSection from "../components/landing/RolesSection";
import CTASection from "../components/landing/CTASection";
import LandingFooter from "../components/landing/LandingFooter";

export default function LandingPage() {
  useEffect(() => {
    document.title = "InvenPro — Inventory Management System";

    const sections = Array.from(document.querySelectorAll(".landing-page section"));
    sections.forEach((section) => section.classList.add("landing-section"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <LandingNav />
      <HeroSection />
      <ProblemSolution />
      <FeaturesSection />
      <ShowcaseSection />
      <WorkflowSection />
      <RolesSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
}