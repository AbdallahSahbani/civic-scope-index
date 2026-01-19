import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GeocoderResponse, GeocoderInput } from '@/lib/geocoderTypes';

interface UseGeocoderResult {
  data: GeocoderResponse | null;
  loading: boolean;
  error: string | null;
  lookupByAddress: (address: string, zipcode: string) => Promise<GeocoderResponse | null>;
  lookupByCoordinates: (lat: number, lon: number) => Promise<GeocoderResponse | null>;
  lookupByBrowserLocation: () => Promise<GeocoderResponse | null>;
  reset: () => void;
}

export function useGeocoder(): UseGeocoderResult {
  const [data, setData] = useState<GeocoderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGeocoder = useCallback(async (input: GeocoderInput): Promise<GeocoderResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      // Build query params
      const params = new URLSearchParams();
      if (input.address && input.zipcode) {
        params.set('address', input.address);
        params.set('zipcode', input.zipcode);
      } else if (input.lat !== undefined && input.lon !== undefined) {
        params.set('lat', input.lat.toString());
        params.set('lon', input.lon.toString());
      } else {
        throw new Error('Either address+zipcode or lat+lon is required');
      }

      const { data: responseData, error: fetchError } = await supabase.functions.invoke('geocoder', {
        body: null,
        // Pass as query params via headers workaround
      });

      // Alternative: call directly with query string
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geocoder?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const result = await response.json() as GeocoderResponse;

      if (!result.success) {
        throw new Error(result.error || 'Geocoder lookup failed');
      }

      setData(result);
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lookup location';
      setError(errorMessage);
      console.error('Geocoder error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupByAddress = useCallback(async (address: string, zipcode: string) => {
    return fetchGeocoder({ address, zipcode });
  }, [fetchGeocoder]);

  const lookupByCoordinates = useCallback(async (lat: number, lon: number) => {
    return fetchGeocoder({ lat, lon });
  }, [fetchGeocoder]);

  const lookupByBrowserLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise<GeocoderResponse | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const result = await fetchGeocoder({ lat: latitude, lon: longitude });
          resolve(result);
        },
        (geoError) => {
          setLoading(false);
          let errorMessage = 'Failed to get your location';
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case geoError.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable.';
              break;
            case geoError.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          setError(errorMessage);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    });
  }, [fetchGeocoder]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    lookupByAddress,
    lookupByCoordinates,
    lookupByBrowserLocation,
    reset,
  };
}
