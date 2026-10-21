import React, { useState } from 'react';
import { useIncidents, useRetraining } from '../hooks/useIncidents';
import { LoadingState, ErrorState } from '../components/UIComponents';
import { formatDate } from '../utils/formatters';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, Search, Filter, Plus, ArrowRight, X, Cpu } from 'lucide-react';

const Incidents = () => {
  const { data: incidents, loading: incidentsLoading, error, refetch } = useIncidents();
  const { status: retrainingStatus, loading: retrainingLoading, triggerRetraining } = useRetraining();

  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  if (incidentsLoading) return <LoadingState message="Loading incidents..." />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'var(--status-critical-text)';
      case 'warning': return 'var(--status-moderate-text)';
      case 'info': return 'var(--primary-accent)';
      default: return 'var(--text-secondary)';
    }
  };

  const getSeverityBg = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'var(--status-critical-bg)';
      case 'warning': return 'var(--status-moderate-bg)';
      case 'info': return 'rgba(59, 130, 246, 0.1)';
      default: return 'var(--bg-main)';
    }
  };

  const filteredIncidents = incidents?.filter(inc => 
    inc.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inc.source.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const summary = {
    open: incidents?.filter(i => i.status === 'Open' || i.status === 'Investigating').length || 0,
    critical: incidents?.filter(i => i.severity === 'Critical' && i.status !== 'Resolved').length || 0,
    warning: incidents?.filter(i => i.severity === 'Warning' && i.status !== 'Resolved').length || 0,
    resolved: incidents?.filter(i => i.status === 'Resolved').length || 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Incident Management</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track, investigate and manage data-quality, model-performance and drift-related incidents.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 500, cursor: 'pointer' }}>
          <Plus size={18} /> Create Incident
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-md)' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Open Incidents</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{summary.open}</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Critical</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: summary.critical > 0 ? 'var(--status-critical-text)' : 'inherit' }}>{summary.critical}</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Warning</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: summary.warning > 0 ? 'var(--status-moderate-text)' : 'inherit' }}>{summary.warning}</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Resolved</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>{summary.resolved}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedIncident ? '2fr 1fr' : '1fr', gap: 'var(--spacing-lg)' }}>
        
        {/* Incident Table */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder="Search incidents..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ padding: '10px 12px 10px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', width: '300px' }}
            />
          </div>

          <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Incident ID</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Severity</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Created</th>
                  <th style={{ padding: '16px', fontWeight: 600 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map(incident => (
                  <tr key={incident.id} style={{ borderBottom: '1px solid var(--border-light)', backgroundColor: selectedIncident?.id === incident.id ? 'var(--bg-main)' : 'transparent', cursor: 'pointer' }} onClick={() => setSelectedIncident(incident)}>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{incident.id}</td>
                    <td style={{ padding: '16px' }}>{incident.type}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: getSeverityBg(incident.severity), color: getSeverityColor(incident.severity) }}>
                        {incident.severity}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>
                      <span style={{ color: incident.status === 'Resolved' ? 'var(--status-good-text)' : 'inherit' }}>{incident.status}</span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{formatDate(incident.created, { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ padding: '16px' }}>
                      <button style={{ color: 'var(--primary-accent)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incident Details & Retraining Panel */}
        {selectedIncident && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{selectedIncident.id} Details</h2>
              <button onClick={() => setSelectedIncident(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>

            {/* Workflow status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <div style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', color: selectedIncident.status === 'Open' ? 'var(--primary-accent)' : 'inherit' }}>Detected</div>
              <ArrowRight size={12} />
              <div style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', color: selectedIncident.status === 'Investigating' ? 'var(--primary-accent)' : 'inherit' }}>Investigating</div>
              <ArrowRight size={12} />
              <div style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', color: selectedIncident.status === 'Action Required' ? 'var(--primary-accent)' : 'inherit' }}>Action Required</div>
              <ArrowRight size={12} />
              <div style={{ padding: '4px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-main)', color: selectedIncident.status === 'Resolved' ? 'var(--status-good-text)' : 'inherit' }}>Resolved</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Type</span><span style={{ fontWeight: 500 }}>{selectedIncident.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Source</span><span style={{ fontWeight: 500 }}>{selectedIncident.source}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Affected Feature</span><span style={{ fontWeight: 500 }}>{selectedIncident.feature}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Score / Threshold</span><span style={{ fontWeight: 600, color: 'var(--status-critical-text)' }}>{selectedIncident.score} / {selectedIncident.threshold}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Assigned To</span><span style={{ fontWeight: 500 }}>{selectedIncident.assignedTo}</span>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', lineHeight: 1.5 }}>
              <strong>Description:</strong><br/>
              {selectedIncident.description}
            </div>
            
            <div style={{ padding: '12px', backgroundColor: 'rgba(59, 130, 246, 0.05)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', lineHeight: 1.5, borderLeft: '3px solid var(--primary-accent)' }}>
              <strong>Recommended Action:</strong><br/>
              {selectedIncident.action}
            </div>

            {/* Retraining Workflow Section */}
            {(selectedIncident.type === 'Data Drift' || selectedIncident.type === 'Model Performance') && (
              <div style={{ marginTop: '16px', borderTop: '1px dashed var(--border-light)', paddingTop: '16px' }}>
                <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}><Cpu size={18} /> Model Retraining Workflow</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Current Model</span><span style={{ fontWeight: 500 }}>XGBoost v1.0.0</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Target</span><span style={{ fontWeight: 500 }}>PM2.5 (1h/6h/24h)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Retraining Status</span>
                    <span style={{ fontWeight: 600, color: retrainingStatus === 'Completed' ? 'var(--status-good-text)' : retrainingStatus === 'In Progress' ? 'var(--primary-accent)' : 'var(--status-moderate-text)' }}>
                      {retrainingStatus}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={triggerRetraining} 
                  disabled={retrainingLoading || retrainingStatus === 'Completed'}
                  style={{ width: '100%', padding: '10px', backgroundColor: retrainingStatus === 'Completed' ? 'var(--status-good-bg)' : 'var(--primary-accent)', color: retrainingStatus === 'Completed' ? 'var(--status-good-text)' : 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: (retrainingLoading || retrainingStatus === 'Completed') ? 'not-allowed' : 'pointer' }}
                >
                  {retrainingLoading ? 'Retraining in Progress...' : retrainingStatus === 'Completed' ? 'Completed & Ready for Evaluation' : 'Start Retraining (Demo)'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Create Incident Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Create Incident</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Incident Type *</label>
                <select style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <option>Data Quality</option>
                  <option>Data Drift</option>
                  <option>Prediction Drift</option>
                  <option>Model Performance</option>
                  <option>Pipeline Failure</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Severity *</label>
                <select style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <option>Warning</option>
                  <option>Critical</option>
                  <option>Info</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Assigned To</label>
                <input type="text" placeholder="e.g. MLOps Team" style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '4px', fontWeight: 500 }}>Description *</label>
                <textarea rows={4} placeholder="Describe the incident..." style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '8px 16px', background: 'var(--primary-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 500 }}>Create Incident (Demo)</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Incidents;
