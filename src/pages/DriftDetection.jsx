import React from 'react';
import { useDriftDetection } from '../hooks/useMonitoring';
import { LoadingState, ErrorState } from '../components/UIComponents';

const DriftDetection = () => {
  const { data, loading, error, refetch } = useDriftDetection();

  if (loading) return <LoadingState message="Loading drift detection report..." />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  const rowBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('no drift') || s === 'low')
      return { bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)' };
    if (s.includes('moderate'))
      return { bg: 'var(--status-moderate-bg)', color: 'var(--status-moderate-text)' };
    if (s.includes('drift detected') || s === 'high')
      return { bg: 'var(--status-poor-bg)',     color: 'var(--status-poor-text)' };
    return   { bg: 'var(--bg-main)',             color: 'var(--text-secondary)' };
  };

  const summaryBadge = (s) => {
    switch(s?.toLowerCase()) {
      case 'healthy': return { bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)' };
      case 'warning': return { bg: 'var(--status-moderate-bg)', color: 'var(--status-moderate-text)' };
      default:        return { bg: 'var(--bg-main)',             color: 'var(--text-secondary)' };
    }
  };

  const summary = data?.summary || {};
  const table   = data?.table   || [];

  const { bg: driftBg, color: driftColor } = summaryBadge(summary.dataDriftStatus);
  const { bg: predBg,  color: predColor  } = summaryBadge(summary.predictionDriftStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Drift Detection</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Feature distribution comparison: training dataset vs test dataset (PSI &amp; KS statistics)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
          <button onClick={refetch} style={{ padding: '8px 16px', backgroundColor: 'var(--bg-main)', color: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: '1px solid var(--border-light)' }}>
            Refresh Report
          </button>
          <a href="/incidents" style={{ display: 'inline-block', padding: '8px 16px', backgroundColor: 'var(--bg-main)', color: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border-light)' }}>
            Create Incident
          </a>
        </div>
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Data Drift Status</div>
          <span style={{ padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', alignSelf: 'flex-start', backgroundColor: driftBg, color: driftColor }}>
            {summary.dataDriftStatus || '—'}
          </span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Prediction Drift Status</div>
          <span style={{ padding: '4px 10px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', alignSelf: 'flex-start', backgroundColor: predBg, color: predColor }}>
            {summary.predictionDriftStatus || '—'}
          </span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Features with Moderate/High Drift</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: (summary.affectedFeatures || 0) > 0 ? 'var(--status-moderate-text)' : 'var(--status-good-text)' }}>
            {summary.affectedFeatures ?? 0}
          </div>
        </div>
      </div>

      {/* Feature Table */}
      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <h2 style={{ fontSize: '1rem', margin: 'var(--spacing-lg)', marginBottom: 'var(--spacing-sm)' }}>Feature-Level Drift Analysis</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px', fontWeight: 600 }}>Feature</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Reference Rows</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Current Rows</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>PSI Score</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>KS p-value</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {table.map((row, i) => {
              const { bg, color } = rowBadge(row.status);
              const psiHigh = row.psi != null && row.psi >= 0.25;
              const ksSig   = row.ks_pvalue != null && row.ks_pvalue < 0.05;
              return (
                <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{row.feature}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{row.reference_rows?.toLocaleString() ?? '—'}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{row.current_rows?.toLocaleString() ?? '—'}</td>
                  <td style={{ padding: '16px', fontWeight: psiHigh ? 700 : 400, color: psiHigh ? 'var(--status-poor-text)' : 'inherit' }}>
                    {row.psi != null ? row.psi.toFixed(4) : '—'}
                  </td>
                  <td style={{ padding: '16px', color: ksSig ? 'var(--status-moderate-text)' : 'inherit' }}>
                    {row.ks_pvalue != null ? row.ks_pvalue.toFixed(4) : '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {table.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No drift data available.</td></tr>
            )}
          </tbody>
        </table>
        <div style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-light)' }}>
          PSI thresholds: &lt;0.10 = Low (No Drift) | 0.10–0.25 = Moderate | &gt;0.25 = High (Drift Detected). KS p-value &lt;0.05 = statistically significant difference.
        </div>
      </div>
    </div>
  );
};

export default DriftDetection;
