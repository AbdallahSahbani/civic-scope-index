import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUSAOnly, createGeoBlockedResponse, sanitizeString } from "../_shared/geo-restrict.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// US State mapping for NLP extraction
const STATE_ABBREVIATIONS: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia'
};

const STATE_NAMES = Object.values(STATE_ABBREVIATIONS);

// Connecticut county to congressional district mapping (example - CT has 5 districts)
const CT_COUNTY_DISTRICTS: Record<string, string> = {
  'fairfield': '4',
  'new haven': '3',
  'hartford': '1',
  'litchfield': '5',
  'middlesex': '2',
  'new london': '2',
  'tolland': '2',
  'windham': '2',
};

// ZIP code prefix to state mapping (first 3 digits)
const ZIP_TO_STATE: Record<string, string> = {
  '060': 'Connecticut', '061': 'Connecticut', '062': 'Connecticut', '063': 'Connecticut',
  '064': 'Connecticut', '065': 'Connecticut', '066': 'Connecticut', '067': 'Connecticut',
  '068': 'Connecticut', '069': 'Connecticut',
  '100': 'New York', '101': 'New York', '102': 'New York', '103': 'New York',
  '104': 'New York', '105': 'New York', '106': 'New York', '107': 'New York',
  '108': 'New York', '109': 'New York', '110': 'New York', '111': 'New York',
  '112': 'New York', '113': 'New York', '114': 'New York', '115': 'New York',
  '116': 'New York', '117': 'New York', '118': 'New York', '119': 'New York',
  '900': 'California', '901': 'California', '902': 'California', '903': 'California',
  '904': 'California', '905': 'California', '906': 'California', '907': 'California',
  '908': 'California', '909': 'California', '910': 'California', '911': 'California',
  '912': 'California', '913': 'California', '914': 'California', '915': 'California',
  '916': 'California', '917': 'California', '918': 'California', '919': 'California',
  '920': 'California', '921': 'California', '922': 'California', '923': 'California',
  '924': 'California', '925': 'California', '926': 'California', '927': 'California',
  '928': 'California', '930': 'California', '931': 'California', '932': 'California',
  '933': 'California', '934': 'California', '935': 'California', '936': 'California',
  '937': 'California', '938': 'California', '939': 'California', '940': 'California',
  '941': 'California', '942': 'California', '943': 'California', '944': 'California',
  '945': 'California', '946': 'California', '947': 'California', '948': 'California',
  '949': 'California', '950': 'California', '951': 'California', '952': 'California',
  '953': 'California', '954': 'California', '955': 'California', '956': 'California',
  '957': 'California', '958': 'California', '959': 'California', '960': 'California',
  '961': 'California',
  '770': 'Texas', '771': 'Texas', '772': 'Texas', '773': 'Texas', '774': 'Texas',
  '775': 'Texas', '776': 'Texas', '777': 'Texas', '778': 'Texas', '779': 'Texas',
  '780': 'Texas', '781': 'Texas', '782': 'Texas', '783': 'Texas', '784': 'Texas',
  '785': 'Texas', '786': 'Texas', '787': 'Texas', '788': 'Texas', '789': 'Texas',
  '790': 'Texas', '791': 'Texas', '792': 'Texas', '793': 'Texas', '794': 'Texas',
  '795': 'Texas', '796': 'Texas', '797': 'Texas', '798': 'Texas', '799': 'Texas',
};

const SYSTEM_PROMPT = `You are a civic search assistant for a U.S. elected officials directory. Your job is to interpret natural language queries about locations and help users find their representatives.

IMPORTANT: You have access to a tool called "apply_roster_filters" to help users filter the roster. You MUST use this tool when you identify a location.

When a user mentions ANY of these, use the tool:
- A state name or abbreviation (e.g., "CT", "Connecticut", "Texas")
- A city/town with context (e.g., "Waterbury", "New Haven")
- A county (e.g., "New Haven County")
- A ZIP code (e.g., "06705")
- An address or "I live in..."

Your response should:
1. Acknowledge their location
2. Explain who represents them (federal: 2 Senators + 1 Representative by district, state: state legislators)
3. Confirm filters have been applied

For location queries, remember:
- Federal: 2 U.S. Senators per state, 1 U.S. Representative per congressional district
- State: State legislators (Senate and House/Assembly)
- Local officials may not be in this database

Be concise and helpful. Focus on actionable information.`;

// Tool definition for structured filter extraction
const FILTER_TOOL = {
  type: "function",
  function: {
    name: "apply_roster_filters",
    description: "Apply filters to the elected officials roster based on user's location or preferences. Call this whenever you identify a state, city, county, ZIP code, or any location reference.",
    parameters: {
      type: "object",
      properties: {
        state: {
          type: "string",
          description: "The full U.S. state name (e.g., 'Connecticut', 'California', 'Texas'). Required when any location is mentioned."
        },
        chamber: {
          type: "string",
          enum: ["Federal", "State", ""],
          description: "Filter by level of government. Use 'Federal' for U.S. Congress, 'State' for state legislators, or empty for all."
        },
        party: {
          type: "string",
          enum: ["Democratic", "Republican", "Independent", ""],
          description: "Filter by political party, or empty for all parties."
        },
        searchTerm: {
          type: "string",
          description: "Optional: specific name or term to search for in addition to filters."
        },
        district: {
          type: "string",
          description: "Congressional district number if determinable from the location (e.g., '3' for CT-3)."
        },
        explanation: {
          type: "string",
          description: "Brief explanation of what representatives serve this area."
        }
      },
      required: ["state", "explanation"]
    }
  }
};

