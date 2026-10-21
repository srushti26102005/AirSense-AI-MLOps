import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export const LoadingState = ({ message = 'Loading data...' }) => (
  <div className="flex-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
    <Loader2 className="spinner" size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
    <p>{message}</p>
    <style>{`
      @keyframes spin { 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

export const ErrorState = ({ message = 'Unable to load data.', onRetry }) => (
  <div className="flex-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'var(--status-critical-text)', backgroundColor: 'var(--status-critical-bg)', borderRadius: 'var(--radius-md)' }}>
    <AlertCircle size={32} style={{ marginBottom: '16px' }} />
    <p style={{ marginBottom: onRetry ? '16px' : '0' }}>{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry} 
        style={{ padding: '8px 16px', backgroundColor: 'var(--status-critical-text)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 500, cursor: 'pointer' }}
      >
        Retry
      </button>
    )}
  </div>
);

export const EmptyState = ({ title = 'No Data Found', message = 'There is no data available to display at this time.' }) => (
  <div className="flex-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-light)' }}>
    <AlertCircle size={32} style={{ marginBottom: '16px', opacity: 0.5 }} />
    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{title}</h3>
    <p style={{ fontSize: '0.875rem', textAlign: 'center', maxWidth: '300px' }}>{message}</p>
  </div>
);

export const StatCard = ({ title, value, unit, status, change }) => {
  const getStatusColor = (s) => {
    switch(s?.toLowerCase()) {
      case 'good': return 'var(--status-good-text)';
      case 'moderate': return 'var(--status-moderate-text)';
      case 'poor': return 'var(--status-poor-text)';
      case 'critical': return 'var(--status-critical-text)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="card stat-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{value}</span>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{unit}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.75rem', fontWeight: '500' }}>
        <span style={{ color: getStatusColor(status), padding: '2px 6px', backgroundColor: `color-mix(in srgb, ${getStatusColor(status)} 15%, transparent)`, borderRadius: '4px' }}>{status}</span>
        <span style={{ color: change?.includes('↑') && status === 'Critical' ? 'var(--status-critical-text)' : 'var(--text-secondary)' }}>{change}</span>
      </div>
    </div>
  );
};

// DemoDataBanner kept as a no-op export so any remaining imports don't break.
export const DemoDataBanner = () => null;
