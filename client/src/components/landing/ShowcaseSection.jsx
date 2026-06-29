import React from "react";
import dashboard from "../../assets/dashboard.png";
import products from "../../assets/products.png";
import suppliers from "../../assets/sales.png";

const SHOWCASE_ITEMS = [
  {
    title: "Monitor Dashboard Overview",
    description:
      "Monitor stock, sales, and key business alerts from one real-time operating dashboard.",
    image: dashboard,
  },
  {
    title: " Products Catalog $ Scan",
    description:
      "Manage your inventory catalog, stock levels, and product details in one place.",
    image: products,
  },
  {
    title: "Sales Management Workflow",
    description:
      "Create transactions, track invoices, and update stock instantly from the sales workflow.",
    image: suppliers,
  },
 
];

export default function ShowcaseSection() {
  return (
    <section className="showcase" id="showcase">
      <div className="container">
        <div className="section-label-row">
          <h2>Product Experience Showcase</h2>
          <p>Explore the powerful interactive screens built natively inside InvenPro.</p>
        </div>

        <div className="showcase__grid">
          {SHOWCASE_ITEMS.map((item) => (
            <div className="showcase-card" key={item.title}>
              <div className="showcase-card__frame">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="showcase-card__placeholder">
                 
                  </div>
                )}
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}