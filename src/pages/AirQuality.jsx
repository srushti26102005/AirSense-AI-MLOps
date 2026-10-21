import React, { useState, useEffect } from 'react';
import { useCities } from '../hooks/useCities';
import { useStations } from '../hooks/useStations';
import { useAirQuality } from '../hooks/useAirQuality';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { StatCard, LoadingState, ErrorState } from '../components/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AirQuality = () => {
  const [selectedCity, setSelectedCity]       = useState('');
  const [selectedStation, setSelectedStation] = useState('');

  const { data: cities,  loading: citiesLoading }                                              = useCities();
  const { data: stations }                                                                     = useStations(selectedCity);
  const { data: aqData,   loading: aqLoading,   error: aqError,   refetch: aqRefetch }        = useAirQuality(selectedStation);
  const { data: histData, loading: histLoading }                                               = useHistoricalData(selectedStation, 'PM2.5', '24h');

  useEffect(() => { if (cities?.length > 0  && !selectedCity)   setSelectedCity(cities[0].id);     }, [cities,   selectedCity]);
  useEffect(() => { if (stations?.length > 0 && !selectedStation) setSelectedStation(stations[0].id); }, [stations, selectedStation]);

  if (citiesLoading) return <LoadingState message="Loading Air Quality data..." />;

  const handleCityChange = (e) => { setSelectedCity(e.target.value); setSelectedStation(''); };
  const currentStation   = stations?.find(s => s.id === selectedStation);
  // Backend returns chart rows with key = pollutant name (e.g. "PM2.5")
  const chartKey         = histData?.pollutant || 'PM2.5';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Air Quality Overview</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current air-quality measurements and pollutant trends</p>
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

      {currentStation && (
        <div className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '0.875rem', flexWrap: 'wrap' }}>
          <div><strong>Station:</strong> {currentStation.name}</div>
          <div><strong>City:</strong> {currentStation.city}</div>
          <div><strong>Status:</strong> <span style={{ color: 'var(--status-good-text)' }}>{currentStation.active_status || 'Active'}</span></div>
          <div><strong>Parameters:</strong> {Array.isArray(currentStation.parameters) ? currentStation.parameters.join(', ') : (currentStation.parameters || '—')}</div>
        </div>
      )}

      {aqLoading ? <LoadingState /> : aqError ? (
        <ErrorState message={aqError} onRetry={aqRefetch} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--spacing-md)' }}>
          {aqData && Object.entries(aqData.current).map(([key, data]) => (
            <StatCard key={key} title={key} value={data.value ?? '—'} unit={data.unit} status={data.status} change={data.change} />
          ))}
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Historical PM2.5 Trend (24 h)</h2>
        {histLoading ? <LoadingState /> : (
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={histData?.chart || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)' }} />
                <Line type="monotone" dataKey={chartKey} name={chartKey}
                  stroke="var(--primary-accent)" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AirQuality;
