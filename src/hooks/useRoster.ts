import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RosterEntity, RosterResponse } from '@/lib/schemas';

interface UseRosterOptions {
  search?: string;
  chamber?: 'all' | 'Federal' | 'State';
  state?: string;
  party?: string;
}

interface UseRosterResult {
  entities: RosterEntity[];
  loading: boolean;
  error: string | null;
  updatedAt: string | null;
  totalCount: number;
  refetch: () => void;
}

export function useRoster(options: UseRosterOptions = {}): UseRosterResult {
  const [entities, setEntities] = useState<RosterEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.functions.invoke('roster');

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const response = data as RosterResponse;
      
      // Apply client-side filters
      let filtered = response.entities || [];

      // Search filter
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        filtered = filtered.filter(entity =>
          entity.name.toLowerCase().includes(searchLower) ||
          entity.role.toLowerCase().includes(searchLower) ||
          entity.party.toLowerCase().includes(searchLower) ||
          entity.state.toLowerCase().includes(searchLower)
        );
      }

      // Chamber filter
      if (options.chamber && options.chamber !== 'all') {
        filtered = filtered.filter(entity => entity.chamber === options.chamber);
      }

      // State filter
      if (options.state && options.state !== 'ALL') {
        filtered = filtered.filter(entity => 
          entity.state === options.state || 
          entity.state.includes(options.state)
        );
      }

      // Party filter
      if (options.party && options.party !== 'all') {
        filtered = filtered.filter(entity =>
          entity.party.toLowerCase().includes(options.party!.toLowerCase())
        );
      }

      setEntities(filtered);
      setUpdatedAt(response.updatedAt);
    } catch (err) {
      console.error('Error fetching roster:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roster data');
      setEntities([]);
    } finally {
      setLoading(false);
    }
  }, [options.search, options.chamber, options.state, options.party]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  return {
    entities,
    loading,
    error,
    updatedAt,
    totalCount: entities.length,
    refetch: fetchRoster,
  };
}
