import React, { useEffect, useState } from "react";
import { getDashboard } from "../services/api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then((r) => setData(r.data))
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );

  if (error)
    return (
      <div className="page">
        <div className="alert alert-error">{error}</div>
      </div>
    );

  const stats = [
    {
      label: "Total Products",
      value: data.total_products,
      icon: "📦",
      trend: "Items in catalog",
    },
    {
      label: "Total Customers",
      value: data.total_customers,
      icon: "👥",
      trend: "Registered accounts",
    },
    {
      label: "Total Orders",
      value: data.total_orders,
      icon: "🛒",
      trend: "Orders placed",
    },
    {
      label: "Low Stock Alerts",
      value: data.low_stock_products.length,
      icon: "⚠️",
      trend: "Need attention",
    },
  ];

  return (
    <div className="page">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div>
          <h1>Inventory Dashboard</h1>
          <p>
            Monitor inventory, customers, and orders from one central place.
          </p>
        </div>

        <Link to="/orders" className="btn btn-primary">
          + New Order
        </Link>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div className="stat-card modern-stat-card" key={s.label}>
            <div className="modern-stat-icon">{s.icon}</div>

            <div className="modern-stat-value">{s.value}</div>

            <div className="modern-stat-label">{s.label}</div>

            <div className="modern-stat-trend">{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="summary-grid">
        <div className="summary-card">
          <h3>Inventory Health</h3>

          {data.low_stock_products.length === 0 ? (
            <>
              <div className="summary-big">Excellent ✅</div>
              <p>All products are sufficiently stocked.</p>
            </>
          ) : (
            <>
              <div className="summary-big warning">
                {data.low_stock_products.length}
              </div>
              <p>Products require restocking.</p>
            </>
          )}
        </div>

        <div className="summary-card">
          <h3>Quick Actions</h3>

          <div className="quick-actions">
            <Link to="/products" className="action-btn">
              📦 Products
            </Link>

            <Link to="/customers" className="action-btn">
              👥 Customers
            </Link>

            <Link to="/orders" className="action-btn">
              🛒 Orders
            </Link>
          </div>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="table-section">
        <div className="table-header">
          <h3>⚠️ Low Stock Products</h3>

          <Link to="/products" className="btn btn-ghost btn-sm">
            View All →
          </Link>
        </div>

        <div className="table-wrap">
          {data.low_stock_products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>

              <div className="empty-title">
                All products are well stocked
              </div>

              <div className="empty-desc">
                No products are running low right now.
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {data.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div className="product-thumb">📦</div>

                        <div>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="td-mono">{p.sku}</span>
                    </td>

                    <td>
                      <strong>{p.quantity}</strong> units
                    </td>

                    <td>
                      <div className="stock-status">
                        <span
                          className={`status-dot ${
                            p.quantity === 0 ? "danger" : "warning"
                          }`}
                        ></span>

                        <span>
                          {p.quantity === 0
                            ? "Out of Stock"
                            : "Low Stock"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}