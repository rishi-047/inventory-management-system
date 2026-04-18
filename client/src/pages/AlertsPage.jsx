import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { formatCategoryLabel } from "../lib/constants";

function AlertsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/alerts/low-stock", {
          credentials: "include"
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Unable to load alerts.");
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

    loadAlerts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell title="Critical Stock Alerts">
      {error ? <div className="auth-error inventory-error">{error}</div> : null}

      <section className="panel-block">
        <div className="panel-header">
          <div>
            <h3 className="panel-title">Threshold Manifest</h3>
            <p className="panel-copy">
              Prioritize these items for restocking to avoid transaction interruption.
            </p>
          </div>
        </div>

        {isLoading ? (
          <p className="empty-note">Loading alert state...</p>
        ) : items.length === 0 ? (
          <p className="empty-note">All products are currently above their stock thresholds.</p>
        ) : (
          <div className="alerts-grid">
            {items.map((item) => (
              <article key={item.id} className="alert-card">
                <div className="alert-card-top">
                  <div>
                    <strong>{item.name}</strong>
                    <span>{formatCategoryLabel(item.category)}</span>
                  </div>
                  <span className="material-symbols-outlined">warning</span>
                </div>
                <div className="alert-card-metrics">
                  <div>
                    <span>Current Qty</span>
                    <strong>{item.quantity}</strong>
                  </div>
                  <div>
                    <span>Threshold</span>
                    <strong>{item.lowStockThreshold}</strong>
                  </div>
                </div>
                <p>
                  {item.quantity === 0
                    ? "Out of stock and unavailable for sale."
                    : "Below safe operating stock level. Restock recommended immediately."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

export default AlertsPage;
