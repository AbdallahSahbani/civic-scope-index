import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CONGRESS_BASE = 'https://api.congress.gov/v3';
const FEC_BASE = 'https://api.open.fec.gov/v1';

interface EntityDetailResponse {
  member: any;
  bills: any[];
  funding: any;
  source: string;
}

async function fetchMemberDetails(bioguideId: string, apiKey: string) {
  try {
    const url = new URL(`${CONGRESS_BASE}/member/${bioguideId}`);
    url.searchParams.set('api_key', apiKey);
    
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.member || null;
  } catch (error) {
    console.error('Error fetching member details:', error);
    return null;
  }
}

async function fetchSponsoredBills(bioguideId: string, apiKey: string) {
  try {
    const url = new URL(`${CONGRESS_BASE}/member/${bioguideId}/sponsored-legislation`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('limit', '20');
    
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    
    const data = await res.json();
    return data.sponsoredLegislation || [];
  } catch (error) {
    console.error('Error fetching sponsored bills:', error);
    return [];
  }
}

async function fetchFECData(name: string, state: string, apiKey: string) {
  try {
    const url = new URL(`${FEC_BASE}/candidates/search/`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('name', name);
    url.searchParams.set('state', state);
    url.searchParams.set('per_page', '5');
    
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    
    const data = await res.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error('Error fetching FEC data:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const bioguideId = url.searchParams.get('bioguide');
    const entityName = url.searchParams.get('name');
    const entityState = url.searchParams.get('state');

    if (!bioguideId) {
      return new Response(
        JSON.stringify({ error: 'Missing bioguide parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const congressApiKey = Deno.env.get('CONGRESS_API_KEY');
    const fecApiKey = Deno.env.get('FEC_API_KEY');

    if (!congressApiKey) {
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all data in parallel
    const [member, bills, funding] = await Promise.all([
      fetchMemberDetails(bioguideId, congressApiKey),
      fetchSponsoredBills(bioguideId, congressApiKey),
      entityName && entityState && fecApiKey 
        ? fetchFECData(entityName, entityState, fecApiKey)
        : Promise.resolve(null),
    ]);

    const response: EntityDetailResponse = {
      member,
      bills,
      funding,
      source: 'congress.gov',
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Entity data API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch entity data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
