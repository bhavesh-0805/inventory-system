import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

const EMPTY = { name: '', sku: '', price: '', quantity: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    getProducts().then(r => setProducts(r.data)).catch(() => flash('error','Failed to load products')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const flash = (type, msg) => { setAlert({type, msg}); setTimeout(() => setAlert(null), 4000); };

  const openAdd = () => { setForm(EMPTY); setErrors({}); setEditing(null); setModal(true); };
  const openEdit = (p) => { setForm({name:p.name,sku:p.sku,price:String(p.price),quantity:String(p.quantity)}); setErrors({}); setEditing(p); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.price || isNaN(form.price) || Number(form.price) < 0) e.price = 'Enter a valid price';
    if (form.quantity === '' || isNaN(form.quantity) || Number(form.quantity) < 0) e.quantity = 'Enter a valid quantity';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    const payload = { name: form.name.trim(), sku: form.sku.trim().toUpperCase(), price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (editing) { await updateProduct(editing.id, payload); flash('success', 'Product updated successfully'); }
      else { await createProduct(payload); flash('success', 'Product created successfully'); }
      closeModal(); load();
    } catch (err) {
      setErrors({ api: err.response?.data?.detail || 'Operation failed' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try { await deleteProduct(p.id); flash('success', 'Product deleted'); load(); }
    catch { flash('error', 'Failed to delete product'); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Products</div>
          <div className="page-sub">{products.length} items in your catalog</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div>Loading products...</div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-info">
              <div className="table-title">Product Catalog</div>
              <div className="table-count">{filtered.length} of {products.length} products</div>
            </div>
            <input
              className="form-input"
              style={{width: '220px'}}
              placeholder="Search by name or SKU..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <div className="empty-title">{search ? 'No products match your search' : 'No products yet'}</div>
              <div className="empty-desc">{search ? 'Try a different search term' : 'Add your first product to get started'}</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                        <div className="product-thumb">📦</div>
                        <div>
                          <div style={{fontWeight:500}}>{p.name}</div>
                          <div style={{fontSize:'11px', color:'var(--text-muted)', marginTop:'1px'}}>ID #{p.id}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="td-mono">{p.sku}</span></td>
                    <td><span style={{fontWeight:600}}>₹{p.price.toLocaleString('en-IN', {minimumFractionDigits:2})}</span></td>
                    <td><span style={{fontWeight:500}}>{p.quantity.toLocaleString()}</span></td>
                    <td>
                      <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.quantity <= 5 ? 'badge-warning' : 'badge-success'}`}>
                        {p.quantity === 0 ? 'Out of stock' : p.quantity <= 5 ? 'Low stock' : 'In stock'}
                      </span>
                    </td>
                    <td><span className="td-secondary">{new Date(p.created_at).toLocaleDateString('en-IN')}</span></td>
                    <td>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
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

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Product' : 'Add New Product'}</div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {errors.api && <div className="alert alert-error">{errors.api}</div>}
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Wireless Keyboard" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code *</label>
                <input className="form-input" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} placeholder="e.g. WK-001" />
                {errors.sku && <div className="form-error">{errors.sku}</div>}
                <div className="form-hint">Must be unique. Will be auto-uppercased.</div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="0.00" />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Qty in Stock *</label>
                  <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="0" />
                  {errors.quantity && <div className="form-error">{errors.quantity}</div>}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
