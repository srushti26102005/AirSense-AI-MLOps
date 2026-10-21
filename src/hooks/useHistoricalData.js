import { useState, useEffect, useCallback } from 'react';
import { getHistoricalData } from '../services/api';

export const useHistoricalData = (stationId, pollutant = 'PM2.5', timeRange = '24h') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!stationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getHistoricalData(stationId, pollutant, timeRange);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stationId, pollutant, timeRange]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
