import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUSAOnly, createGeoBlockedResponse, sanitizeString } from "../_shared/geo-restrict.ts";

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

async function fetchMemberVotes(bioguideId: string, apiKey: string) {
  try {
    console.log(`Fetching cosponsored legislation for ${bioguideId}...`);
    
    // Get member's cosponsored legislation
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
    console.error('Error fetching cosponsored legislation:', error);
    return [];
  }
}

// State name to abbreviation map for FEC API (requires 2-letter codes)
const STATE_ABBREV: Record<string, string> = {
  'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
  'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
  'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
  'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
  'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
  'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
  'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
  'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY',
  'district of columbia': 'DC', 'puerto rico': 'PR', 'guam': 'GU', 'virgin islands': 'VI',
  'american samoa': 'AS', 'northern mariana islands': 'MP',
};

function getStateAbbrev(state: string): string {
  if (!state) return '';
  // Already an abbreviation
  if (state.length === 2) return state.toUpperCase();
  // Look up full name
  return STATE_ABBREV[state.toLowerCase()] || state;
}

/**
 * FEC Two-Step Resolution:
 * Step 1: Search by name + state + office to get FEC candidate_id
 * Step 2: Use candidate_id to fetch campaign finance data
 * 
 * IMPORTANT: FEC does NOT use bioguide IDs - they have their own identity system
 * IMPORTANT: FEC requires 2-letter state codes, not full state names
 */
