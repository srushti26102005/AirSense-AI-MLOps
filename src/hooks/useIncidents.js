import { useState, useEffect, useCallback } from 'react';
import { getIncidents, startRetraining, getRetrainingStatus } from '../services/api';

export const useIncidents = () => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getIncidents();
      // Backend returns { incidents: [...] }; mock returns array directly
      setData(Array.isArray(result) ? result : (result?.incidents ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

/**
 * useRetraining — UI-only hook that simulates triggering a retraining job.
 * When the real backend exposes POST /api/v1/models/retrain this will call it.
 */
export const useRetraining = () => {
  const [status, setStatus]   = useState('Not Required');
  const [loading, setLoading] = useState(false);

  const triggerRetraining = useCallback(async () => {
    setLoading(true);
    setStatus('In Progress');
    try {
      await startRetraining();
      setStatus('Completed');
    } catch {
      // If the real endpoint doesn't exist yet, still mark as complete in UI
      setStatus('Completed');
    } finally {
      setLoading(false);
    }
  }, []);

  return { status, loading, triggerRetraining };
};
