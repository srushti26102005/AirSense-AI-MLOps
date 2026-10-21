import React, { useState, useEffect } from 'react';
import { useCities } from '../hooks/useCities';
import { useStations } from '../hooks/useStations';
import { useAirQuality } from '../hooks/useAirQuality';
import { useForecast } from '../hooks/useForecast';
import { useWeather } from '../hooks/useWeather';
import { StatCard, LoadingState, ErrorState } from '../components/UIComponents';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Thermometer, Droplets, Wind, Compass, Gauge, CloudRain, Cloud } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const Dashboard = () => {
  const [selectedCity, setSelectedCity]       = useState('');
  const [selectedStation, setSelectedStation] = useState('');

  const { data: cities,   loading: citiesLoading }  = useCities();
  const { data: stations }                           = useStations(selectedCity);
  const { data: aqData,      loading: aqLoading,      error: aqError,  refetch: aqRefetch }  = useAirQuality(selectedStation);
  const { data: forecastData, loading: forecastLoading }                                     = useForecast(selectedStation);
  const { data: weatherData,  loading: weatherLoading }                                      = useWeather(selectedStation);

  // Auto-select first city once loaded
  useEffect(() => {
    if (cities?.length > 0 && !selectedCity) setSelectedCity(cities[0].id);
  }, [cities, selectedCity]);

  // Auto-select first station once stations load
  useEffect(() => {
    if (stations?.length > 0 && !selectedStation) setSelectedStation(stations[0].id);
  }, [stations, selectedStation]);

  if (citiesLoading) return <LoadingState message="Loading dashboard..." />;

  const handleCityChange = (e) => { setSelectedCity(e.target.value); setSelectedStation(''); };

  // Normalise forecast shapes (backend vs mock differ slightly)
  const fSummary = forecastData?.summary || forecastData;
  const fChart   = forecastData?.chart   || [];
  const fModel   = forecastData?.model   || {};
  const c        = weatherData?.current  || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Air quality monitoring and forecasting for major Indian cities
          </p>
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
        </div>
      </div>



      {/* Pollutant Summary */}
      {aqLoading ? <LoadingState /> : aqError ? (
        <ErrorState message={aqError} onRetry={aqRefetch} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--spacing-md)' }}>
          {aqData && Object.entries(aqData.current).map(([key, data]) => (
            <StatCard key={key} title={key} value={data.value ?? '—'} unit={data.unit} status={data.status} change={data.change} />
          ))}
        </div>
      )}

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--spacing-lg)' }}>
        {/* PM2.5 Trend + Forecast */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>PM2.5 Trend & Forecast</h2>
          {forecastLoading ? <LoadingState /> : (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={fChart} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '0.75rem' }} />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(249,115,22,0.1)" name="Confidence Band" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="var(--bg-card)" />
                  <Line type="monotone" dataKey="actual"   name="Historical" stroke="var(--primary-accent)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  <Line type="monotone" dataKey="forecast" name="Forecast"   stroke="#f97316" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} connectNulls={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {/* Forecast Card */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>PM2.5 Forecast</h2>
            {forecastLoading ? <LoadingState /> : (
              <div>
                {[['1h', '+1 Hour', fSummary?.h1], ['6h', '+6 Hours', fSummary?.h6], ['24h', '+24 Hours', fSummary?.h24]].map(([k, label, val]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
                      <div style={{ fontWeight: 600 }}>{val != null ? `${val} µg/m³` : '—'}</div>
                    </div>
                  </div>
                ))}
                <div style={{ backgroundColor: 'var(--bg-main)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Model</span>
                    <span style={{ fontWeight: 500 }}>{fModel.name || 'RandomForestRegressor'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Data</span>
                    <span style={{ fontWeight: 500 }}>Synthetic dataset</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weather Card */}
          <div className="card">
            <h2 style={{ fontSize: '1rem', marginBottom: '4px' }}>Weather Conditions</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)' }}>
              {weatherData?.city || weatherData?.station_name || 'Selected Station'}
            </p>
            {weatherLoading ? <LoadingState /> : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  [Thermometer, `${c.temperature ?? '—'}°C`],
                  [Droplets,    `${c.humidity ?? '—'}%`],
                  [Wind,        `${c.windSpeed ?? '—'} m/s`],
                  [Compass,     c.windDirection ?? '—'],
                  [Gauge,       `${c.pressure ?? '—'} hPa`],
                  [CloudRain,   `${c.precipitation ?? '—'} mm`],
                  [Cloud,       `${c.cloudCover ?? '—'}%`],
                ].map(([Icon, val], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={16} color="var(--text-secondary)" aria-hidden="true" />
                    <div style={{ fontSize: '0.875rem' }}>{val}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* City Overview Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>City Overview</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '12px 8px', fontWeight: 500 }}>City</th>
              <th style={{ padding: '12px 8px', fontWeight: 500 }}>Stations</th>
              <th style={{ padding: '12px 8px', fontWeight: 500 }}>Current PM2.5</th>
              <th style={{ padding: '12px 8px', fontWeight: 500 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {cities.map(city => {
              const s = city.status || '';
              const isGood = ['Good','Satisfactory','Normal'].includes(s);
              const isMod  = ['Moderate','Monitoring'].includes(s);
              return (
                <tr key={city.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 500 }}>{city.name}</td>
                  <td style={{ padding: '12px 8px' }}>{city.station_count ?? city.stations ?? '—'}</td>
                  <td style={{ padding: '12px 8px' }}>{city.current_pm25 ?? city.currentPM25 ?? '—'}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                      backgroundColor: isGood ? 'var(--status-good-bg)' : isMod ? 'var(--status-moderate-bg)' : 'var(--status-poor-bg)',
                      color:           isGood ? 'var(--status-good-text)' : isMod ? 'var(--status-moderate-text)' : 'var(--status-poor-text)',
                    }}>{s}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
