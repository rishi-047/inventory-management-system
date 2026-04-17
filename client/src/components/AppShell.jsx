import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navigationItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/inventory", icon: "inventory_2", label: "Inventory" },
  { to: "/inventory/new", icon: "add_box", label: "New Entry" },
  { to: "/transactions", icon: "point_of_sale", label: "Transactions" },
  { to: "/alerts", icon: "warning", label: "Alerts" }
];

function AppShell({ title, subtitle, children }) {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-head">
          <div className="app-brand">
            <div className="app-brand-mark">
              <span className="material-symbols-outlined auth-icon-filled">barcode_scanner</span>
            </div>
            <div>
              <h1>MAIN_TERMINAL</h1>
              <span>SECTOR_07_WHSE</span>
            </div>
          </div>

          <button type="button" className="app-scan-button">
            <span className="material-symbols-outlined">qr_code_scanner</span>
            SCAN_BARCODE
          </button>
        </div>

        <nav className="app-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `app-nav-link${isActive ? " is-active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" ? (
            <NavLink
              to="/users"
              className={({ isActive }) => `app-nav-link${isActive ? " is-active" : ""}`}
            >
              <span className="material-symbols-outlined">group</span>
              Users
            </NavLink>
          ) : null}
        </nav>

        <div className="app-sidebar-foot">
          <button type="button" className="app-nav-link ghost-nav-link" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            End Session
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div>
            <p className="app-topbar-kicker">{subtitle}</p>
            <h2>{title}</h2>
          </div>

          <div className="app-topbar-user">
            <div>
              <strong>{user?.fullName}</strong>
              <span>{user?.role}</span>
            </div>
            <div className="app-avatar">
              <span className="material-symbols-outlined">shield_person</span>
            </div>
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}

export default AppShell;
