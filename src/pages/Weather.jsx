import React, { useState, useEffect } from 'react';
import { useCities } from '../hooks/useCities';
import { useStations } from '../hooks/useStations';
import { useWeather } from '../hooks/useWeather';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Wind, Compass, Gauge, CloudRain, Cloud } from 'lucide-react';

const Weather = () => {
  const [selectedCity, setSelectedCity]       = useState('');
  const [selectedStation, setSelectedStation] = useState('');

  const { data: cities,  loading: citiesLoading }                          = useCities();
  const { data: stations }                                                  = useStations(selectedCity);
  const { data: weatherData, loading, error, refetch }                     = useWeather(selectedStation);

  useEffect(() => { if (cities?.length > 0   && !selectedCity)    setSelectedCity(cities[0].id);     }, [cities,   selectedCity]);
  useEffect(() => { if (stations?.length > 0 && !selectedStation) setSelectedStation(stations[0].id); }, [stations, selectedStation]);

  if (citiesLoading) return <LoadingState message="Loading weather context..." />;

  const handleCityChange = (e) => { setSelectedCity(e.target.value); setSelectedStation(''); };

  const WCard = ({ icon: Icon, label, value, unit }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: '50%', color: 'var(--primary-accent)' }}>
        <Icon size={24} aria-hidden="true" />
      </div>
      <div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          {value ?? '—'} <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--text-secondary)' }}>{unit}</span>
        </div>
      </div>
    </div>
  );

  const c = weatherData?.current || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Meteorological Conditions</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current weather context for air-quality monitoring</p>
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

      {loading ? <LoadingState /> : error ? <ErrorState message={error} onRetry={refetch} /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div className="card" style={{ backgroundColor: 'var(--bg-main)', border: 'none', padding: '16px' }}>
            <h3 style={{ fontSize: '0.875rem', marginBottom: '8px' }}>Weather Features Used in PM2.5 Forecasting</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Temperature, humidity, wind speed, wind direction, precipitation, pressure and cloud cover are primary
              contextual features fed into the RandomForest PM2.5 forecasting models.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
            <WCard icon={Thermometer} label="Temperature"      value={c.temperature}   unit="°C"  />
            <WCard icon={Droplets}    label="Relative Humidity" value={c.humidity}      unit="%"   />
            <WCard icon={Wind}        label="Wind Speed"        value={c.windSpeed}     unit="m/s" />
            <WCard icon={Wind}        label="Wind Gusts"        value={c.windGust}      unit="m/s" />
            <WCard icon={Compass}     label="Wind Direction"    value={c.windDirection} unit=""    />
            <WCard icon={Gauge}       label="Pressure"          value={c.pressure}      unit="hPa" />
            <WCard icon={CloudRain}   label="Precipitation"     value={c.precipitation} unit="mm"  />
            <WCard icon={Cloud}       label="Cloud Cover"       value={c.cloudCover}    unit="%"   />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
            <div className="card">
              <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Temperature Trend (24 h)</h2>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData?.chart || []} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
                    <Line type="monotone" dataKey="temperature" name="Temp °C" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Humidity & Wind Speed</h2>
              <div style={{ height: '250px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData?.chart || []} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
                    <Line yAxisId="left"  type="monotone" dataKey="humidity"  name="Humidity %"  stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                    <Line yAxisId="right" type="monotone" dataKey="windSpeed" name="Wind m/s"    stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
