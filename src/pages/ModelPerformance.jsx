import React from 'react';
import { useModelPerformance } from '../hooks/useMonitoring';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ModelPerformance = () => {
  const { data, loading, error, refetch } = useModelPerformance();

  if (loading) return <LoadingState message="Loading model performance metrics..." />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  const MetricCard = ({ title, mae, rmse, r2 }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 500, paddingBottom: '8px', borderBottom: '1px solid var(--border-light)' }}>{title} Horizon</h3>
      {[['MAE', mae], ['RMSE', rmse], ['R²', r2]].map(([label, val]) => (
        <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{label}</span>
          <span style={{ fontWeight: 600 }}>{val ?? '—'}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Model Performance</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Evaluation metrics for the trained RandomForest PM2.5 forecasting models</p>
          <a href="/incidents" style={{ display: 'inline-block', marginTop: '8px', padding: '6px 12px', backgroundColor: 'var(--bg-main)', color: 'var(--primary-accent)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border-light)' }}>
            Report Degradation
          </a>
        </div>
        <div className="card" style={{ display: 'flex', gap: '16px', padding: '12px 24px', backgroundColor: 'var(--bg-main)', border: 'none' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Model</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{data?.model || 'RandomForestRegressor'}</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>PM2.5</div>
          </div>
          <div style={{ borderLeft: '1px solid var(--border-light)', paddingLeft: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Data</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Synthetic dataset</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
        <MetricCard title="+1h"  mae={data?.metrics?.h1?.mae}  rmse={data?.metrics?.h1?.rmse}  r2={data?.metrics?.h1?.r2}  />
        <MetricCard title="+6h"  mae={data?.metrics?.h6?.mae}  rmse={data?.metrics?.h6?.rmse}  r2={data?.metrics?.h6?.r2}  />
        <MetricCard title="+24h" mae={data?.metrics?.h24?.mae} rmse={data?.metrics?.h24?.rmse} r2={data?.metrics?.h24?.r2} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Error by Forecast Horizon</h2>
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data?.chart || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
              <XAxis dataKey="horizon" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} cursor={{ fill: 'var(--bg-main)' }} />
              <Legend wrapperStyle={{ fontSize: '0.875rem', paddingTop: '10px' }} />
              <Bar dataKey="mae"  name="Mean Absolute Error (MAE)"        fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar dataKey="rmse" name="Root Mean Square Error (RMSE)"    fill="#8b5cf6" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformance;
