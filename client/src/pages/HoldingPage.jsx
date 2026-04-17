import { useAuth } from "../context/AuthContext";

function HoldingPage() {
  const { user, logout } = useAuth();

  return (
    <main className="boot-shell">
      <section className="boot-panel">
        <div className="boot-mark">Session Online</div>
        <h1>Operator authenticated successfully.</h1>
        <p>
          {user?.fullName} is signed in as {user?.role}. The next slices will
          replace this holding view with the real Stitch-based dashboard and the
          rest of the connected application.
        </p>
        <div className="boot-grid">
          <article>
            <span>Operator</span>
            <strong>{user?.username}</strong>
          </article>
          <article>
            <span>Role</span>
            <strong>{user?.role}</strong>
          </article>
          <article>
            <span>Session</span>
            <button className="ghost-terminal-button" type="button" onClick={logout}>
              End Session
            </button>
          </article>
        </div>
      </section>
    </main>
  );
}

export default HoldingPage;
