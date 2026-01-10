import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// API Base URLs
const CONGRESS_BASE = 'https://api.congress.gov/v3';
const OPENSTATES_BASE = 'https://v3.openstates.org';

interface RosterEntity {
  id: string;
  name: string;
  role: string;
  chamber: 'Federal' | 'State';
  party: string;
  state: string;
  district?: string;
  source: 'congress' | 'openstates';
  bioguideId?: string;
}

async function fetchCongressMembers(apiKey: string): Promise<RosterEntity[]> {
  try {
    const url = new URL(`${CONGRESS_BASE}/member`);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('limit', '250');
    url.searchParams.set('currentMember', 'true');

    console.log('Fetching Congress members...');
    const res = await fetch(url.toString());
    
    if (!res.ok) {
      console.error(`Congress API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    
    if (!data.members || !Array.isArray(data.members)) {
      console.error('Invalid Congress API response structure');
      return [];
    }

    return data.members.map((m: any) => ({
      id: m.bioguideId || `congress-${m.name}`,
      name: m.name || 'Unknown',
      role: m.terms?.[0]?.chamber === 'House of Representatives' ? 'U.S. Representative' : 'U.S. Senator',
      chamber: 'Federal' as const,
      party: m.partyName || m.party || 'Unknown',
      state: m.state || 'Unknown',
      district: m.district?.toString(),
      source: 'congress' as const,
      bioguideId: m.bioguideId,
    }));
  } catch (error) {
    console.error('Error fetching Congress members:', error);
    return [];
  }
}

async function fetchOpenStatesLegislators(apiKey: string): Promise<RosterEntity[]> {
  try {
    console.log('Fetching OpenStates legislators...');
    const res = await fetch(`${OPENSTATES_BASE}/people?per_page=50`, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!res.ok) {
      console.error(`OpenStates API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      console.error('Invalid OpenStates API response structure');
      return [];
    }

    return data.results.map((p: any) => ({
      id: p.id || `openstates-${p.name}`,
      name: p.name || 'Unknown',
      role: p.current_role?.title || 'State Official',
      chamber: 'State' as const,
      party: p.party || 'Unknown',
      state: p.jurisdiction?.name || 'Unknown',
      district: p.current_role?.district,
      source: 'openstates' as const,
    }));
  } catch (error) {
    console.error('Error fetching OpenStates legislators:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const congressApiKey = Deno.env.get('CONGRESS_API_KEY');
    const openStatesApiKey = Deno.env.get('OPENSTATES_API_KEY');

    if (!congressApiKey || !openStatesApiKey) {
      console.error('Missing API keys');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch from both sources in parallel
    const [federalEntities, stateEntities] = await Promise.all([
      fetchCongressMembers(congressApiKey),
      fetchOpenStatesLegislators(openStatesApiKey),
    ]);

    const entities = [...federalEntities, ...stateEntities];

    console.log(`Fetched ${federalEntities.length} federal + ${stateEntities.length} state = ${entities.length} total entities`);

    return new Response(
      JSON.stringify({
        updatedAt: new Date().toISOString(),
        count: entities.length,
        entities,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Roster API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch roster data' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
