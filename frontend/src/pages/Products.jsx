import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getProducts()
      .then(r => setProducts(r.data))
      .catch(() => showAlert('error', 'Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setEditing(null); setModal('form'); };
  const openEdit = (p) => {
    setForm({ name: p.name, sku: p.sku, price: String(p.price), quantity: String(p.quantity) });
    setErrors({}); setEditing(p); setModal('form');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.sku.trim()) e.sku = 'Required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Valid positive price required';
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Non-negative integer required';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), sku: form.sku.trim(), price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        showAlert('success', 'Product updated');
      } else {
        await createProduct(payload);
        showAlert('success', 'Product created');
      }
      closeModal(); load();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Operation failed';
      setErrors({ api: detail });
    } finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await deleteProduct(p.id);
      showAlert('success', 'Product deleted');
      load();
    } catch { showAlert('error', 'Failed to delete product'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">PRODUCTS</div>
          <div className="page-sub">{products.length} items in catalog</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {alert && <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading">LOADING...</div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-title">Product Catalog</span>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⬡</div>
              <div className="empty-text">No products yet. Add your first product.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td className="td-mono">{p.sku}</td>
                    <td className="td-mono">₹{p.price.toFixed(2)}</td>
                    <td className="td-mono">{p.quantity}</td>
                    <td>
                      <span className={`td-badge ${p.quantity === 0 ? 'badge-danger' : p.quantity <= 5 ? 'badge-warn' : 'badge-ok'}`}>
                        {p.quantity === 0 ? 'OUT OF STOCK' : p.quantity <= 5 ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal === 'form' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'EDIT PRODUCT' : 'ADD PRODUCT'}</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {errors.api && <div className="alert alert-error">{errors.api}</div>}
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Wireless Keyboard" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input className="form-input" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="e.g. WK-001" />
                {errors.sku && <div className="form-error">{errors.sku}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" />
                {errors.price && <div className="form-error">{errors.price}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Quantity in Stock</label>
                <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" />
                {errors.quantity && <div className="form-error">{errors.quantity}</div>}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
