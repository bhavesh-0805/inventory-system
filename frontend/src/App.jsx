import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import './App.css';

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/customers': 'Customers',
  '/orders': 'Orders',
};

function Layout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Inventory OS';

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">N</div>
          <div>
            <div className="brand-name">Nexus</div>
            <div className="brand-sub">Inventory OS</div>
          </div>
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-label">Menu</div>
          <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⊞</span>Dashboard
          </NavLink>
          <NavLink to="/products" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⊟</span>Products
          </NavLink>
          <NavLink to="/customers" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⊙</span>Customers
          </NavLink>
          <NavLink to="/orders" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
            <span className="nav-icon">⊕</span>Orders
          </NavLink>
        </div>
        <div className="sidebar-footer">
          <div className="status-badge">
            <div className="status-dot"></div>
            All systems online
          </div>
        </div>
      </aside>
      <div style={{flex:1, display:'flex', flexDirection:'column', minHeight:'100vh'}}>
        <div className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-right">
            <div className="topbar-avatar">A</div>
          </div>
        </div>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
