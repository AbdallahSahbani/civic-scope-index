import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUSAOnly, createGeoBlockedResponse, sanitizeString, validateBioguideId, validateState } from "../_shared/geo-restrict.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CONGRESS_BASE = 'https://api.congress.gov/v3';
const FEC_BASE = 'https://api.open.fec.gov/v1';
const GOVINFO_BASE = 'https://api.govinfo.gov';

interface EntityDetailResponse {
  member: any;
  bills: any[];
  votes: any[];
  funding: any;
  quotes: any[];
  sources: string[];
}

async function fetchMemberDetails(bioguideId: string, apiKey: string) {
  try {
    const url = new URL(`${CONGRESS_BASE}/member/${bioguideId}`);
    url.searchParams.set('api_key', apiKey);
    
    console.log(`Fetching member details for ${bioguideId}...`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`Member details error: ${res.status}`);
      return null;
    }
    
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
    
    console.log(`Fetching sponsored bills for ${bioguideId}...`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`Bills error: ${res.status}`);
      return [];
    }
    
    const data = await res.json();
    return data.sponsoredLegislation || [];
  } catch (error) {
    console.error('Error fetching sponsored bills:', error);
    return [];
  }
}

async function fetchMemberVotes(bioguideId: string, apiKey: string, chamber: string) {
  try {
    // Congress.gov doesn't have direct member votes endpoint, so we fetch recent roll call votes
    // and note which ones the member participated in
    const currentCongress = 118; // Current congress
    const url = new URL(`${CONGRESS_BASE}/member/${bioguideId}`);
    url.searchParams.set('api_key', apiKey);
    
    console.log(`Fetching votes for ${bioguideId}...`);
    
    // Get member's voting record via their cosponsored legislation as a proxy
    const cosponsoredUrl = new URL(`${CONGRESS_BASE}/member/${bioguideId}/cosponsored-legislation`);
    cosponsoredUrl.searchParams.set('api_key', apiKey);
    cosponsoredUrl.searchParams.set('limit', '15');
    
    const res = await fetch(cosponsoredUrl.toString());
    if (!res.ok) return [];
    
    const data = await res.json();
    
    // Transform cosponsored legislation into vote-like records
    return (data.cosponsoredLegislation || []).map((item: any) => ({
      type: 'cosponsored',
      billNumber: `${item.type}${item.number}`,
      title: item.title,
      congress: item.congress,
      latestAction: item.latestAction,
      url: item.url,
    }));
  } catch (error) {
    console.error('Error fetching votes:', error);
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
    
    console.log(`Fetching FEC data for ${name} (${state})...`);
    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error(`FEC error: ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    return data.results?.[0] || null;
  } catch (error) {
    console.error('Error fetching FEC data:', error);
    return null;
  }
}

async function fetchCongressionalRecordQuotes(memberName: string, apiKey: string) {
  try {
    // GovInfo API uses POST for search
    const searchUrl = `${GOVINFO_BASE}/search?api_key=${apiKey}`;
    
    // Clean name for search (remove comma formatting)
    const cleanName = memberName.replace(',', '').trim();
    
    console.log(`Fetching Congressional Record quotes for ${cleanName}...`);
    
    const res = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: cleanName,
        pageSize: 10,
        offsetMark: '*',
        sorts: [
          { field: 'dateIssued', sortOrder: 'DESC' }
        ],
        filters: [
          { field: 'collectionCode', value: 'CREC' }
        ]
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`GovInfo error: ${res.status} - ${errorText}`);
      return [];
    }
    
    const data = await res.json();
    
    return (data.results || []).map((item: any) => ({
      title: item.title,
      dateIssued: item.dateIssued,
      packageId: item.packageId,
      granuleId: item.granuleId,
      url: `https://www.govinfo.gov/app/details/${item.packageId}`,
      collectionCode: item.collectionCode,
    }));
  } catch (error) {
    console.error('Error fetching Congressional Record:', error);
    return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // USA-only geo-restriction
  const geoCheck = checkUSAOnly(req);
  if (!geoCheck.allowed) {
    return createGeoBlockedResponse(corsHeaders);
  }

  try {
    const url = new URL(req.url);
    const bioguideId = sanitizeString(url.searchParams.get('bioguide') || '', 20);
    const entityName = sanitizeString(url.searchParams.get('name') || '', 200);
    const entityState = sanitizeString(url.searchParams.get('state') || '', 50);

    if (!bioguideId) {
      return new Response(
        JSON.stringify({ error: 'Missing bioguide parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate bioguide ID format (relaxed for OpenStates IDs)
    if (bioguideId.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Invalid bioguide parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const congressApiKey = Deno.env.get('CONGRESS_API_KEY');
    const fecApiKey = Deno.env.get('FEC_API_KEY');
    const govInfoApiKey = Deno.env.get('GOVINFO_API_KEY');

    if (!congressApiKey) {
      return new Response(
        JSON.stringify({ error: 'Congress API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch all data in parallel
    const [member, bills, votes, funding, quotes] = await Promise.all([
      fetchMemberDetails(bioguideId, congressApiKey),
      fetchSponsoredBills(bioguideId, congressApiKey),
      fetchMemberVotes(bioguideId, congressApiKey, ''),
      entityName && entityState && fecApiKey 
        ? fetchFECData(entityName, entityState, fecApiKey)
        : Promise.resolve(null),
      entityName && govInfoApiKey
        ? fetchCongressionalRecordQuotes(entityName, govInfoApiKey)
        : Promise.resolve([]),
    ]);

    console.log(`Fetched: member=${!!member}, bills=${bills.length}, votes=${votes.length}, funding=${!!funding}, quotes=${quotes.length}`);

    const response: EntityDetailResponse = {
      member,
      bills,
      votes,
      funding,
      quotes,
      sources: [
        'Congress.gov',
        'Federal Election Commission',
        'GovInfo Congressional Record',
      ],
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
