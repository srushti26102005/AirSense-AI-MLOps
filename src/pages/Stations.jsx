import React, { useState } from 'react';
import { useCities } from '../hooks/useCities';
import { useStations } from '../hooks/useStations';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { Search } from 'lucide-react';

const Stations = () => {
  const [selectedCity, setSelectedCity] = useState('');
  const [searchTerm, setSearchTerm]     = useState('');

  const { data: cities,   loading: citiesLoading }                          = useCities();
  const { data: stations, loading: stationsLoading, error, refetch }        = useStations(selectedCity || null);

  if (citiesLoading || stationsLoading) return <LoadingState message="Loading stations..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const filtered = (stations || []).filter(s => {
    const q = searchTerm.toLowerCase();
    return !q || s.name?.toLowerCase().includes(q) || s.city?.toLowerCase().includes(q);
  });

  const aqBadge = (pm25) => {
    if (pm25 == null) return { bg: 'var(--bg-main)', color: 'var(--text-secondary)', label: 'Unknown' };
    if (pm25 <= 30)   return { bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)',     label: 'Good' };
    if (pm25 <= 60)   return { bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)',     label: 'Satisfactory' };
    if (pm25 <= 90)   return { bg: 'var(--status-moderate-bg)', color: 'var(--status-moderate-text)', label: 'Moderate' };
    if (pm25 <= 120)  return { bg: 'var(--status-poor-bg)',     color: 'var(--status-poor-text)',     label: 'Poor' };
    return               { bg: 'var(--status-critical-bg)',  color: 'var(--status-critical-text)',  label: 'Very Poor' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Monitoring Stations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Detailed list of all deployed monitoring stations</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-secondary)' }} aria-hidden="true" />
            <input
              type="text" placeholder="Search station..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              aria-label="Search stations"
              style={{ padding: '8px 12px 8px 32px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', width: '200px' }}
            />
          </div>
          <select className="card" value={selectedCity} onChange={e => setSelectedCity(e.target.value)}
            style={{ padding: '8px', border: '1px solid var(--border-light)' }} aria-label="Filter by city">
            <option value="">All Cities</option>
            {cities?.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '16px', fontWeight: 600 }}>Station Name</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>City</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>State</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Current PM2.5</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>AQI Status</th>
              <th style={{ padding: '16px', fontWeight: 600 }}>Parameters</th>
              <th style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(station => {
              const pm25 = station.current_pm25 ?? station.pm25;
              const { bg, color, label } = aqBadge(pm25);
              return (
                <tr key={station.id} style={{ borderBottom: '1px solid var(--border-light)' }} className="table-row-hover">
                  <td style={{ padding: '16px', fontWeight: 500 }}>{station.name}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{station.city}</td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{station.state}</td>
                  <td style={{ padding: '16px', fontWeight: 500 }}>
                    {pm25 != null ? (
                      <>{pm25} <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>µg/m³</span></>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color }}>
                      {station.status || label}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {Array.isArray(station.parameters) ? station.parameters.join(', ') : (station.parameters || '—')}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <a href="/air-quality" style={{ color: 'var(--primary-accent)', fontWeight: 500, fontSize: '0.875rem' }}>View Details</a>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No stations match your criteria.</td></tr>
            )}
          </tbody>
        </table>
        <style>{`.table-row-hover:hover { background-color: var(--bg-main); }`}</style>
      </div>
    </div>
  );
};

export default Stations;
