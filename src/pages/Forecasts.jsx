import React, { useState, useEffect } from 'react';
import { useCities } from '../hooks/useCities';
import { useStations } from '../hooks/useStations';
import { useForecast } from '../hooks/useForecast';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Forecasts = () => {
  const [selectedCity, setSelectedCity]       = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [horizon, setHorizon]                 = useState('24h');

  const { data: cities,   loading: citiesLoading }                                  = useCities();
  const { data: stations }                                                           = useStations(selectedCity);
  const { data: forecastData, loading: forecastLoading, error, refetch }            = useForecast(selectedStation);

  useEffect(() => { if (cities?.length > 0   && !selectedCity)    setSelectedCity(cities[0].id);     }, [cities,   selectedCity]);
  useEffect(() => { if (stations?.length > 0 && !selectedStation) setSelectedStation(stations[0].id); }, [stations, selectedStation]);

  if (citiesLoading) return <LoadingState message="Loading forecasts..." />;

  const handleCityChange = (e) => { setSelectedCity(e.target.value); setSelectedStation(''); };

  // Normalise — backend and mock have slightly different shapes
  const fSummary = forecastData?.summary || forecastData;
  const fChart   = forecastData?.chart   || [];
  const fModel   = forecastData?.model   || {};

  const statusOf = (val) => {
    if (val == null) return { label: '—',          bg: 'var(--bg-main)',            color: 'var(--text-secondary)' };
    if (val <= 30)   return { label: 'Good',        bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)' };
    if (val <= 60)   return { label: 'Satisfactory',bg: 'var(--status-good-bg)',     color: 'var(--status-good-text)' };
    if (val <= 90)   return { label: 'Moderate',    bg: 'var(--status-moderate-bg)', color: 'var(--status-moderate-text)' };
    if (val <= 120)  return { label: 'Poor',        bg: 'var(--status-poor-bg)',     color: 'var(--status-poor-text)' };
    return                  { label: 'Very Poor',   bg: 'var(--status-critical-bg)', color: 'var(--status-critical-text)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Air Quality Forecasts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>PM2.5 predictions from trained Random Forest models — synthetic dataset</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
          <select className="card" value={selectedCity} onChange={handleCityChange}
            style={{ padding: '8px', border: '1px solid var(--border-light)' }} aria-label="Select city">
            {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
          </select>
          <select className="card" value={selectedStation} onChange={e => setSelectedStation(e.target.value)}
            style={{ padding: '8px', border: '1px solid var(--border-light)' }} aria-label="Select station">
            <option value="" disabled>Select Station</option>
            {stations?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="card" value={horizon} onChange={e => setHorizon(e.target.value)}
            style={{ padding: '8px', border: '1px solid var(--border-light)' }} aria-label="Select horizon">
            <option value="1h">+1 Hour Horizon</option>
            <option value="6h">+6 Hours Horizon</option>
            <option value="24h">+24 Hours Horizon</option>
          </select>
        </div>
      </div>

      {forecastLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Main Forecast Chart */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>PM2.5 Historical + Forecast ({horizon})</h2>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={fChart} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.875rem' }} />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(249,115,22,0.1)" name="Confidence Band" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-card)" />
                  <Line type="monotone" dataKey="actual"   name="Historical Actual" stroke="var(--primary-accent)" strokeWidth={2} dot={{ r: 4 }} connectNulls={false} />
                  <Line type="monotone" dataKey="forecast" name="Forecast Value"    stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            {/* Forecast Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <h2 style={{ fontSize: '1rem' }}>Forecast Summary</h2>
              {[['h1', '+1 Hour', fSummary?.h1], ['h6', '+6 Hours', fSummary?.h6], ['h24', '+24 Hours', fSummary?.h24]].map(([k, label, val]) => {
                const st = statusOf(val);
                return (
                  <div key={k} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>{label}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>{val ?? '—'}</span>
                        {val != null && <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>µg/m³</span>}
                      </div>
                    </div>
                    <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Model Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
              <div className="card">
                <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Model Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
                  {[
                    ['Model',    fModel.name || 'RandomForestRegressor'],
                    ['Horizons', (fModel.horizons || ['1h','6h','24h']).join(' / ')],
                    ['Data',     'Synthetic dataset'],
                    ['Status',   'Demo — synthetic test split'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{k}</span>
                      <span style={{ fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{ backgroundColor: 'var(--bg-main)', border: 'none' }}>
                <h2 style={{ fontSize: '1rem', marginBottom: '8px' }}>Forecast Interpretation</h2>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <p style={{ marginBottom: '8px' }}><strong>Current PM2.5:</strong> {fSummary?.current ?? '—'} µg/m³</p>
                  <p style={{ marginBottom: '8px' }}><strong>+1h Forecast:</strong> {fSummary?.h1 ?? '—'} µg/m³</p>
                  <p style={{ marginBottom: '8px' }}><strong>+6h Forecast:</strong> {fSummary?.h6 ?? '—'} µg/m³</p>
                  <p><strong>+24h Forecast:</strong> {fSummary?.h24 ?? '—'} µg/m³</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forecasts;
