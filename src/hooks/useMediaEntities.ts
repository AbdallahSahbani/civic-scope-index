import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MediaEntity, MediaFilters, MediaPlatform } from '@/lib/mediaTypes';

interface UseMediaEntitiesOptions {
  filters: MediaFilters;
  limit?: number;
  offset?: number;
}

export function useMediaEntities({ filters, limit = 50, offset = 0 }: UseMediaEntitiesOptions) {
  return useQuery({
    queryKey: ['media-entities', filters, limit, offset],
    queryFn: async () => {
      let query = supabase
        .from('media_entities')
        .select('*')
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.entityType !== 'all') {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.platforms.length > 0) {
        query = query.overlaps('primary_platforms', filters.platforms);
      }

      if (filters.audienceBand !== 'all') {
        query = query.eq('audience_size_band', filters.audienceBand);
      }

      if (filters.activeStatus !== 'all') {
        query = query.eq('active_status', filters.activeStatus === 'active');
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Transform to match our interface (handle platform array type)
      return (data || []).map(entity => ({
        ...entity,
        primary_platforms: (entity.primary_platforms || []) as MediaPlatform[],
      })) as MediaEntity[];
    },
  });
}

export function useMediaEntity(id: string | undefined) {
  return useQuery({
    queryKey: ['media-entity', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('media_entities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw new Error(error.message);
      }

      return {
        ...data,
        primary_platforms: (data.primary_platforms || []) as MediaPlatform[],
      } as MediaEntity;
    },
    enabled: !!id,
  });
}

export function useMediaEntityFilings(entityId: string | undefined) {
  return useQuery({
    queryKey: ['media-entity-filings', entityId],
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('media_public_filings')
        .select('*')
        .eq('entity_id', entityId)
        .order('filing_date', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!entityId,
  });
}

export function useMediaEntityLegalRecords(entityId: string | undefined) {
  return useQuery({
    queryKey: ['media-entity-legal', entityId],
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('media_legal_records')
        .select('*')
        .eq('entity_id', entityId)
        .order('record_date', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!entityId,
  });
}

export function useMediaEntityPlatforms(entityId: string | undefined) {
  return useQuery({
    queryKey: ['media-entity-platforms', entityId],
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('media_platform_verifications')
        .select('*')
        .eq('entity_id', entityId)
        .order('verified_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!entityId,
  });
}

export function useMediaEntityAffiliations(entityId: string | undefined) {
  return useQuery({
    queryKey: ['media-entity-affiliations', entityId],
    queryFn: async () => {
      if (!entityId) return [];

      // Get affiliations where this entity is the person
      const { data: asPersonData, error: asPersonError } = await supabase
        .from('media_affiliations')
        .select(`
          *,
          organization:organization_id(id, name, entity_type, logo_url)
        `)
        .eq('person_id', entityId);

      // Get affiliations where this entity is the organization
      const { data: asOrgData, error: asOrgError } = await supabase
        .from('media_affiliations')
        .select(`
          *,
          person:person_id(id, name, entity_type, logo_url)
        `)
        .eq('organization_id', entityId);

      if (asPersonError) throw new Error(asPersonError.message);
      if (asOrgError) throw new Error(asOrgError.message);

      return {
        asEmployee: asPersonData || [],
        asEmployer: asOrgData || [],
      };
    },
    enabled: !!entityId,
  });
}

export function useMediaEntitySources(entityId: string | undefined) {
  return useQuery({
    queryKey: ['media-entity-sources', entityId],
    queryFn: async () => {
      if (!entityId) return [];

      const { data, error } = await supabase
        .from('media_entity_sources')
        .select(`
          *,
          source:source_id(*)
        `)
        .eq('entity_id', entityId);

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!entityId,
  });
}
