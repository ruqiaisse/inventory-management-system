import React from "react";

const PURCHASE_STAGES = [
  {
    label: "Draft",
    dotClass: "workflow-dot--gray",
    badgeClass: "workflow-badge--gray",
    description: "Purchase request created by staff with item details and quantity.",
    active: false,
  },
  {
    label: "Submitted",
    dotClass: "workflow-dot--yellow",
    badgeClass: "workflow-badge--yellow",
    description: "Request sent to manager for review and budget check.",
    active: true,
  },
  {
    label: "Approved",
    dotClass: "workflow-dot--blue",
    badgeClass: "workflow-badge--blue",
    description: "Manager approves. Supplier notified automatically via email.",
    active: false,
  },
  {
    label: "Received",
    dotClass: "workflow-dot--green",
    badgeClass: "workflow-badge--green",
    description: "Stock arrives, scanned in, inventory updated in real time.",
    active: false,
  },
];

const SALES_STAGES = [
  {
    label: "Customer",
    dotClass: "workflow-dot--gray",
    badgeClass: "workflow-badge--gray",
    description: "Customer profile selected or created before the transaction begins.",
    active: false,
  },
  {
    label: "Select Products",
    dotClass: "workflow-dot--yellow",
    badgeClass: "workflow-badge--yellow",
    description: "Items are added to the cart with quantities and pricing.",
    active: false,
  },
  {
    label: "Generate Invoice",
    dotClass: "workflow-dot--blue",
    badgeClass: "workflow-badge--blue",
    description: "A sales invoice is prepared and payment is confirmed.",
    active: false,
  },
  {
    label: "Complete Sale",
    dotClass: "workflow-dot--green",
    badgeClass: "workflow-badge--green",
    description: "The sale is finalized and recorded in the system.",
    active: false,
  },
  {
    label: "Stock Updated",
    dotClass: "workflow-dot--green",
    badgeClass: "workflow-badge--green",
    description: "Inventory is adjusted immediately as products leave stock.",
    active: false,
  },
  {
    label: "Activity Logged",
    dotClass: "workflow-dot--green",
    badgeClass: "workflow-badge--green",
    description: "Every sale is tracked for reporting and system auditing.",
    active: false,
  },
];

export default function WorkflowSection() {
  return (
    <section className="workflow" id="workflow">
      <div className="container">
        <div className="section-label-row">
          <h2>Purchase Order Life Cycle Management</h2>
          <p>
            Our distinctive automated core feature workflow system tracking
            assets seamlessly.
          </p>
        </div>

        <div className="workflow__grid">
          {PURCHASE_STAGES.map((stage) => (
            <div
              key={stage.label}
              className={`workflow-card ${stage.active ? "workflow-card--active" : ""}`}
            >
              <div className="workflow-card__head">
                <span className={`workflow-dot ${stage.dotClass}`} />
                <span className={`workflow-badge ${stage.badgeClass}`}>
                  {stage.label}
                </span>
              </div>
              <p>{stage.description}</p>
            </div>
          ))}
        </div>

        <div className="section-label-row" style={{ marginTop: "3rem" }}>
          <h2>Sales Workflow</h2>
          <p>
            Manage the full outgoing stock journey from customer selection to final sale and stock updates.
          </p>
        </div>

        <div className="workflow__grid">
          {SALES_STAGES.map((stage) => (
            <div key={stage.label} className="workflow-card">
              <div className="workflow-card__head">
                <span className={`workflow-dot ${stage.dotClass}`} />
                <span className={`workflow-badge ${stage.badgeClass}`}>
                  {stage.label}
                </span>
              </div>
              <p>{stage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}