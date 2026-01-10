import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUSAOnly, createGeoBlockedResponse } from "../_shared/geo-restrict.ts";

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
  chamber: 'Federal' | 'State' | 'Executive' | 'Local';
  party: string;
  state: string;
  district?: string;
  city?: string;
  source: 'congress' | 'openstates' | 'curated';
  bioguideId?: string;
  photoUrl?: string;
}

// Curated list of major US city mayors (top 50 cities by population)
const MAJOR_CITY_MAYORS: RosterEntity[] = [
  { id: 'mayor-nyc', name: 'Eric Adams', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NY', city: 'New York City', source: 'curated' },
  { id: 'mayor-la', name: 'Karen Bass', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'Los Angeles', source: 'curated' },
  { id: 'mayor-chicago', name: 'Brandon Johnson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'IL', city: 'Chicago', source: 'curated' },
  { id: 'mayor-houston', name: 'John Whitmire', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TX', city: 'Houston', source: 'curated' },
  { id: 'mayor-phoenix', name: 'Kate Gallego', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'AZ', city: 'Phoenix', source: 'curated' },
  { id: 'mayor-philadelphia', name: 'Cherelle Parker', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'PA', city: 'Philadelphia', source: 'curated' },
  { id: 'mayor-san-antonio', name: 'Ron Nirenberg', role: 'Mayor', chamber: 'Local', party: 'Independent', state: 'TX', city: 'San Antonio', source: 'curated' },
  { id: 'mayor-san-diego', name: 'Todd Gloria', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'San Diego', source: 'curated' },
  { id: 'mayor-dallas', name: 'Eric Johnson', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'TX', city: 'Dallas', source: 'curated' },
  { id: 'mayor-san-jose', name: 'Matt Mahan', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'San Jose', source: 'curated' },
  { id: 'mayor-austin', name: 'Kirk Watson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TX', city: 'Austin', source: 'curated' },
  { id: 'mayor-jacksonville', name: 'Donna Deegan', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'FL', city: 'Jacksonville', source: 'curated' },
  { id: 'mayor-fort-worth', name: 'Mattie Parker', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'TX', city: 'Fort Worth', source: 'curated' },
  { id: 'mayor-columbus', name: 'Andrew Ginther', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OH', city: 'Columbus', source: 'curated' },
  { id: 'mayor-charlotte', name: 'Vi Lyles', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NC', city: 'Charlotte', source: 'curated' },
  { id: 'mayor-sf', name: 'London Breed', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'San Francisco', source: 'curated' },
  { id: 'mayor-indianapolis', name: 'Joe Hogsett', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'IN', city: 'Indianapolis', source: 'curated' },
  { id: 'mayor-seattle', name: 'Bruce Harrell', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'WA', city: 'Seattle', source: 'curated' },
  { id: 'mayor-denver', name: 'Mike Johnston', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CO', city: 'Denver', source: 'curated' },
  { id: 'mayor-dc', name: 'Muriel Bowser', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'DC', city: 'Washington', source: 'curated' },
  { id: 'mayor-boston', name: 'Michelle Wu', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MA', city: 'Boston', source: 'curated' },
  { id: 'mayor-nashville', name: 'Freddie O\'Connell', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TN', city: 'Nashville', source: 'curated' },
  { id: 'mayor-detroit', name: 'Mike Duggan', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MI', city: 'Detroit', source: 'curated' },
  { id: 'mayor-portland', name: 'Keith Wilson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OR', city: 'Portland', source: 'curated' },
  { id: 'mayor-memphis', name: 'Paul Young', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'TN', city: 'Memphis', source: 'curated' },
  { id: 'mayor-oklahoma-city', name: 'David Holt', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'OK', city: 'Oklahoma City', source: 'curated' },
  { id: 'mayor-las-vegas', name: 'Michelle Fiore', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'NV', city: 'Las Vegas', source: 'curated' },
  { id: 'mayor-baltimore', name: 'Brandon Scott', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MD', city: 'Baltimore', source: 'curated' },
  { id: 'mayor-milwaukee', name: 'Cavalier Johnson', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'WI', city: 'Milwaukee', source: 'curated' },
  { id: 'mayor-albuquerque', name: 'Tim Keller', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NM', city: 'Albuquerque', source: 'curated' },
  { id: 'mayor-tucson', name: 'Regina Romero', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'AZ', city: 'Tucson', source: 'curated' },
  { id: 'mayor-fresno', name: 'Jerry Dyer', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'CA', city: 'Fresno', source: 'curated' },
  { id: 'mayor-sacramento', name: 'Darrell Steinberg', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'Sacramento', source: 'curated' },
  { id: 'mayor-mesa', name: 'John Giles', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'AZ', city: 'Mesa', source: 'curated' },
  { id: 'mayor-atlanta', name: 'Andre Dickens', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'GA', city: 'Atlanta', source: 'curated' },
  { id: 'mayor-miami', name: 'Francis Suarez', role: 'Mayor', chamber: 'Local', party: 'Republican', state: 'FL', city: 'Miami', source: 'curated' },
  { id: 'mayor-oakland', name: 'Sheng Thao', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'CA', city: 'Oakland', source: 'curated' },
  { id: 'mayor-minneapolis', name: 'Jacob Frey', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MN', city: 'Minneapolis', source: 'curated' },
  { id: 'mayor-tulsa', name: 'Monroe Nichols', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OK', city: 'Tulsa', source: 'curated' },
  { id: 'mayor-cleveland', name: 'Justin Bibb', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OH', city: 'Cleveland', source: 'curated' },
  { id: 'mayor-new-orleans', name: 'LaToya Cantrell', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'LA', city: 'New Orleans', source: 'curated' },
  { id: 'mayor-pittsburgh', name: 'Ed Gainey', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'PA', city: 'Pittsburgh', source: 'curated' },
  { id: 'mayor-st-louis', name: 'Tishaura Jones', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'MO', city: 'St. Louis', source: 'curated' },
  { id: 'mayor-cincinnati', name: 'Aftab Pureval', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'OH', city: 'Cincinnati', source: 'curated' },
  { id: 'mayor-tampa', name: 'Jane Castor', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'FL', city: 'Tampa', source: 'curated' },
  { id: 'mayor-raleigh', name: 'Mary-Ann Baldwin', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'NC', city: 'Raleigh', source: 'curated' },
  { id: 'mayor-honolulu', name: 'Rick Blangiardi', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'HI', city: 'Honolulu', source: 'curated' },
  { id: 'mayor-salt-lake-city', name: 'Erin Mendenhall', role: 'Mayor', chamber: 'Local', party: 'Democratic', state: 'UT', city: 'Salt Lake City', source: 'curated' },
];

// Curated list of US Governors (all 50 states + territories)
const US_GOVERNORS: RosterEntity[] = [
  { id: 'gov-al', name: 'Kay Ivey', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'AL', source: 'curated' },
  { id: 'gov-ak', name: 'Mike Dunleavy', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'AK', source: 'curated' },
  { id: 'gov-az', name: 'Katie Hobbs', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'AZ', source: 'curated' },
  { id: 'gov-ar', name: 'Sarah Huckabee Sanders', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'AR', source: 'curated' },
  { id: 'gov-ca', name: 'Gavin Newsom', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'CA', source: 'curated' },
  { id: 'gov-co', name: 'Jared Polis', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'CO', source: 'curated' },
  { id: 'gov-ct', name: 'Ned Lamont', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'CT', source: 'curated' },
  { id: 'gov-de', name: 'Matt Meyer', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'DE', source: 'curated' },
  { id: 'gov-fl', name: 'Ron DeSantis', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'FL', source: 'curated' },
  { id: 'gov-ga', name: 'Brian Kemp', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'GA', source: 'curated' },
  { id: 'gov-hi', name: 'Josh Green', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'HI', source: 'curated' },
  { id: 'gov-id', name: 'Brad Little', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'ID', source: 'curated' },
  { id: 'gov-il', name: 'JB Pritzker', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'IL', source: 'curated' },
  { id: 'gov-in', name: 'Mike Braun', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'IN', source: 'curated' },
  { id: 'gov-ia', name: 'Kim Reynolds', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'IA', source: 'curated' },
  { id: 'gov-ks', name: 'Laura Kelly', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'KS', source: 'curated' },
  { id: 'gov-ky', name: 'Andy Beshear', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'KY', source: 'curated' },
  { id: 'gov-la', name: 'Jeff Landry', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'LA', source: 'curated' },
  { id: 'gov-me', name: 'Janet Mills', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'ME', source: 'curated' },
  { id: 'gov-md', name: 'Wes Moore', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MD', source: 'curated' },
  { id: 'gov-ma', name: 'Maura Healey', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MA', source: 'curated' },
  { id: 'gov-mi', name: 'Gretchen Whitmer', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MI', source: 'curated' },
  { id: 'gov-mn', name: 'Tim Walz', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'MN', source: 'curated' },
  { id: 'gov-ms', name: 'Tate Reeves', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'MS', source: 'curated' },
  { id: 'gov-mo', name: 'Mike Kehoe', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'MO', source: 'curated' },
  { id: 'gov-mt', name: 'Greg Gianforte', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'MT', source: 'curated' },
  { id: 'gov-ne', name: 'Jim Pillen', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'NE', source: 'curated' },
  { id: 'gov-nv', name: 'Joe Lombardo', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'NV', source: 'curated' },
  { id: 'gov-nh', name: 'Kelly Ayotte', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'NH', source: 'curated' },
  { id: 'gov-nj', name: 'Phil Murphy', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NJ', source: 'curated' },
  { id: 'gov-nm', name: 'Michelle Lujan Grisham', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NM', source: 'curated' },
  { id: 'gov-ny', name: 'Kathy Hochul', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NY', source: 'curated' },
  { id: 'gov-nc', name: 'Josh Stein', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'NC', source: 'curated' },
  { id: 'gov-nd', name: 'Kelly Armstrong', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'ND', source: 'curated' },
  { id: 'gov-oh', name: 'Mike DeWine', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'OH', source: 'curated' },
  { id: 'gov-ok', name: 'Kevin Stitt', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'OK', source: 'curated' },
  { id: 'gov-or', name: 'Tina Kotek', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'OR', source: 'curated' },
  { id: 'gov-pa', name: 'Josh Shapiro', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'PA', source: 'curated' },
  { id: 'gov-ri', name: 'Dan McKee', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'RI', source: 'curated' },
  { id: 'gov-sc', name: 'Henry McMaster', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'SC', source: 'curated' },
  { id: 'gov-sd', name: 'Kristi Noem', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'SD', source: 'curated' },
  { id: 'gov-tn', name: 'Bill Lee', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'TN', source: 'curated' },
  { id: 'gov-tx', name: 'Greg Abbott', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'TX', source: 'curated' },
  { id: 'gov-ut', name: 'Spencer Cox', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'UT', source: 'curated' },
  { id: 'gov-vt', name: 'Phil Scott', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'VT', source: 'curated' },
  { id: 'gov-va', name: 'Glenn Youngkin', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'VA', source: 'curated' },
  { id: 'gov-wa', name: 'Bob Ferguson', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'WA', source: 'curated' },
  { id: 'gov-wv', name: 'Patrick Morrisey', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'WV', source: 'curated' },
  { id: 'gov-wi', name: 'Tony Evers', role: 'Governor', chamber: 'Executive', party: 'Democratic', state: 'WI', source: 'curated' },
  { id: 'gov-wy', name: 'Mark Gordon', role: 'Governor', chamber: 'Executive', party: 'Republican', state: 'WY', source: 'curated' },
];

async function fetchCongressMembers(apiKey: string): Promise<RosterEntity[]> {
  const allMembers: RosterEntity[] = [];
  const LIMIT = 250;
  let offset = 0;
  let totalCount = 0;
  
  try {
    console.log('Fetching all Congress members with pagination...');
    
    do {
      const url = new URL(`${CONGRESS_BASE}/member`);
      url.searchParams.set('api_key', apiKey);
      url.searchParams.set('limit', LIMIT.toString());
      url.searchParams.set('offset', offset.toString());
      url.searchParams.set('currentMember', 'true');

      console.log(`Fetching Congress members: offset=${offset}, limit=${LIMIT}`);
      const res = await fetch(url.toString());
      
      if (!res.ok) {
        console.error(`Congress API error: ${res.status}`);
        break;
      }

      const data = await res.json();
      
      if (data.pagination?.count) {
        totalCount = data.pagination.count;
        console.log(`Total Congress members available: ${totalCount}`);
      }
      
      if (!data.members || !Array.isArray(data.members)) {
        console.error('Invalid Congress API response structure');
        break;
      }

      const members = data.members.map((m: any) => ({
        id: m.bioguideId || `congress-${m.name}`,
        name: m.name || 'Unknown',
        role: m.terms?.[0]?.chamber === 'House of Representatives' ? 'U.S. Representative' : 'U.S. Senator',
        chamber: 'Federal' as const,
        party: m.partyName || m.party || 'Unknown',
        state: m.state || 'Unknown',
        district: m.district?.toString(),
        source: 'congress' as const,
        bioguideId: m.bioguideId,
        photoUrl: m.depiction?.imageUrl || null,
      }));

      allMembers.push(...members);
      offset += LIMIT;
      
    } while (offset < totalCount && totalCount > 0);

    console.log(`Fetched ${allMembers.length} total Congress members`);
    return allMembers;
  } catch (error) {
    console.error('Error fetching Congress members:', error);
    return allMembers;
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
      photoUrl: p.image || null,
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

  // USA-only geo-restriction
  const geoCheck = checkUSAOnly(req);
  if (!geoCheck.allowed) {
    return createGeoBlockedResponse(corsHeaders);
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

    // Fetch from both API sources in parallel
    const [federalEntities, stateEntities] = await Promise.all([
      fetchCongressMembers(congressApiKey),
      fetchOpenStatesLegislators(openStatesApiKey),
    ]);

    // Combine all sources: APIs + curated governors + curated mayors
    const entities = [
      ...federalEntities, 
      ...stateEntities,
      ...US_GOVERNORS,
      ...MAJOR_CITY_MAYORS,
    ];

    console.log(`Fetched ${federalEntities.length} federal + ${stateEntities.length} state + ${US_GOVERNORS.length} governors + ${MAJOR_CITY_MAYORS.length} mayors = ${entities.length} total entities`);

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