import { useState, useEffect, useCallback } from 'react';
import { getStations } from '../services/api';

export const useStations = (cityParam) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStations(cityParam);
      // Backend returns { stations: [...] }; mock returns array directly
      setData(Array.isArray(result) ? result : (result?.stations ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cityParam]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
