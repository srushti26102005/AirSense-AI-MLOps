import React, { useState, useEffect } from 'react';
import { useCities } from '../hooks/useCities';
import { useStations } from '../hooks/useStations';
import { useHistoricalData } from '../hooks/useHistoricalData';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Pollutant column names exactly as stored in the backend dataset
const POLLUTANTS = [
  { label: 'PM2.5', value: 'PM2.5' },
  { label: 'PM10',  value: 'PM10'  },
  { label: 'NO2',   value: 'NO2'   },
  { label: 'SO2',   value: 'SO2'   },
  { label: 'CO',    value: 'CO'    },
  { label: 'O3',    value: 'O3'    },
];

const HistoricalData = () => {
  const [selectedCity, setSelectedCity]       = useState('');
  const [selectedStation, setSelectedStation] = useState('');
  const [pollutant, setPollutant]             = useState('PM2.5');
  const [timeRange, setTimeRange]             = useState('24h');

  const { data: cities,  loading: citiesLoading }                                                 = useCities();
  const { data: stations }                                                                        = useStations(selectedCity);
  const { data: histData, loading: histLoading, error, refetch }                                  = useHistoricalData(selectedStation, pollutant, timeRange);

  useEffect(() => { if (cities?.length > 0   && !selectedCity)    setSelectedCity(cities[0].id);     }, [cities,   selectedCity]);
  useEffect(() => { if (stations?.length > 0 && !selectedStation) setSelectedStation(stations[0].id); }, [stations, selectedStation]);

  if (citiesLoading) return <LoadingState message="Loading historical context..." />;

  const handleCityChange = (e) => { setSelectedCity(e.target.value); setSelectedStation(''); };
  // Backend returns the exact pollutant name as the chart key
  const chartKey = histData?.pollutant || pollutant;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Historical Data</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Analyze past air-quality trends from the synthetic dataset</p>
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
          <select className="card" value={pollutant} onChange={e => setPollutant(e.target.value)}
            style={{ padding: '8px', border: '1px solid var(--border-light)' }} aria-label="Select pollutant">
            {POLLUTANTS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <select className="card" value={timeRange} onChange={e => setTimeRange(e.target.value)}
            style={{ padding: '8px', border: '1px solid var(--border-light)' }} aria-label="Select time range">
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      {!histLoading && histData && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
          {[['Average', histData.summary?.average], ['Minimum', histData.summary?.min], ['Maximum', histData.summary?.max], ['Observations', histData.summary?.observations]].map(([label, val]) => (
            <div key={label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{val ?? '—'}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>{pollutant} Trend</h2>
        {histLoading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={histData?.chart || []} margin={{ top: 10, right: 30, bottom: 10, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
                <Line type="monotone" dataKey={chartKey} name={pollutant}
                  stroke="var(--primary-accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalData;
