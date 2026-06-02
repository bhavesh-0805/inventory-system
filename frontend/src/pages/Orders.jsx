import React, { useEffect, useState } from 'react';
import { getOrders, createOrder, deleteOrder, getProducts, getCustomers } from '../services/api';

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: '1' }] });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getProducts(), getCustomers()])
      .then(([o,p,c]) => { setOrders(o.data); setProducts(p.data); setCustomers(c.data); })
      .catch(() => flash('error','Failed to load data'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const flash = (type, msg) => { setAlert({type, msg}); setTimeout(() => setAlert(null), 4000); };

  const openCreate = () => { setForm({ customer_id: '', items: [{ product_id: '', quantity: '1' }] }); setErrors({}); setModal(true); };

  const addItem = () => setForm({...form, items: [...form.items, { product_id: '', quantity: '1' }]});
  const removeItem = i => setForm({...form, items: form.items.filter((_,idx) => idx !== i)});
  const updateItem = (i, field, val) => {
    const items = [...form.items];
    items[i] = {...items[i], [field]: val};
    setForm({...form, items});
  };

  const estimatedTotal = form.items.reduce((sum, item) => {
    const p = products.find(p => String(p.id) === String(item.product_id));
    return p && item.quantity ? sum + p.price * Number(item.quantity) : sum;
  }, 0);

  const validate = () => {
    const e = {};
    if (!form.customer_id) e.customer_id = 'Please select a customer';
    form.items.forEach((item, i) => {
      if (!item.product_id) e[`p${i}`] = 'Select a product';
      if (!item.quantity || Number(item.quantity) <= 0) e[`q${i}`] = 'Enter valid qty';
    });
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);
    try {
      await createOrder({ customer_id: Number(form.customer_id), items: form.items.map(item => ({ product_id: Number(item.product_id), quantity: Number(item.quantity) })) });
      flash('success', 'Order placed successfully');
      setModal(false); load();
    } catch (err) {
      setErrors({ api: err.response?.data?.detail || 'Failed to create order' });
    } finally { setSaving(false); }
  };

  const handleCancel = async (o) => {
    if (!window.confirm(`Cancel order #${String(o.id).padStart(4,'0')}? Stock will be restored.`)) return;
    try { await deleteOrder(o.id); flash('success', 'Order cancelled, stock restored'); load(); }
    catch { flash('error', 'Failed to cancel order'); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Orders</div>
          <div className="page-sub">{orders.length} total orders</div>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Create Order</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading"><div className="spinner"></div>Loading orders...</div>
      ) : (
        <div className="table-wrap">
          <div className="table-toolbar">
            <div className="table-info">
              <div className="table-title">Order Ledger</div>
              <div className="table-count">{orders.length} orders total</div>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛒</div>
              <div className="empty-title">No orders yet</div>
              <div className="empty-desc">Create your first order to get started</div>
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
                    <td><span style={{fontWeight:600, color:'var(--accent)'}}>#{String(o.id).padStart(4,'0')}</span></td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <div className="avatar avatar-purple" style={{width:'28px',height:'28px',fontSize:'11px'}}>{initials(o.customer?.full_name || 'U')}</div>
                        <span style={{fontWeight:500}}>{o.customer?.full_name}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-neutral">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</span></td>
                    <td><span style={{fontWeight:600}}>₹{o.total_amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</span></td>
                    <td><span className="badge badge-success">Confirmed</span></td>
                    <td><span className="td-secondary">{new Date(o.created_at).toLocaleDateString('en-IN')}</span></td>
                    <td>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setDetailOrder(o)}>View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(o)}>Cancel</button>
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal" style={{maxWidth:'560px'}}>
            <div className="modal-header">
              <div className="modal-title">Create New Order</div>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {errors.api && <div className="alert alert-error">{errors.api}</div>}
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="form-select" value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}>
                  <option value="">Select a customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
                </select>
                {errors.customer_id && <div className="form-error">{errors.customer_id}</div>}
              </div>

              <div className="form-label" style={{marginBottom:'8px'}}>Order Items *</div>
              <div className="order-items-section">
                {form.items.map((item, i) => {
                  const sel = products.find(p => String(p.id) === String(item.product_id));
                  return (
                    <div key={i}>
                      <div className="order-item-row">
                        <div>
                          <select className="form-select" value={item.product_id} onChange={e => updateItem(i, 'product_id', e.target.value)}>
                            <option value="">Select product...</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                                {p.name} — ₹{p.price} (Stock: {p.quantity})
                              </option>
                            ))}
                          </select>
                          {errors[`p${i}`] && <div className="form-error">{errors[`p${i}`]}</div>}
                        </div>
                        <div>
                          <input className="form-input" type="number" min="1" value={item.quantity} onChange={e => updateItem(i,'quantity',e.target.value)} placeholder="Qty" />
                          {errors[`q${i}`] && <div className="form-error" style={{fontSize:'10px'}}>{errors[`q${i}`]}</div>}
                        </div>
                        <button className="remove-item-btn" onClick={() => removeItem(i)} disabled={form.items.length === 1}>✕</button>
                      </div>
                      {sel && item.quantity && (
                        <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'8px', marginLeft:'2px'}}>
                          Subtotal: ₹{(sel.price * Number(item.quantity)).toLocaleString('en-IN', {minimumFractionDigits:2})}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button className="add-item-btn" onClick={addItem}>+ Add another item</button>
              </div>

              {estimatedTotal > 0 && (
                <div className="order-total-box">
                  <span className="order-total-label">Estimated Total</span>
                  <span className="order-total-value">₹{estimatedTotal.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? 'Placing order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetailOrder(null)}>
          <div className="modal" style={{maxWidth:'520px'}}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Order #{String(detailOrder.id).padStart(4,'0')}</div>
                <div style={{fontSize:'12px', color:'var(--text-secondary)', marginTop:'2px'}}>
                  Placed on {new Date(detailOrder.created_at).toLocaleString('en-IN')}
                </div>
              </div>
              <button className="modal-close" onClick={() => setDetailOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{background:'var(--bg)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'14px', marginBottom:'18px', display:'flex', alignItems:'center', gap:'12px'}}>
                <div className="avatar avatar-purple">{initials(detailOrder.customer?.full_name || 'U')}</div>
                <div>
                  <div style={{fontWeight:600}}>{detailOrder.customer?.full_name}</div>
                  <div style={{fontSize:'12px', color:'var(--text-secondary)'}}>{detailOrder.customer?.email} · {detailOrder.customer?.phone}</div>
                </div>
              </div>
              <div style={{fontWeight:600, marginBottom:'10px', fontSize:'13px'}}>Items Ordered</div>
              <div style={{border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden', marginBottom:'16px'}}>
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{textAlign:'center'}}>Qty</th>
                      <th style={{textAlign:'right'}}>Unit Price</th>
                      <th style={{textAlign:'right'}}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items?.map(item => (
                      <tr key={item.id}>
                        <td style={{fontWeight:500}}>{item.product?.name}</td>
                        <td style={{textAlign:'center'}}><span className="badge badge-neutral">{item.quantity}</span></td>
                        <td style={{textAlign:'right'}} className="td-secondary">₹{item.unit_price.toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                        <td style={{textAlign:'right', fontWeight:600}}>₹{(item.unit_price * item.quantity).toLocaleString('en-IN', {minimumFractionDigits:2})}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="order-total-box">
                <span className="order-total-label">Order Total</span>
                <span className="order-total-value">₹{detailOrder.total_amount.toLocaleString('en-IN', {minimumFractionDigits:2})}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetailOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
