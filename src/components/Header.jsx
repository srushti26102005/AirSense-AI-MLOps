import React from 'react';
import { Search, Bell, ChevronDown, User, Menu } from 'lucide-react';

const Header = ({ toggleSidebar }) => {
  // Mock current time formatting
  const today = new Date();
  const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  const timeOptions = { hour: '2-digit', minute: '2-digit' };
  const dateStr = today.toLocaleDateString('en-IN', dateOptions);
  const timeStr = today.toLocaleTimeString('en-IN', timeOptions);

  return (
    <header className="header" role="banner">
      <div className="header-left-actions">
        <button 
          className="menu-toggle-btn" 
          onClick={toggleSidebar} 
          aria-label="Toggle navigation menu"
          aria-expanded="false"
        >
          <Menu size={24} />
        </button>
        <div className="header-search">
          <Search size={18} className="search-icon" aria-hidden="true" />
          <input type="search" placeholder="Search city or station..." className="search-input" aria-label="Search" />
        </div>
      </div>
      
      <div className="header-actions">
        <div className="header-datetime" aria-live="polite">
          {dateStr} | {timeStr}
        </div>
        
        <button className="notification-wrapper" aria-label="View 3 notifications">
          <Bell size={20} className="icon-action" aria-hidden="true" />
          <span className="notification-badge" aria-hidden="true">3</span>
        </button>
        
        <button className="user-profile" aria-label="User profile options, Admin">
          <div className="avatar" aria-hidden="true">
            <User size={16} />
          </div>
          <span className="user-name">Admin</span>
          <ChevronDown size={16} className="text-secondary" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default Header;
