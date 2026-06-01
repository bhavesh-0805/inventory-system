import React, { useEffect, useState } from 'react';
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers } from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailModal, setDetailModal] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: '1' }] });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getProducts(), getCustomers()])
      .then(([o, p, c]) => { setOrders(o.data); setProducts(p.data); setCustomers(c.data); })
      .catch(() => showAlert('error', 'Failed to load data'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const openAdd = () => {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: '1' }] });
    setErrors({});
    setModal(true);
  };
  const closeModal = () => setModal(false);

  const addItem = () => setForm({ ...form, items: [...form.items, { product_id: '', quantity: '1' }] });
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: val };
    setForm({ ...form, items });
  };

  const estimatedTotal = form.items.reduce((sum, item) => {
    const p = products.find(p => String(p.id) === String(item.product_id));
    if (!p || !item.quantity) return sum;
    return sum + p.price * Number(item.quantity);
  }, 0);

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = 'Select a customer';
    if (form.items.length === 0) e.items = 'Add at least one item';
    form.items.forEach((item, i) => {
      if (!item.product_id) e[`product_${i}`] = 'Select product';
      if (!item.quantity || Number(item.quantity) <= 0) e[`qty_${i}`] = 'Valid qty required';
    });
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createOrder({
        customer_id: Number(form.customer_id),
        items: form.items.map(item => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })),
      });
      showAlert('success', 'Order created successfully');
      closeModal(); load();
    } catch (err) {
      const detail = err.response?.data?.detail || 'Order creation failed';
      setErrors({ api: detail });
    } finally { setSaving(false); }
  };

  const handleDelete = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}? Stock will be restored.`)) return;
    try {
      await deleteOrder(o.id);
      showAlert('success', 'Order cancelled, stock restored');
      load();
    } catch { showAlert('error', 'Failed to cancel order'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">ORDERS</div>
          <div className="page-sub">{orders.length} total orders</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Create Order</button>
      </div>

      {alert && <div className={`alert alert-${alert.type === 'error' ? 'error' : 'success'}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading">LOADING...</div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <span className="table-title">Order Ledger</span>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◐</div>
              <div className="empty-text">No orders yet. Create your first order.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="td-mono">#{String(o.id).padStart(4, '0')}</td>
                    <td>{o.customer?.full_name || '—'}</td>
                    <td className="td-mono">{o.items?.length || 0} item(s)</td>
                    <td className="td-mono">₹{o.total_amount.toFixed(2)}</td>
                    <td>
                      <span className="td-badge badge-ok">{o.status.toUpperCase()}</span>
                    </td>
                    <td className="td-mono" style={{fontSize:'11px', color:'var(--text3)'}}>
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetailModal(o)}>View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create Order Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal" style={{maxWidth: '600px'}}>
            <div className="modal-header">
              <span className="modal-title">CREATE ORDER</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {errors.api && <div className="alert alert-error">{errors.api}</div>}
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select className="form-select" value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}>
                  <option value="">Select customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                </select>
                {errors.customer_id && <div className="form-error">{errors.customer_id}</div>}
              </div>

              <div style={{marginBottom: '8px'}}>
                <label className="form-label">Order Items</label>
                {errors.items && <div className="form-error">{errors.items}</div>}
              </div>

              {form.items.map((item, i) => {
                const selProd = products.find(p => String(p.id) === String(item.product_id));
                return (
                  <div key={i}>
                    <div className="order-item-row">
                      <div>
                        <select
                          className="form-select"
                          value={item.product_id}
                          onChange={e => updateItem(i, 'product_id', e.target.value)}
                        >
                          <option value="">Select product...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ₹{p.price} (Stock: {p.quantity})
                            </option>
                          ))}
                        </select>
                        {errors[`product_${i}`] && <div className="form-error">{errors[`product_${i}`]}</div>}
                      </div>
                      <div>
                        <input
                          className="form-input"
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItem(i, 'quantity', e.target.value)}
                          placeholder="Qty"
                        />
                        {errors[`qty_${i}`] && <div className="form-error">{errors[`qty_${i}`]}</div>}
                      </div>
                      <button className="remove-item-btn" onClick={() => removeItem(i)} disabled={form.items.length === 1}>✕</button>
                    </div>
                    {selProd && item.quantity && (
                      <div style={{fontSize:'11px', color:'var(--text3)', fontFamily:'var(--mono)', marginBottom:'8px', marginLeft:'2px'}}>
                        Subtotal: ₹{(selProd.price * Number(item.quantity)).toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })}

              <button className="add-item-btn" onClick={addItem}>+ Add another item</button>

              {estimatedTotal > 0 && (
                <div style={{marginTop:'16px', padding:'12px', background:'var(--bg3)', borderRadius:'var(--radius)', border:'1px solid var(--border2)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text3)', letterSpacing:'1px', textTransform:'uppercase'}}>Estimated Total</span>
                    <span style={{fontFamily:'var(--mono)', fontSize:'18px', color:'var(--accent)', fontWeight:'700'}}>₹{estimatedTotal.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailModal(null)}>
          <div className="modal" style={{maxWidth: '560px'}}>
            <div className="modal-header">
              <span className="modal-title">ORDER #{String(detailModal.id).padStart(4, '0')}</span>
              <button className="modal-close" onClick={() => setDetailModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'20px'}}>
                <div>
                  <div className="form-label">Customer</div>
                  <div style={{color:'var(--text)', fontWeight:'500'}}>{detailModal.customer?.full_name}</div>
                  <div style={{color:'var(--text3)', fontSize:'12px', fontFamily:'var(--mono)'}}>{detailModal.customer?.email}</div>
                </div>
                <div>
                  <div className="form-label">Date</div>
                  <div style={{color:'var(--text)', fontFamily:'var(--mono)', fontSize:'13px'}}>
                    {new Date(detailModal.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="form-label" style={{marginBottom:'10px'}}>Items</div>
              <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden'}}>
                <table style={{marginBottom:0}}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Unit Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailModal.items?.map(item => (
                      <tr key={item.id}>
                        <td>{item.product?.name || `Product #${item.product_id}`}</td>
                        <td className="td-mono">{item.quantity}</td>
                        <td className="td-mono">₹{item.unit_price.toFixed(2)}</td>
                        <td className="td-mono">₹{(item.unit_price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', marginTop:'16px', gap:'12px', alignItems:'center'}}>
                <span style={{fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px'}}>Total Amount</span>
                <span style={{fontFamily:'var(--mono)', fontSize:'22px', color:'var(--accent)', fontWeight:'700'}}>₹{detailModal.total_amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
