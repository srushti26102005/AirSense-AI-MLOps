import React from 'react';
import { useMonitoringOverview } from '../hooks/useMonitoring';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { formatDate } from '../utils/formatters';
import { ArrowRight, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const MonitoringOverview = () => {
  const { data, loading, error, refetch } = useMonitoringOverview();

  if (loading) return <LoadingState message="Loading MLOps metrics..." />;
  if (error)   return <ErrorState message={error} onRetry={refetch} />;

  const statusColor = (s) => {
    switch(s?.toLowerCase()) {
      case 'healthy':  return 'var(--status-good-text)';
      case 'warning':  return 'var(--status-moderate-text)';
      case 'critical': return 'var(--status-critical-text)';
      default:         return 'var(--text-secondary)';
    }
  };

  const statusIcon = (s) => {
    switch(s?.toLowerCase()) {
      case 'healthy':  return <CheckCircle  size={16} color="var(--status-good-text)"     aria-hidden="true" />;
      case 'warning':  return <AlertTriangle size={16} color="var(--status-moderate-text)" aria-hidden="true" />;
      case 'critical': return <AlertTriangle size={16} color="var(--status-critical-text)" aria-hidden="true" />;
      default:         return <Activity      size={16} color="var(--text-secondary)"       aria-hidden="true" />;
    }
  };

  const MonitoringCard = ({ title, dataObj, link }) => (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500 }}>{title}</h3>
        {link && <a href={link} style={{ color: 'var(--primary-accent)', fontSize: '0.875rem' }}>View Details</a>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 600, color: statusColor(dataObj?.status) }}>
        {statusIcon(dataObj?.status)}
        {dataObj?.status || '—'}
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{dataObj?.explanation}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
        <Clock size={12} aria-hidden="true" />
        {' '}Last updated: {dataObj?.timestamp ? formatDate(dataObj.timestamp, { hour: '2-digit', minute: '2-digit' }) : '—'}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>MLOps Monitoring</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Monitor data quality, model performance, prediction behavior and system health.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-md)' }}>
        <MonitoringCard title="Data Quality"      dataObj={data?.dataQuality}      link="/monitoring/data-quality" />
        <MonitoringCard title="Model Performance" dataObj={data?.modelPerformance} link="/monitoring/model-performance" />
        <MonitoringCard title="Data Drift"        dataObj={data?.dataDrift}        link="/monitoring/drift" />
        <MonitoringCard title="Prediction Drift"  dataObj={data?.predictionDrift}  link="/monitoring/drift" />
        <MonitoringCard title="Pipeline Status"   dataObj={data?.pipelineStatus} />
        <MonitoringCard title="Last Analysis"     dataObj={data?.lastAnalysis} />
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginBottom: '16px' }}>MLOps Conceptual Flow</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {['Synthetic Data','Validation','Feature Processing','Prediction','Monitoring','Drift Detection','Incident','Retraining'].map((step, i, arr) => (
            <React.Fragment key={step}>
              <div style={{
                padding: '8px 12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)',
                ...(step === 'Monitoring' ? { color: 'var(--primary-accent)', border: '1px solid var(--primary-accent)' } : {}),
              }}>{step}</div>
              {i < arr.length - 1 && <ArrowRight size={16} aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonitoringOverview;
