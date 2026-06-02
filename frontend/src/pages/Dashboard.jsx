import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner"></div>Loading dashboard...</div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const stats = [
    { label: 'Total Products', value: data.total_products, icon: '📦', color: 'purple', trend: 'Items in catalog' },
    { label: 'Total Customers', value: data.total_customers, icon: '👥', color: 'blue', trend: 'Registered accounts' },
    { label: 'Total Orders', value: data.total_orders, icon: '🛒', color: 'green', trend: 'Orders placed' },
    { label: 'Low Stock Alerts', value: data.low_stock_products.length, icon: '⚠️', color: 'amber', trend: 'Products need restocking' },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Good morning 👋</div>
          <div className="page-sub">Here's what's happening with your inventory today.</div>
        </div>
        <Link to="/orders" className="btn btn-primary">+ New Order</Link>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className={`stat-icon-wrap ${s.color}`}>{s.icon}</div>
            <div className="stat-info">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={s.color === 'amber' && s.value > 0 ? {color:'var(--warning)'} : {}}>
                {s.value}
              </div>
              <div className="stat-trend">{s.trend}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header" style={{marginTop: '8px'}}>
        <div className="section-title">Low Stock Products</div>
        <Link to="/products" className="btn btn-ghost btn-sm">View all products →</Link>
      </div>

      <div className="table-wrap">
        {data.low_stock_products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">All products are well stocked</div>
            <div className="empty-desc">No products are running low right now.</div>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty Left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.low_stock_products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                      <div className="product-thumb">📦</div>
                      <span style={{fontWeight: 500}}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="td-mono">{p.sku}</span></td>
                  <td><span style={{fontWeight: 600, color: p.quantity === 0 ? 'var(--danger)' : 'var(--warning)'}}>{p.quantity} units</span></td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {p.quantity === 0 ? 'Out of stock' : 'Low stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
