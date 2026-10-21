import { useState, useEffect, useCallback } from 'react';
import { getWeather } from '../services/api';

export const useWeather = (stationId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!stationId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getWeather(stationId);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
