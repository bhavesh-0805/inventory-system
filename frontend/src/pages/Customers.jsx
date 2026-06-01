import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../services/api';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getCustomers()
      .then(r => setCustomers(r.data))
      .catch(() => showAlert('error', 'Failed to load customers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setModal(true); };
  const closeModal = () => setModal(false);

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createCustomer({ full_name: form.full_name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      showAlert('success', 'Customer added');
      closeModal(); load();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Operation failed';
      setErrors({ api: detail });
    } finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete customer "${c.full_name}"? This may affect related orders.`)) return;
    try {
      await deleteCustomer(c.id);
      showAlert('success', 'Customer deleted');
      load();
    } catch { showAlert('error', 'Failed to delete customer'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">CUSTOMERS</div>
          <div className="page-sub">{customers.length} registered customers</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Customer</button>
      </div>

      {alert && <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading">LOADING...</div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-title">Customer Registry</span>
          </div>
          {customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <div className="empty-text">No customers yet. Add your first customer.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.full_name}</strong></td>
                    <td className="td-mono" style={{fontSize:'12px'}}>{c.email}</td>
                    <td className="td-mono">{c.phone}</td>
                    <td className="td-mono" style={{fontSize:'11px', color:'var(--text3)'}}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">ADD CUSTOMER</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {errors.api && <div className="alert alert-error">{errors.api}</div>}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="e.g. Priya Sharma" />
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="priya@example.com" />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
