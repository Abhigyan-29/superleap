import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Zap } from 'lucide-react';
import './Layout.css';

export const Layout: React.FC = () => {
  return (
    <div className="layout-root">
      <nav className="navbar">
        <div className="navbar-container container">
          <div className="navbar-brand">
            <div className="navbar-logo"><Zap size={20} /></div>
            <span className="navbar-title">Superleap</span>
          </div>
          <div className="navbar-links">
            <NavLink
              to="/leads"
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Users size={18} />
              List View
            </NavLink>
            <NavLink
              to="/board"
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <LayoutDashboard size={18} />
              Boards
            </NavLink>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
