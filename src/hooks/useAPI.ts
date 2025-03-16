import { handleRequest } from '@/lib/api';
import { useState, useEffect } from 'react';

export const useAPI = <D>(method: string, path: string, body?: BodyInit, headers: object = {}) => {
  const [data, setData] = useState<D | null>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await handleRequest<D>(method, path, body, headers);
      setLoading(false);

      if (response.err) {
        setError(response.err);
      } else {
        setData(response.data);
      }
    };

    fetchData();
  }, [path]); // Re-run when any dependency changes

  return { data, error, loading };
};