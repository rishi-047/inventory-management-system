import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";

function ActivityPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/activity?limit=40", {
          credentials: "include"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load activity log.");
        }

        if (!cancelled) {
          setItems(payload.items);
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell title="Activity Ledger">
      {error ? <div className="auth-error inventory-error">{error}</div> : null}

      <section className="panel-block">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Tracked Operations</h3>
            <p className="panel-copy">
              Full log of recent inventory, sales, and operator management activity.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="empty-note">Loading activity records...</p>
        ) : items.length === 0 ? (
          <p className="empty-note">No activity has been recorded yet.</p>
        ) : (
          <div className="activity-list activity-list-expanded">
            {items.map((item) => (
              <div key={item.id} className="activity-row">
                <div className="activity-dot" />
                <div className="activity-copy">
                  <strong>{item.description}</strong>
                  <span>
                    {item.actorName || "System"} · {new Date(item.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default ActivityPage;
