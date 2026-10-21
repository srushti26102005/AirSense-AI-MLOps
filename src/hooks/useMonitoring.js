import { useState, useEffect, useCallback } from 'react';
import {
  getMonitoringMetrics,
  getDataQuality,
  getModelPerformance,
  getDriftData,
} from '../services/api';

const makeHook = (apiFn) => () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export const useMonitoringOverview  = makeHook(getMonitoringMetrics);
export const useDataQuality         = makeHook(getDataQuality);
export const useModelPerformance    = makeHook(getModelPerformance);
export const useDriftDetection      = makeHook(getDriftData);
