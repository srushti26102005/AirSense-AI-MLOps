import React from 'react';
import { useDataQuality } from '../hooks/useMonitoring';
import { LoadingState, ErrorState } from '../components/UIComponents';

const DataQuality = () => {
  const { data, loading, error, refetch } = useDataQuality();

  if (loading) return <LoadingState message="Loading data quality report..." />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  // Backend returns { table: [{parameter/check, issue_count, status}], total_records, checks_passed, checks_warned }
  const table = data?.table || [];
  const warnings = table.filter(r => r.status === 'WARNING').length;
  const passes   = table.filter(r => r.status === 'PASS').length;

  const statusStyle = (s) => {
    switch(s?.toUpperCase()) {
      case 'PASS':    return { bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)' };
      case 'WARNING': return { bg: 'var(--status-moderate-bg)', color: 'var(--status-moderate-text)' };
      case 'FAIL':    return { bg: 'var(--status-critical-bg)', color: 'var(--status-critical-text)' };
      case 'INFO':    return { bg: 'var(--bg-main)',             color: 'var(--text-secondary)' };
      default:        return { bg: 'var(--bg-main)',             color: 'var(--text-secondary)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Data Quality Monitoring</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Completeness and validity checks on the synthetic test dataset
          </p>
          <a href="/incidents" style={{ display: 'inline-block', marginTop: '8px', padding: '6px 12px', backgroundColor: 'var(--bg-main)', color: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border-light)' }}>
            Report Data Issue
          </a>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <div className="card" style={{ textAlign: 'center', minWidth: '100px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Total Records</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{(data?.total_records)?.toLocaleString() ?? '—'}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', minWidth: '100px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Checks Passed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--status-good-text)' }}>{passes}</div>
          </div>
          <div className="card" style={{ textAlign: 'center', minWidth: '100px' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Warnings</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: warnings > 0 ? 'var(--status-moderate-text)' : 'inherit' }}>{warnings}</div>
          </div>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <h2 style={{ fontSize: '1rem', margin: 'var(--spacing-lg)', marginBottom: 'var(--spacing-sm)' }}>Quality Check Results</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px', fontWeight: 600 }}>Check</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Issue / Count</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, idx) => {
              const { bg, color } = statusStyle(row.status);
              // Backend field is "parameter" (mapped from "check")
              const label = row.parameter || row.check || '—';
              const count = row.issue_count ?? row.records;
              return (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{label}</td>
                  <td style={{ padding: '16px' }}>{count?.toLocaleString() ?? '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {table.length === 0 && (
              <tr><td colSpan="3" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No data quality results available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataQuality;
