import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";

const initialForm = {
  fullName: "",
  username: "",
  password: "",
  role: "cashier"
};

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  async function loadUsers() {
    setIsLoading(true);
    const response = await fetch("/api/users", {
      credentials: "include"
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || "Unable to load users.");
    }

    setUsers(payload.users);
    setIsLoading(false);
  }

  useEffect(() => {
    loadUsers().catch((requestError) => {
      setError(requestError.message);
      setIsLoading(false);
    });
  }, []);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to create user.");
      }

      setUsers((current) => [payload.user, ...current]);
      setForm(initialForm);
      setSuccess(`${payload.user.username} created successfully.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleUserStatus(user) {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/users/${user.id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          isActive: !user.isActive
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Unable to update user.");
      }

      setUsers((current) =>
        current.map((item) => (item.id === payload.user.id ? payload.user : item))
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <AppShell title="User Control" subtitle="Admin-only account provisioning and status management">
      <section className="dashboard-grid">
        <article className="panel-block add-item-panel">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Create Operator Account</h3>
              <p className="panel-copy">Add new admins or cashiers directly from the control terminal.</p>
            </div>
          </div>

          <form className="product-form" onSubmit={handleCreateUser}>
            <div className="form-grid">
              <label className="auth-input">
                <span>FULL_NAME</span>
                <input
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                />
                <i className="material-symbols-outlined">badge</i>
              </label>

              <label className="auth-input">
                <span>USERNAME</span>
                <input
                  value={form.username}
                  onChange={(event) => updateField("username", event.target.value)}
                />
                <i className="material-symbols-outlined">person</i>
              </label>

              <label className="auth-input">
                <span>PASSWORD</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                />
                <i className="material-symbols-outlined">key</i>
              </label>

              <label className="auth-input">
                <span>ROLE</span>
                <select value={form.role} onChange={(event) => updateField("role", event.target.value)}>
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
                <i className="material-symbols-outlined">security</i>
              </label>
            </div>

            {error ? <div className="auth-error">{error}</div> : null}
            {success ? <div className="form-success">{success}</div> : null}

            <div className="product-form-actions">
              <button type="submit" className="auth-primary-button" disabled={isSubmitting}>
                <span className="material-symbols-outlined">person_add</span>
                {isSubmitting ? "CREATING..." : "CREATE_USER"}
              </button>
            </div>
          </form>
        </article>

        <article className="panel-block">
          <div className="panel-header">
            <div>
              <h3 className="panel-title">Operator Registry</h3>
              <p className="panel-copy">Activate or suspend accounts from the internal roster.</p>
            </div>
          </div>

          {isLoading ? (
            <p className="empty-note">Loading user registry...</p>
          ) : (
            <div className="user-list">
              {users.map((user) => (
                <div key={user.id} className="user-card">
                  <div>
                    <strong>{user.fullName}</strong>
                    <span>{user.username}</span>
                  </div>
                  <div className="user-card-meta">
                    <span className={`category-chip ${user.role === "admin" ? "category-chip-electronics" : "category-chip-clothing"}`}>
                      {user.role}
                    </span>
                    <button
                      type="button"
                      className={`table-action${user.isActive ? "" : " danger-action"}`}
                      onClick={() => toggleUserStatus(user)}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </AppShell>
  );
}

export default UsersPage;
