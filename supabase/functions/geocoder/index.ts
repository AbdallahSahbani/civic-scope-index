import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUSAOnly, createGeoBlockedResponse } from "../_shared/geo-restrict.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const USGEOCODER_BASE = 'https://api.usgeocoder.com/api/get_info.php';

// Parsed response structure for jurisdiction data
export interface GeocoderResponse {
  success: boolean;
  error?: string;
  location: {
    address: string;
    city: string;
    state: string;
    stateAbbr: string;
    zipCode: string;
    county: string;
    latitude: number;
    longitude: number;
  } | null;
  congressional: {
    districtName: string;
    districtId: string;
    state: string;
  } | null;
  representatives: Official[];
  stateOfficials: Official[];
  localInfo: {
    votingDistrict?: string;
    schoolDistrict?: string;
    stateFips?: string;
    countyFips?: string;
  } | null;
  rawResponse?: Record<string, unknown>;
}

export interface Official {
  name: string;
  title: string;
  party?: string;
  chamber?: string;
  district?: string;
  contactUrl?: string;
  email?: string;
  phone?: string;
  level: 'federal' | 'state' | 'local';
}

// Parse API response into clean structured data
function parseGeocoderResponse(data: Record<string, unknown>): GeocoderResponse {
  const response: GeocoderResponse = {
    success: true,
    location: null,
    congressional: null,
    representatives: [],
    stateOfficials: [],
    localInfo: null,
  };

  // Check for errors
  if (data.request_status_code !== 200 && data.request_status_code !== '200') {
    return {
      success: false,
      error: data.request_status_message as string || 'Geocoder API error',
      location: null,
      congressional: null,
      representatives: [],
      stateOfficials: [],
      localInfo: null,
    };
  }

  // Parse location info
  if (data.street_address || data.city || data.state) {
    response.location = {
      address: data.street_address as string || '',
      city: data.city as string || '',
      state: data.state as string || '',
      stateAbbr: data.state_abbr as string || data.state as string || '',
      zipCode: data.zipcode as string || '',
      county: data.county as string || '',
      latitude: parseFloat(data.lat as string) || 0,
      longitude: parseFloat(data.lon as string) || 0,
    };
  }

  // Parse congressional district
  if (data.congressional_district_name || data.congressional_district_id) {
    response.congressional = {
      districtName: data.congressional_district_name as string || '',
      districtId: data.congressional_district_id as string || '',
      state: data.state_abbr as string || data.state as string || '',
    };
  }

  // Parse federal representatives
  const representatives: Official[] = [];

  // House Representative
  if (data.house_representative_name) {
    representatives.push({
      name: data.house_representative_name as string,
      title: 'U.S. Representative',
      party: data.house_representative_party as string,
      chamber: 'House',
      district: data.congressional_district_id as string,
      contactUrl: data.house_representative_contact_url as string,
      email: data.house_representative_email as string,
      phone: data.house_representative_phone as string,
      level: 'federal',
    });
  }

  // Senators (may have multiple)
  const senatorCount = parseInt(data.senator_count as string) || 0;
  for (let i = 1; i <= Math.max(senatorCount, 2); i++) {
    const senatorName = data[`senator_${i}_name`] as string;
    if (senatorName) {
      representatives.push({
        name: senatorName,
        title: 'U.S. Senator',
        party: data[`senator_${i}_party`] as string,
        chamber: 'Senate',
        contactUrl: data[`senator_${i}_contact_url`] as string,
        email: data[`senator_${i}_email`] as string,
        phone: data[`senator_${i}_phone`] as string,
        level: 'federal',
      });
    }
  }

  response.representatives = representatives;

  // Parse state officials
  const stateOfficials: Official[] = [];

  // Governor
  if (data.governor_name) {
    stateOfficials.push({
      name: data.governor_name as string,
      title: 'Governor',
      party: data.governor_party as string,
      contactUrl: data.governor_contact_url as string,
      level: 'state',
    });
  }

  // Lieutenant Governor
  if (data.lt_governor_name) {
    stateOfficials.push({
      name: data.lt_governor_name as string,
      title: 'Lieutenant Governor',
      party: data.lt_governor_party as string,
      level: 'state',
    });
  }

  // Attorney General
  if (data.attorney_general_name) {
    stateOfficials.push({
      name: data.attorney_general_name as string,
      title: 'Attorney General',
      party: data.attorney_general_party as string,
      level: 'state',
    });
  }

  // Secretary of State
  if (data.secretary_of_state_name) {
    stateOfficials.push({
      name: data.secretary_of_state_name as string,
      title: 'Secretary of State',
      party: data.secretary_of_state_party as string,
      level: 'state',
    });
  }

  // State legislators
  const stateLegCount = parseInt(data.state_legislator_count as string) || 0;
  for (let i = 1; i <= stateLegCount; i++) {
    const legName = data[`state_legislator_${i}_name`] as string;
    if (legName) {
      stateOfficials.push({
        name: legName,
        title: data[`state_legislator_${i}_title`] as string || 'State Legislator',
        party: data[`state_legislator_${i}_party`] as string,
        chamber: data[`state_legislator_${i}_chamber`] as string,
        district: data[`state_legislator_${i}_district`] as string,
        level: 'state',
      });
    }
  }

  response.stateOfficials = stateOfficials;

  // Parse local/district info
  response.localInfo = {
    votingDistrict: data.voting_district as string,
    schoolDistrict: data.school_district as string,
    stateFips: data.state_fips as string,
    countyFips: data.county_fips as string,
  };

  return response;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Geo-restriction check
  const geoCheck = checkUSAOnly(req);
  if (!geoCheck.allowed) {
    return createGeoBlockedResponse(corsHeaders);
  }

  try {
    const url = new URL(req.url);
    const address = url.searchParams.get('address');
    const zipcode = url.searchParams.get('zipcode');
    const lat = url.searchParams.get('lat');
    const lon = url.searchParams.get('lon');

    // Validate input - need either address+zip or lat+lon
    const hasAddress = address && zipcode;
    const hasCoords = lat && lon;

    if (!hasAddress && !hasCoords) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Either address+zipcode or lat+lon is required',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Input validation - sanitize inputs
    const sanitize = (str: string | null) => str?.replace(/[<>'"]/g, '').trim().slice(0, 200);

    const USGEOCODER_API_KEY = Deno.env.get('USGEOCODER_API_KEY');
    if (!USGEOCODER_API_KEY) {
      console.error('USGEOCODER_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Geocoder service not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build API URL
    const apiParams = new URLSearchParams({
      authkey: USGEOCODER_API_KEY,
      format: 'json',
    });

    if (hasAddress) {
      apiParams.set('address', sanitize(address) || '');
      apiParams.set('zipcode', sanitize(zipcode) || '');
    } else if (hasCoords) {
      // Validate coordinates
      const latitude = parseFloat(lat!);
      const longitude = parseFloat(lon!);
      
      if (isNaN(latitude) || isNaN(longitude) || 
          latitude < 24 || latitude > 72 || 
          longitude < -180 || longitude > -65) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid coordinates for US location',
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      apiParams.set('lat', latitude.toString());
      apiParams.set('lon', longitude.toString());
    }

    const apiUrl = `${USGEOCODER_BASE}?${apiParams.toString()}`;
    console.log('Calling USGeocoder API');

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('USGeocoder API error:', response.status, errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `Geocoder API returned ${response.status}: ${errorText.slice(0, 200)}`,
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('USGeocoder response status:', data.request_status_code, data.request_status_message);
    
    // Parse and structure the response
    const parsed = parseGeocoderResponse(data);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Geocoder error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
