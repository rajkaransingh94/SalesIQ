// frontend/src/components/Navbar.jsx
// Left-hand nav rail. Clicking an item switches which section of the
// (single-page) dashboard is shown — see pages/Dashboard.jsx.

export const NAV_TABS = [
  { id: "overview", label: "Overview" },
  { id: "trends", label: "Sales Trends" },
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
];

export default function Navbar({ activeTab, onSelectTab }) {
  return (
    <nav className="nav-rail">
      <div className="nav-rail__brand">
        <span className="nav-rail__brand-mark">SalesIQ</span>
      </div>
      <div className="nav-rail__tagline">Sales analytics for the fictional retailer used in this project.</div>

      <div className="nav-rail__section-label">Dashboard</div>
      {NAV_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`nav-rail__item ${activeTab === tab.id ? "nav-rail__item--active" : ""}`}
          onClick={() => onSelectTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}

      <div className="nav-rail__spacer" />
      <div className="nav-rail__footnote">
        Data shown is randomly generated sample data and does not represent a real business.
      </div>
    </nav>
  );
}
