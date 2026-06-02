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
    getProducts().then(r => setProducts(r.data)).catch(() => flash('error', 'Failed to load products')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const flash = (type, msg) => { setAlert({ type, msg }); setTimeout(() => setAlert(null), 4000); };

  const openAdd = () => { setForm(EMPTY); setErrors({}); setEditing(null); setModal(true); };
  const openEdit = (p) => { setForm({ name: p.name, sku: p.sku, price: String(p.price), quantity: String(p.quantity) }); setErrors({}); setEditing(p); setModal(true); };
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
        <div className="loading">
          <div className="spinner"></div>
          Loading products...
        </div>
      ) : (
        <>
          <div className="products-hero">
            <div>
              <h1>📦 Product Inventory</h1>
              <p>
                Manage products, pricing and inventory levels.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={openAdd}
            >
              + Add Product
            </button>
          </div>

          <div className="product-stats-grid">

            <div className="product-stat-card">
              <div className="product-stat-icon">📦</div>
              <div className="product-stat-number">
                {products.length}
              </div>
              <div className="product-stat-label">
                Total Products
              </div>
            </div>

            <div className="product-stat-card">
              <div className="product-stat-icon">✅</div>
              <div className="product-stat-number">
                {products.filter(
                  p => p.quantity > 5
                ).length}
              </div>
              <div className="product-stat-label">
                In Stock
              </div>
            </div>

            <div className="product-stat-card">
              <div className="product-stat-icon">⚠️</div>
              <div className="product-stat-number">
                {products.filter(
                  p => p.quantity > 0 &&
                    p.quantity <= 5
                ).length}
              </div>
              <div className="product-stat-label">
                Low Stock
              </div>
            </div>

            <div className="product-stat-card">
              <div className="product-stat-icon">❌</div>
              <div className="product-stat-number">
                {products.filter(
                  p => p.quantity === 0
                ).length}
              </div>
              <div className="product-stat-label">
                Out of Stock
              </div>
            </div>

          </div>

          <div className="products-toolbar">

            <div className="products-search">
              <span>🔍</span>

              <input
                className="products-search-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>

              <div className="empty-title">
                No products found
              </div>

              <div className="empty-desc">
                Try another search term
              </div>
            </div>
          ) : (
            <div className="products-grid">

              {filtered.map((p) => (

                <div
                  key={p.id}
                  className="product-card"
                >

                  <div className="product-card-top">

                    <div className="product-avatar">
                      {p.name.charAt(0).toUpperCase()}
                    </div>

                    <span
                      className={`badge ${p.quantity === 0
                          ? "badge-danger"
                          : p.quantity <= 5
                            ? "badge-warning"
                            : "badge-success"
                        }`}
                    >
                      {p.quantity === 0
                        ? "Out of Stock"
                        : p.quantity <= 5
                          ? "Low Stock"
                          : "In Stock"}
                    </span>

                  </div>

                  <h3 className="product-name">
                    {p.name}
                  </h3>

                  <div className="product-sku">
                    SKU: {p.sku}
                  </div>

                  <div className="product-price">
                    ₹
                    {p.price.toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 2
                      }
                    )}
                  </div>

                  <div className="product-stock">
                    Stock Available:
                    <strong>
                      {" "}
                      {p.quantity}
                    </strong>
                  </div>

                  <div className="product-date">
                    Added on{" "}
                    {new Date(
                      p.created_at
                    ).toLocaleDateString("en-IN")}
                  </div>

                  <div className="product-actions">

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        openEdit(p)
                      }
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(p)
                      }
                    >
                      🗑 Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>
          )}
        </>
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
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Wireless Keyboard" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code *</label>
                <input className="form-input" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. WK-001" />
                {errors.sku && <div className="form-error">{errors.sku}</div>}
                <div className="form-hint">Must be unique. Will be auto-uppercased.</div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Qty in Stock *</label>
                  <input className="form-input" type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
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
