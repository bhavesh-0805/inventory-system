import React, { useEffect, useState } from 'react';
import { getDashboard } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">LOADING DASHBOARD...</div>;
  if (error) return <div className="page"><div className="alert alert-error">{error}</div></div>;

  const stats = [
    { label: 'Total Products', value: data.total_products, icon: '⬡' },
    { label: 'Total Customers', value: data.total_customers, icon: '◎' },
    { label: 'Total Orders', value: data.total_orders, icon: '◐' },
    { label: 'Low Stock Items', value: data.low_stock_products.length, icon: '⚠', warn: true },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">DASHBOARD</div>
          <div className="page-sub">System overview & inventory status</div>
        </div>
      </div>

      <div className="stat-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={s.warn && s.value > 0 ? {color: 'var(--warn)'} : {}}>
              {s.value}
            </div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      <div className="low-stock-section">
        <div className="section-title">Low Stock Alert (≤ 5 units)</div>
        {data.low_stock_products.length === 0 ? (
          <div className="card">
            <div style={{textAlign:'center', padding:'20px', color:'var(--text3)', fontFamily:'var(--mono)', fontSize:'12px'}}>
              ✓ All products adequately stocked
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>SKU</th>
                  <th>Qty Remaining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td className="td-mono">{p.sku}</td>
                    <td className="td-mono">{p.quantity}</td>
                    <td>
                      <span className={`td-badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warn'}`}>
                        {p.quantity === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
