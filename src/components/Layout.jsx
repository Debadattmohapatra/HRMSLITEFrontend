import { Link, useLocation } from 'react-router-dom';
import {  Users, Calendar, LayoutDashboard, Menu, X, Search, Bell, Settings,Clock } from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
     { name: 'Manage Attendance', href: '/attendance/manage', icon: Clock },
    
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name} className="sidebar-menu-item">
                  <Link
                    to={item.href}
                    className={`sidebar-menu-link ${isActive(item.href) ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="sidebar-menu-icon" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-menu-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}>
            <Settings className="sidebar-menu-icon" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Header */}
        <header className="top-header">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-icon md:hidden"
            style={{ marginRight: '12px' }}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Search Bar */}
          <div className="header-search">
            <Search className="header-search-icon" />
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
            />
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Notifications */}
            <button className="header-notifications">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>

            {/* Profile */}
            <div className="header-profile">
              <div className="header-avatar">
                AD
              </div>
              <div className="header-profile-info">
                <div className="header-profile-name">Admin</div>
                <div className="header-profile-role">Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[999] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
