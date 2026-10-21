import { useState, useEffect, useCallback } from 'react';
import { getCities } from '../services/api';

export const useCities = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCities();
      // Backend returns { cities: [...] }; mock returns array directly
      setData(Array.isArray(result) ? result : (result?.cities ?? []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
};
