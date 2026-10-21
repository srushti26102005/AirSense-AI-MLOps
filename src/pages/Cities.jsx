import React, { useState } from 'react';
import { useCities } from '../hooks/useCities';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { Search } from 'lucide-react';

const Cities = () => {
  const { data: cities, loading, error, refetch } = useCities();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) return <LoadingState message="Loading cities..." />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  const filtered = (cities || []).filter(city =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    city.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const badge = (status) => {
    const s = (status || '').toLowerCase();
    if (['good','satisfactory','normal'].some(x => s.includes(x)))
      return { bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)' };
    if (['moderate','monitoring'].some(x => s.includes(x)))
      return { bg: 'var(--status-moderate-bg)', color: 'var(--status-moderate-text)' };
    return   { bg: 'var(--status-poor-bg)',      color: 'var(--status-poor-text)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Monitored Cities</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Overview of all cities in the AirSense network</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} aria-hidden="true" />
          <input
            type="text" placeholder="Search city or state..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            aria-label="Search cities"
            style={{ padding: '8px 12px 8px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', width: '250px' }}
          />
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px', fontWeight: 600 }}>City</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>State</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Stations</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Current PM2.5</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(city => {
              const { bg, color } = badge(city.status);
              return (
                <tr key={city.id} style={{ borderBottom: '1px solid var(--border-light)' }} className="table-row-hover">
                  <td style={{ padding: '16px', fontWeight: 500 }}>{city.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{city.state}</td>
                  <td style={{ padding: '16px' }}>{city.station_count ?? city.stations ?? '—'}</td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontWeight: 600 }}>{city.current_pm25 ?? city.currentPM25 ?? '—'}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>µg/m³</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color }}>
                      {city.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <a href="/air-quality/stations" style={{ color: 'var(--primary-accent)', fontWeight: 500, fontSize: '0.875rem' }}>View Stations</a>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No cities match your search.</td></tr>
            )}
          </tbody>
        </table>
        <style>{`.table-row-hover:hover { background-color: var(--bg-main); }`}</style>
      </div>
    </div>
  );
};

export default Cities;
