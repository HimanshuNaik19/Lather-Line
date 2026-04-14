import { useState, useEffect } from 'react';
import { axiosClient } from '@/api/axiosClient';

export interface Business {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await axiosClient.get<Business[]>('/businesses');
        setBusinesses(response.data);
      } catch (err: unknown) {
        setError('Failed to load available businesses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  return { businesses, loading, error };
}
