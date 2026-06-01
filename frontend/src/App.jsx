import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';


function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-icon">⬡</div>
            <div className="brand-text">
              <span className="brand-name">NEXUS</span>
              <span className="brand-sub">Inventory OS</span>
            </div>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">◈</span>
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/products" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">⬡</span>
              <span>Products</span>
            </NavLink>
            <NavLink to="/customers" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">◎</span>
              <span>Customers</span>
            </NavLink>
            <NavLink to="/orders" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">◐</span>
              <span>Orders</span>
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <div className="status-dot"></div>
            <span>System Online</span>
          </div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
