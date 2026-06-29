import React from "react";

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 19c0-3.3 2.9-6 6.5-6s6.5 2.7 6.5 6" />
      <circle cx="17" cy="9" r="2.7" />
      <path d="M15.5 13.3c2.6.4 4.5 2.4 5 4.7" />
    </svg>
  );
}

function OrgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="3" width="6" height="6" rx="1" />
      <rect x="3" y="15" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
      <path d="M12 9v3M12 12H6v3M12 12h6v3" />
    </svg>
  );
}

const ROLES = [
  { label: "Admin", Icon: ShieldIcon, description: "Full system access including users, inventory, customers, and reports." },
  { label: "Manager", Icon: UsersIcon, description: "Manage inventory, suppliers, customers, and sales." },
  { label: "Staff", Icon: OrgIcon, description: "Process sales, register customers, and manage stock." },
];

export default function RolesSection() {
  return (
    <section className="roles" id="roles">
      <div className="container">
        <div className="section-label-row">
          <h2>Roles</h2>
          <p>Define system access levels by assigning specific roles to your team members.</p>
        </div>

        <div className="roles__grid">
          {ROLES.map(({ label, Icon, description }) => (
            <div className="role-item" key={label}>
              <div className="role-item__icon">
                <Icon />
              </div>
              <h4>{label}</h4>
              <p>{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}