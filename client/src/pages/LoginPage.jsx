import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const rolePresets = {
  admin: {
    username: "admin",
    password: "admin123",
    title: "ADMIN_ROLE",
    label: "Full inventory and user control"
  },
  cashier: {
    username: "cashier",
    password: "cash123",
    title: "CASHIER_ROLE",
    label: "Sales, stock viewing, and alerts"
  }
};

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState(rolePresets.admin.username);
  const [password, setPassword] = useState(rolePresets.admin.password);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function applyRolePreset(nextRole) {
    setRole(nextRole);
    setUsername(rolePresets[nextRole].username);
    setPassword(rolePresets[nextRole].password);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await login({ username, password });
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-panel-glow" />

        <header className="auth-brand-header">
          <div className="auth-brand-lockup">
            <span className="material-symbols-outlined auth-icon auth-icon-filled">
              barcode_scanner
            </span>
            <h1>OPS-CONTROL-V1</h1>
          </div>
          <div className="auth-secure-tag">SECURE_CONNECTION</div>
        </header>

        <div className="auth-brand-copy">
          <p className="auth-kicker">Industrial Inventory Terminal</p>
          <h2>
            MAIN_TERMINAL
            <span>SECTOR_07_WHSE</span>
          </h2>
          <p>
            Authorized personnel only. Session access is monitored, role-bound,
            and logged against inventory actions in real time.
          </p>
        </div>

        <div className="auth-metrics">
          <article>
            <span>SYSTEM_STATUS</span>
            <strong>ONLINE</strong>
          </article>
          <article>
            <span>SYNC_MODE</span>
            <strong>LIVE_DB</strong>
          </article>
        </div>

        <footer className="auth-footer-tech">
          <span>V. 3.0.0 // WEB_TERMINAL</span>
          <div className="auth-signal-bars" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        </footer>
      </section>

      <section className="auth-form-panel">
        <div className="auth-form-card">
          <div className="auth-corner auth-corner-tl" />
          <div className="auth-corner auth-corner-tr" />
          <div className="auth-corner auth-corner-bl" />
          <div className="auth-corner auth-corner-br" />

          <div className="auth-form-head">
            <h3>AUTHENTICATION</h3>
            <p>Initialize an operator session using seeded credentials.</p>
          </div>

          <div className="auth-role-tabs">
            {Object.entries(rolePresets).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className={key === role ? "is-active" : ""}
                onClick={() => applyRolePreset(key)}
              >
                <span>{preset.title}</span>
                <small>{preset.label}</small>
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-input">
              <span>OPERATOR_ID</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                autoComplete="username"
              />
              <i className="material-symbols-outlined">badge</i>
            </label>

            <label className="auth-input">
              <span>AUTHORIZATION_CODE</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <i className="material-symbols-outlined">dialpad</i>
            </label>

            {error ? <div className="auth-error">{error}</div> : null}

            <div className="auth-actions">
              <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
                <span className="material-symbols-outlined">login</span>
                {isSubmitting ? "INITIALIZING..." : "INITIALIZE_SESSION"}
              </button>

              <div className="auth-help-copy">
                Demo credentials:
                <strong> admin / admin123 </strong>
                and
                <strong> cashier / cash123</strong>
              </div>
            </div>
          </form>

          <footer className="auth-card-footer">
            <span className="material-symbols-outlined">lock</span>
            <span>SESSION_COOKIES_ACTIVE</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
