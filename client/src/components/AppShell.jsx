import { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const baseNavigationItems = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/inventory", icon: "inventory_2", label: "Inventory" },
  { to: "/transactions", icon: "point_of_sale", label: "Transactions" },
  { to: "/alerts", icon: "warning", label: "Alerts" },
  { to: "/activity", icon: "receipt_long", label: "Activity" }
];

function AppShell({ title, children }) {
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 980 : false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.localStorage.getItem("ims-sidebar-collapsed") === "true";
  });

  useEffect(() => {
    function syncViewport() {
      const mobileView = window.innerWidth <= 980;
      setIsMobile(mobileView);
      if (!mobileView) {
        setIsSidebarOpen(false);
      }
    }

    syncViewport();
    window.addEventListener("resize", syncViewport);

    return () => {
      window.removeEventListener("resize", syncViewport);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ims-sidebar-collapsed", String(isSidebarCollapsed));
    }
  }, [isSidebarCollapsed]);

  const navigationItems = useMemo(() => {
    const items = [...baseNavigationItems];

    if (user?.role === "admin") {
      items.splice(2, 0, { to: "/inventory/new", icon: "add_box", label: "New Entry" });
      items.push({ to: "/users", icon: "group", label: "Users" });
    }

    return items;
  }, [user?.role]);

  function handleSidebarToggle() {
    if (isMobile) {
      setIsSidebarOpen((current) => !current);
      return;
    }

    setIsSidebarCollapsed((current) => !current);
  }

  function handleNavSelection() {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }

  return (
    <div className={`app-shell${isSidebarCollapsed && !isMobile ? " is-sidebar-collapsed" : ""}`}>
      <button
        type="button"
        className={`app-sidebar-backdrop${isSidebarOpen ? " is-visible" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-label="Close sidebar"
      />

      <aside className={`app-sidebar${isSidebarOpen ? " is-open" : ""}`}>
        <div className="app-sidebar-head">
          <div className="app-brand">
            <div className="app-brand-mark">
              <span className="material-symbols-outlined auth-icon-filled">barcode_scanner</span>
            </div>
            <div className="app-brand-copy">
              <h1>MAIN_TERMINAL</h1>
              <span>SECTOR_07_WHSE</span>
            </div>
          </div>
        </div>

        <nav className="app-nav">
          {navigationItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavSelection}
              className={({ isActive }) => `app-nav-link${isActive ? " is-active" : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="app-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar-foot">
          <button type="button" className="app-nav-link ghost-nav-link" onClick={logout}>
            <span className="material-symbols-outlined">logout</span>
            <span className="app-nav-label">End Session</span>
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-title">
            <button
              type="button"
              className="app-sidebar-toggle"
              onClick={handleSidebarToggle}
              aria-label={isMobile ? "Toggle sidebar" : "Collapse sidebar"}
            >
              <span className="material-symbols-outlined">
                {isMobile ? (isSidebarOpen ? "close" : "menu") : isSidebarCollapsed ? "menu_open" : "menu"}
              </span>
            </button>
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
