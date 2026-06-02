import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';

const EMPTY = { full_name: '', email: '', phone: '' };

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
const avatarColors = ['avatar-purple', 'avatar-green', 'avatar-blue'];

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    getCustomers().then(r => setCustomers(r.data)).catch(() => flash('error', 'Failed to load customers')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const flash = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createCustomer({ full_name: form.full_name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() });
      flash('success', 'Customer added successfully');
      setModal(false); setForm(EMPTY); load();
    } catch (err) {
      setErrors({ api: err.response?.data?.detail || 'Failed to add customer' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Remove "${c.full_name}" from your customers?`)) return;
    try { await deleteCustomer(c.id); flash('success', 'Customer removed'); load(); }
    catch { flash('error', 'Failed to delete customer'); }
  };

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Customers</div>
          <div className="page-sub">{customers.length} registered customers</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setErrors({}); setModal(true); }}>+ Add Customer</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div>Loading customers...</div>
      ) : (
        <>
          <div className="customers-hero">
            <div>
              <h1>👥 Customer Management</h1>
              <p>
                Manage customer profiles and contact information.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() => {
                setForm(EMPTY);
                setErrors({});
                setModal(true);
              }}
            >
              + Add Customer
            </button>
          </div>

          <div className="customer-stats-grid">

            <div className="customer-stat-card">
              <div className="customer-stat-icon">👥</div>
              <div className="customer-stat-number">
                {customers.length}
              </div>
              <div className="customer-stat-label">
                Total Customers
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon">📧</div>
              <div className="customer-stat-number">
                {customers.length}
              </div>
              <div className="customer-stat-label">
                Email Accounts
              </div>
            </div>

            <div className="customer-stat-card">
              <div className="customer-stat-icon">📱</div>
              <div className="customer-stat-number">
                {customers.length}
              </div>
              <div className="customer-stat-label">
                Phone Numbers
              </div>
            </div>

          </div>

          <div className="customers-toolbar">
            <div className="customers-search">
              <span>🔍</span>

              <input
                className="customers-search-input"
                placeholder="Search customers..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>

              <div className="empty-title">
                No customers found
              </div>

              <div className="empty-desc">
                Add your first customer
              </div>
            </div>
          ) : (
            <div className="customers-grid">

              {filtered.map((c, i) => (

                <div
                  key={c.id}
                  className="customer-card"
                >

                  <div className="customer-top">

                    <div
                      className={`avatar ${avatarColors[
                        i %
                        avatarColors.length
                        ]
                        }`}
                      style={{
                        width: "60px",
                        height: "60px",
                        fontSize: "18px"
                      }}
                    >
                      {initials(c.full_name)}
                    </div>

                  </div>

                  <h3 className="customer-name">
                    {c.full_name}
                  </h3>

                  <div className="customer-email">
                    📧 {c.email}
                  </div>

                  <div className="customer-phone">
                    📱 {c.phone}
                  </div>

                  <div className="customer-date">
                    Joined{" "}
                    {new Date(
                      c.created_at
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </div>

                  <button
                    className="btn btn-danger"
                    style={{
                      width: "100%",
                      marginTop: "16px"
                    }}
                    onClick={() =>
                      handleDelete(c)
                    }
                  >
                    Remove Customer
                  </button>

                </div>

              ))}

            </div>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Add New Customer</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {errors.api && <div className="alert alert-error">{errors.api}</div>}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. Priya Sharma" />
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="priya@example.com" />
                {errors.email && <div className="form-error">{errors.email}</div>}
                <div className="form-hint">Must be unique — used as login identifier.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
