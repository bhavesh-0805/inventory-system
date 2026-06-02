import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';

const EMPTY = { full_name: '', email: '', phone: '' };

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
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
    getCustomers().then(r => setCustomers(r.data)).catch(() => flash('error','Failed to load customers')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const flash = (type, msg) => { setAlert({type, msg}); setTimeout(() => setAlert(null), 4000); };

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
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-info">
              <div className="table-title">Customer Registry</div>
              <div className="table-count">{filtered.length} of {customers.length} customers</div>
            </div>
            <input className="form-input" style={{width:'220px'}} placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <div className="empty-title">{search ? 'No customers match your search' : 'No customers yet'}</div>
              <div className="empty-desc">{search ? 'Try a different search term' : 'Add your first customer to get started'}</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div className={`avatar ${avatarColors[i % avatarColors.length]}`}>{initials(c.full_name)}</div>
                        <div style={{fontWeight:500}}>{c.full_name}</div>
                      </div>
                    </td>
                    <td><span className="td-secondary">{c.email}</span></td>
                    <td><span className="td-secondary">{c.phone}</span></td>
                    <td><span className="td-secondary">{new Date(c.created_at).toLocaleDateString('en-IN')}</span></td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
                <input className="form-input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="e.g. Priya Sharma" />
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="priya@example.com" />
                {errors.email && <div className="form-error">{errors.email}</div>}
                <div className="form-hint">Must be unique — used as login identifier.</div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
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
