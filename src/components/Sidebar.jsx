import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wind, 
  MapPin, 
  Building2, 
  History, 
  LineChart, 
  CloudSun, 
  Activity, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  Box,
  Layers,
  Database,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, closeSidebar }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wind className="sidebar-logo-icon" size={28} aria-hidden="true" />
          <div>
            <h1 className="sidebar-title">AirSense AI</h1>
            <p className="sidebar-subtitle">Air Quality Platform</p>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={closeSidebar} aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-section">
          <p className="nav-section-title">Air Quality</p>
          <NavLink to="/air-quality/cities" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Building2 size={18} />
            <span>Cities</span>
          </NavLink>
          <NavLink to="/air-quality/stations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <MapPin size={18} />
            <span>Stations</span>
          </NavLink>
          <NavLink to="/air-quality/historical" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <History size={18} />
            <span>Historical Data</span>
          </NavLink>
        </div>

        <NavLink to="/forecasts" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LineChart size={18} />
          <span>Forecasts</span>
        </NavLink>

        <NavLink to="/weather" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <CloudSun size={18} />
          <span>Weather</span>
        </NavLink>

        <div className="nav-section">
          <p className="nav-section-title">Monitoring</p>
          <NavLink to="/monitoring/data-quality" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={18} />
            <span>Data Quality</span>
          </NavLink>
          <NavLink to="/monitoring/model-performance" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={18} />
            <span>Model Performance</span>
          </NavLink>
          <NavLink to="/monitoring/drift" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <TrendingUp size={18} />
            <span>Drift Detection</span>
          </NavLink>
        </div>

        <NavLink to="/incidents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={18} />
          <span>Incidents</span>
        </NavLink>

        <div className="nav-section">
          <p className="nav-section-title">Models</p>
          <NavLink to="/models/versions" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Layers size={18} />
            <span>Model Versions</span>
          </NavLink>
          <NavLink to="/models/experiments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Database size={18} />
            <span>Experiments</span>
          </NavLink>
        </div>

          <NavLink to="/settings" className={({ isActive }) => `nav-item mt-auto ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
            <Settings size={18} aria-hidden="true" />
            <span>Settings</span>
          </NavLink>
        </nav>
      </aside>
    );
  };

export default Sidebar;