async function fetchFECData(name: string, state: string, chamber: string, apiKey: string) {
  try {
    // Convert state to 2-letter abbreviation (FEC requires this)
    const stateAbbrev = getStateAbbrev(state);
    if (!stateAbbrev) {
      console.log(`FEC: Cannot resolve state abbreviation for "${state}"`);
      return null;
    }
    
    // Step 1: Resolve name → FEC candidate_id
    // FEC uses 'H' for House, 'S' for Senate
    const office = chamber.toLowerCase().includes('house') || chamber.toLowerCase().includes('representative') 
      ? 'H' 
      : 'S';
    
    // Clean name for search - FEC stores names differently
    // Convert "LastName, FirstName" to "FirstName LastName" for better matching
    let searchName = name;
    if (name.includes(',')) {
      const parts = name.split(',').map(p => p.trim());
      searchName = `${parts[1]} ${parts[0]}`.replace(/\s+/g, ' ').trim();
    }
    // Also try just last name for better matching
    const lastName = name.includes(',') ? name.split(',')[0].trim() : name.split(' ').pop() || name;
    
    const searchUrl = new URL(`${FEC_BASE}/candidates/search/`);
    searchUrl.searchParams.set('api_key', apiKey);
    searchUrl.searchParams.set('name', searchName);
    searchUrl.searchParams.set('state', stateAbbrev);
    searchUrl.searchParams.set('office', office);
    searchUrl.searchParams.set('is_active_candidate', 'true');
    searchUrl.searchParams.set('per_page', '5');
    searchUrl.searchParams.set('sort', '-election_years');
    
    console.log(`FEC Step 1: Searching for candidate "${searchName}" (${stateAbbrev}, ${office})...`);
    let searchRes = await fetch(searchUrl.toString());
    
    if (!searchRes.ok) {
      console.error(`FEC search error: ${searchRes.status}`);
      return null;
    }
    
    let searchData = await searchRes.json();
    let candidate = searchData.results?.[0];
    
    // If no result, try with just last name
    if (!candidate?.candidate_id && lastName !== searchName) {
      console.log(`FEC: No result for "${searchName}", trying last name "${lastName}"...`);
      searchUrl.searchParams.set('name', lastName);
      searchRes = await fetch(searchUrl.toString());
      if (searchRes.ok) {
        searchData = await searchRes.json();
        candidate = searchData.results?.[0];
      }
    }
    
    if (!candidate?.candidate_id) {
      console.log(`FEC: No candidate found for "${searchName}" or "${lastName}" in ${stateAbbrev}`);
      return null;
    }
    
    console.log(`FEC Step 1 Success: Found candidate_id ${candidate.candidate_id}`);
    
    // Get election cycles to determine which cycle to fetch totals for
    const electionYears = candidate.election_years || candidate.cycles || [];
    const mostRecentCycle = electionYears.length > 0 
      ? Math.max(...electionYears.filter((y: number) => y <= new Date().getFullYear() + 2))
      : new Date().getFullYear();
    
    // Step 2: Get campaign finance totals using candidate/{id}/totals/ endpoint
    // This endpoint is more reliable than /candidates/totals/
    const totalsUrl = new URL(`${FEC_BASE}/candidate/${candidate.candidate_id}/totals/`);
    totalsUrl.searchParams.set('api_key', apiKey);
    totalsUrl.searchParams.set('cycle', mostRecentCycle.toString());
    totalsUrl.searchParams.set('per_page', '1');
    
    console.log(`FEC Step 2: Fetching totals for ${candidate.candidate_id} (cycle ${mostRecentCycle})...`);
    const totalsRes = await fetch(totalsUrl.toString());
    
    let totals = null;
    if (totalsRes.ok) {
      const totalsData = await totalsRes.json();
      totals = totalsData.results?.[0] || null;
      console.log(`FEC Step 2 Result: receipts=${totals?.receipts}, disbursements=${totals?.disbursements}`);
    } else {
      console.log(`FEC Step 2: Totals fetch returned ${totalsRes.status}`);
    }
    
    // If no totals for most recent cycle, try without cycle filter
    if (!totals?.receipts && !totals?.disbursements) {
      console.log(`FEC: No totals for cycle ${mostRecentCycle}, fetching all-time...`);
      const allTimeUrl = new URL(`${FEC_BASE}/candidate/${candidate.candidate_id}/totals/`);
      allTimeUrl.searchParams.set('api_key', apiKey);
      allTimeUrl.searchParams.set('per_page', '1');
      allTimeUrl.searchParams.set('sort', '-cycle');
      
      const allTimeRes = await fetch(allTimeUrl.toString());
      if (allTimeRes.ok) {
        const allTimeData = await allTimeRes.json();
        totals = allTimeData.results?.[0] || null;
        console.log(`FEC: All-time totals: receipts=${totals?.receipts}`);
      }
    }
    
    // Return combined data
    return {
      candidate_id: candidate.candidate_id,
      name: candidate.name,
      party: candidate.party,
      office: candidate.office_full,
      office_code: candidate.office,
      state: candidate.state,
      district: candidate.district,
      cycles: electionYears,
      incumbent_challenge: candidate.incumbent_challenge_full,
      // Financial totals (if available)
      receipts: totals?.receipts || null,
      disbursements: totals?.disbursements || null,
      cash_on_hand: totals?.cash_on_hand_end_period || null,
      debts: totals?.debts_owed_by_committee || null,
      individual_contributions: totals?.individual_contributions || null,
      pac_contributions: totals?.other_political_committee_contributions || null,
      party_contributions: totals?.political_party_committee_contributions || null,
      federal_funds: totals?.federal_funds || null,
      coverage_start_date: totals?.coverage_start_date || null,
      coverage_end_date: totals?.coverage_end_date || null,
      cycle: totals?.cycle || mostRecentCycle,
    };
  } catch (error) {
    console.error('Error in FEC two-step resolution:', error);
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
    const entityChamber = sanitizeString(url.searchParams.get('chamber') || 'Senate', 50);

    if (!bioguideId) {
      return new Response(
        JSON.stringify({ error: 'Missing bioguide parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate bioguide ID length
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

    // First, fetch member details to get accurate role/chamber info
    const member = await fetchMemberDetails(bioguideId, congressApiKey);
    
    // Determine chamber from member data or fallback to passed value
    const resolvedChamber = member?.terms?.[member.terms.length - 1]?.chamber || entityChamber;

    // Fetch remaining data in parallel
    const [bills, votes, funding, quotes] = await Promise.all([
      fetchSponsoredBills(bioguideId, congressApiKey),
      fetchMemberVotes(bioguideId, congressApiKey),
      // Use two-step FEC resolution with name + state + chamber
      entityName && entityState && fecApiKey 
        ? fetchFECData(entityName, entityState, resolvedChamber, fecApiKey)
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
        ...(funding ? ['Federal Election Commission (FEC)'] : []),
        ...(quotes.length > 0 ? ['GovInfo Congressional Record'] : []),
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
