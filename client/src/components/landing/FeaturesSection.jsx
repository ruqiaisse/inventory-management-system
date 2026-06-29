import React from "react";
import qrImage from "../../assets/qr.png";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

const ACTIVITY_LINES = [1, 2, 3];
const CHART_BARS = [18, 32, 24, 40, 28, 36, 22];

export default function FeaturesSection() {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-label-row">
          <h2>Powerful Features for Modern Businesses</h2>
          <p>
            Everything you need to manage stock, tracking, and operations in one
            unified full-stack workspace.
          </p>
        </div>

        <div className="features__grid">
          {/* Phone / QR card spans both rows */}
          <div className="feature-card feature-card--phone">
            <div className="phone-mockup">
              <div className="phone-mockup__screen">
                <img
                  src={qrImage}
                  alt="QR code"
                  className="phone-mockup__qr"
                />
                <div className="phone-mockup__label">Forge Scan</div>
              </div>
            </div>
            <h3>Barcode &amp; QR Scanning</h3>
            <p>Scan items instantly to add to inventory or check real-time stock levels.</p>
          </div>

          <div className="features__col-right">
            {/* Real-time stock tracking */}
            <div className="feature-card feature-card--dashboard">
              <div className="dashboard-mini-mockup">
                <div className="dashboard-mini-mockup__bar">
                  <span className="dashboard-mini-mockup__dot" />
                  <span className="dashboard-mini-mockup__dot" />
                  <span className="dashboard-mini-mockup__dot" />
                </div>
                <div className="dashboard-mini-mockup__row">
                  {CHART_BARS.map((h, i) => (
                    <span
                      key={i}
                      className="dashboard-mini-mockup__col"
                      style={{ height: `${h}px` }}
                    />
                  ))}
                </div>
              </div>
              <h3>Real-time Stock Tracking</h3>
              <p>Get live updates on every single item across multiple dashboard layouts.</p>
            </div>

            {/* Role based access */}
            <div className="feature-card">
              <div className="role-pills">
                <div className="role-pill role-pill--admin">Admin (Full Control)</div>
                <div className="role-pill role-pill--manager">Manager (Approvals &amp; Reports)</div>
                <div className="role-pill role-pill--staff">Staff (Stock Updates Only)</div>
              </div>
              <h3>Role-Based Access</h3>
              <p>Granular permissions built for Admin, Manager, and Staff roles.</p>
            </div>
          </div>
        </div>

        <div className="features__row-bottom">
          <div className="feature-card feature-card--small">
            <div className="icon-row">
              <div className="icon-chip icon-chip--pdf">PDF</div>
              <div className="icon-chip icon-chip--xls">XLS</div>
            </div>
            <h3>Reports &amp; Analytics</h3>
            <p>Detailed insights with instant export to PDF and Excel sheets directly.</p>
          </div>

          <div className="feature-card feature-card--small">
            <div className="icon-circle">
              <MailIcon />
              <span className="icon-circle__badge" />
            </div>
            <h3>Alerts</h3>
            <p>Automatic notifications for low stock levels and order approval chains.</p>
          </div>

          <div className="feature-card feature-card--small">
            <div className="activity-lines">
              {ACTIVITY_LINES.map((i) => (
                <div className="activity-line" key={i}>
                  <span className="activity-line__dot" />
                  <span className="activity-line__bar" />
                </div>
              ))}
            </div>
            <h3>Activity Log Trail</h3>
            <p>Full immutable audit history tracking every single action in the system.</p>
          </div>

          <div className="feature-card feature-card--small">
            <div className="icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 10h8" />
                <path d="M8 14h5" />
                <path d="M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
              </svg>
            </div>
            <h3>Customer Management</h3>
            <p>Store customer profiles, view purchase history, and search customers instantly.</p>
          </div>

          <div className="feature-card feature-card--small">
            <div className="icon-circle">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="9" r="3" />
                <path d="M4 19c1.2-3.1 3.8-4.5 5-4.5s3.8 1.4 5 4.5" />
                <path d="M16 5h4" />
                <path d="M18 3v4" />
              </svg>
            </div>
            <h3>Sales &amp; Billing</h3>
            <p>Process fast checkouts, deduct stock automatically, and generate invoices.</p>
          </div>
        </div>
      </div>
    </section>
  );
}