// Pre-extract location data using regex patterns
function preExtractLocation(message: string): { state?: string; zipCode?: string; county?: string; city?: string } {
  const result: { state?: string; zipCode?: string; county?: string; city?: string } = {};
  
  // Extract ZIP code
  const zipMatch = message.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (zipMatch) {
    result.zipCode = zipMatch[1];
    const prefix = zipMatch[1].substring(0, 3);
    if (ZIP_TO_STATE[prefix]) {
      result.state = ZIP_TO_STATE[prefix];
    }
  }
  
  // Extract state abbreviation
  const stateAbbrMatch = message.match(/\b([A-Z]{2})\b/);
  if (stateAbbrMatch && STATE_ABBREVIATIONS[stateAbbrMatch[1]]) {
    result.state = STATE_ABBREVIATIONS[stateAbbrMatch[1]];
  }
  
  // Extract full state name
  for (const stateName of STATE_NAMES) {
    if (message.toLowerCase().includes(stateName.toLowerCase())) {
      result.state = stateName;
      break;
    }
  }
  
  // Extract county
  const countyMatch = message.match(/([a-zA-Z\s]+)\s+county/i);
  if (countyMatch) {
    result.county = countyMatch[1].trim().toLowerCase();
  }
  
  // Common CT cities for district mapping
  const ctCities: Record<string, string> = {
    'waterbury': 'new haven',
    'new haven': 'new haven',
    'bridgeport': 'fairfield',
    'stamford': 'fairfield',
    'hartford': 'hartford',
    'new london': 'new london',
  };
  
  for (const [city, county] of Object.entries(ctCities)) {
    if (message.toLowerCase().includes(city)) {
      result.city = city;
      result.county = county;
      break;
    }
  }
  
  return result;
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
    const body = await req.json();
    
    // Input validation
    const message = sanitizeString(body.message || '', 500);
    const context = sanitizeString(body.context || '', 1000);

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing NLP search query: ${message.substring(0, 100)}...`);

    // Pre-extract location for context enrichment
    const preExtracted = preExtractLocation(message);
    console.log('Pre-extracted location data:', preExtracted);

    // Build context with pre-extracted data
    let enrichedContext = context || '';
    if (preExtracted.state) {
      enrichedContext += `\nDetected state: ${preExtracted.state}`;
    }
    if (preExtracted.zipCode) {
      enrichedContext += `\nDetected ZIP: ${preExtracted.zipCode}`;
    }
    if (preExtracted.county) {
      enrichedContext += `\nDetected county: ${preExtracted.county}`;
      if (preExtracted.state === 'Connecticut' && CT_COUNTY_DISTRICTS[preExtracted.county]) {
        enrichedContext += `\nCongressional District: CT-${CT_COUNTY_DISTRICTS[preExtracted.county]}`;
      }
    }

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: enrichedContext 
              ? `User query: "${message}"\n\nContext: ${enrichedContext}`
              : message 
          },
        ],
        tools: [FILTER_TOOL],
        tool_choice: { type: "function", function: { name: "apply_roster_filters" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error(`AI Gateway error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to process query' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract tool call results
    let filterSuggestions: { 
      state?: string; 
      chamber?: string; 
      party?: string;
      searchTerm?: string;
      district?: string;
    } = {};
    let answer = '';

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.name === 'apply_roster_filters') {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        filterSuggestions = {
          state: args.state || preExtracted.state,
          chamber: args.chamber || '',
          party: args.party || '',
          searchTerm: args.searchTerm || '',
          district: args.district || '',
        };
        answer = args.explanation || `Found representatives for ${args.state || 'your location'}.`;
        
        // Enhance answer with district info if available
        if (filterSuggestions.district && filterSuggestions.state) {
          const stateAbbr = Object.entries(STATE_ABBREVIATIONS).find(([abbr, name]) => name === filterSuggestions.state)?.[0] || '';
          answer += `\n\nYour congressional district is ${stateAbbr}-${filterSuggestions.district}. Filters have been applied to show your representatives.`;
        }
      } catch (e) {
        console.error('Failed to parse tool arguments:', e);
        // Fall back to pre-extracted data
        filterSuggestions.state = preExtracted.state;
      }
    } else {
      // Fallback to regular message content if no tool call
      answer = data.choices?.[0]?.message?.content || 'Unable to process your query.';
      filterSuggestions.state = preExtracted.state;
    }

    // Apply pre-extracted state if not already set
    if (!filterSuggestions.state && preExtracted.state) {
      filterSuggestions.state = preExtracted.state;
    }

    console.log('Final filter suggestions:', filterSuggestions);

    return new Response(
      JSON.stringify({ 
        answer,
        filterSuggestions,
        autoApply: true, // Signal frontend to auto-apply filters
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Roster search chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process search query' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
