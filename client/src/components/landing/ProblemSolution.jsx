import React from "react";

const PROBLEMS = [
  "Manual Spreadsheets",
  "Stockouts & Blind Spots",
  "Messy Paper Orders",
  "No Customer Records",
  "Manual Sales Recording",
  "No Sales Analytics",
];

const SOLUTIONS = [
  "Real-Time Inventory Tracking",
  "Automated Low-Stock Alerts",
  "Structured Purchase Order Workflow",
  "Customer Management",
  "Fast Sales & Invoice Generation",
  "Real-Time Sales Reports",
];

function ArrowIcon() {
  
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 5-5" />
    </svg>
  );
}

export default function ProblemSolution() {
  return (
    <section className="problem-solution" id="problem">
      <div className="container">
        <div className="section-label-row">
          <h2>From Problems to Smarter Operations</h2>
        </div>

        <div className="problem-solution__grid">
          <div className="ps-col">
            <h3>Traditional Challenges</h3>
            {PROBLEMS.map((text) => (
              <div className="ps-item" key={text}>
                <div className="ps-icon ps-icon--bad">
                  <XIcon />
                </div>
                <p>{text}</p>
                <span className="ps-arrow">
                  <ArrowIcon />
                </span>
              </div>
            ))}
          </div>

          <div className="ps-col">
            <h3>InvenPro Solution</h3>
            {SOLUTIONS.map((text) => (
              <div className="ps-item" key={text}>
                <div className="ps-icon ps-icon--good">
                  <CheckIcon />
                </div>
                <p>{text}</p>
                <span className="ps-arrow">
                  <ArrowIcon />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}