import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import AppShell from "../components/AppShell";
import MetricCard from "../components/MetricCard";

const categoryColors = ["#ffd79b", "#78dc77", "#ffb4ab", "#d6c4ac"];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch("/api/dashboard/summary", {
          credentials: "include"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load dashboard.");
        }

        if (!cancelled) {
          setData(payload);
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

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell title="System Overview" subtitle="Live telemetry and inventory analytics">
      {isLoading ? (
        <section className="panel-block">
          <div className="boot-mark">Loading</div>
          <h3 className="panel-title">Synchronizing operational dashboard.</h3>
          <p className="panel-copy">Fetching metrics, alerts, charts, and recent activity.</p>
        </section>
      ) : error ? (
        <section className="panel-block error-block">
          <div className="boot-mark">Request Error</div>
          <h3 className="panel-title">Dashboard telemetry is unavailable.</h3>
          <p className="panel-copy">{error}</p>
        </section>
      ) : (
        <>
          <section className="alert-strip">
            <div className="alert-strip-copy">
              <span className="material-symbols-outlined">warning</span>
              <div>
                <strong>Critical inventory alert</strong>
                <p>
                  {data.metrics.lowStockCount} SKU(s) are operating at or below their minimum stock
                  threshold.
                </p>
              </div>
            </div>
            <span className="alert-strip-meta">LIVE_SIGNAL</span>
          </section>

          <section className="metric-grid">
            <MetricCard
              label="Total Products"
              value={data.metrics.totalProducts}
              detail={`${data.metrics.totalUnits} units active across all categories`}
              icon="inventory_2"
            />
            <MetricCard
              label="Inventory Value"
              value={formatCurrency(data.metrics.totalInventoryValue)}
              detail="Computed from current stock and unit pricing"
              icon="payments"
              accent="accent"
            />
            <MetricCard
              label="Low Stock Count"
              value={data.metrics.lowStockCount}
              detail="Immediate restock candidates"
              icon="warning"
              accent="danger"
            />
            <MetricCard
              label="Sales Logged"
              value={data.metrics.totalSales}
              detail={`${formatCurrency(data.metrics.totalSalesValue)} transacted so far`}
              icon="point_of_sale"
              accent="good"
            />
          </section>

          <section className="dashboard-grid">
            <article className="panel-block chart-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Top Stock Items</h3>
                  <p className="panel-copy">Highest current quantities in the inventory pool.</p>
                </div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.topStockItems}>
                    <XAxis dataKey="name" stroke="#bcae99" tickLine={false} axisLine={false} />
                    <YAxis stroke="#bcae99" tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(255, 215, 155, 0.06)" }}
                      contentStyle={{
                        background: "#202020",
                        border: "1px solid rgba(255, 215, 155, 0.12)",
                        borderRadius: "12px",
                        color: "#e5e2e1"
                      }}
                    />
                    <Bar dataKey="quantity" radius={[10, 10, 0, 0]} fill="#ffd79b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel-block chart-panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Category Value Split</h3>
                  <p className="panel-copy">Inventory value distribution by product type.</p>
                </div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={data.categoryBreakdown}
                      dataKey="inventoryValue"
                      nameKey="category"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={4}
                    >
                      {data.categoryBreakdown.map((entry, index) => (
                        <Cell key={entry.category} fill={categoryColors[index % categoryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        background: "#202020",
                        border: "1px solid rgba(255, 215, 155, 0.12)",
                        borderRadius: "12px",
                        color: "#e5e2e1"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="legend-list">
                {data.categoryBreakdown.map((entry, index) => (
                  <div key={entry.category} className="legend-row">
                    <div className="legend-meta">
                      <i style={{ backgroundColor: categoryColors[index % categoryColors.length] }} />
                      <span>{entry.category}</span>
                    </div>
                    <strong>{formatCurrency(entry.inventoryValue)}</strong>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel-block">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Low Stock Manifest</h3>
                  <p className="panel-copy">Items closest to operational risk threshold.</p>
                </div>
              </div>
              <div className="manifest-list">
                {data.lowStockItems.map((item) => (
                  <div key={item.id} className="manifest-row">
                    <div>
                      <strong>{item.name}</strong>
                      <span>{item.category}</span>
                    </div>
                    <div className="manifest-qty">
                      <span>{item.quantity} in stock</span>
                      <small>threshold {item.lowStockThreshold}</small>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-block">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Recent Activity</h3>
                  <p className="panel-copy">Most recent tracked system actions.</p>
                </div>
              </div>
              <div className="activity-list">
                {data.recentActivity.length === 0 ? (
                  <p className="empty-note">No activity logged yet.</p>
                ) : (
                  data.recentActivity.map((item) => (
                    <div key={item.id} className="activity-row">
                      <div className="activity-dot" />
                      <div>
                        <strong>{item.description}</strong>
                        <span>
                          {item.actorName || "System"} · {new Date(item.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </AppShell>
  );
}

export default DashboardPage;
