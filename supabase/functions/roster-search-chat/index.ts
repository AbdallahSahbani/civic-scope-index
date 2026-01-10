import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

const SYSTEM_PROMPT = `You are a civic search assistant for a U.S. elected officials directory. Your job is to interpret natural language queries and help users find relevant officials from local to federal level.

When a user asks about a location (like "Connecticut New Haven"), provide:
1. A brief explanation of the government structure for that area
2. The chain of representation from local → state → federal
3. Specific filter suggestions they can apply

For location queries, explain:
- Federal level: U.S. Senators (2 per state) and U.S. Representatives (by congressional district)
- State level: State legislators (varies by state)
- Local level: Note that local officials may not be in this database

Always be factual and neutral. If you don't know specific details, say so.
Respond concisely - users want actionable information quickly.

Example response format for "Connecticut New Haven":
"New Haven, Connecticut falls under:

**Federal Representatives:**
- 2 U.S. Senators for Connecticut
- U.S. Representative for CT-3 (New Haven is in the 3rd Congressional District)

**State Level:**
- Connecticut General Assembly members

To find your representatives, filter by:
- State: Connecticut
- For federal: Chamber → Federal
- For state: Chamber → State"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();

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

    console.log(`Processing search query: ${message}`);

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { 
            role: 'user', 
            content: context 
              ? `User query: "${message}"\n\nAdditional context: ${context}`
              : message 
          },
        ],
        max_tokens: 500,
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
    const answer = data.choices?.[0]?.message?.content || 'Unable to process your query.';

    // Extract filter suggestions from the response (simple parsing)
    const filterSuggestions: { state?: string; chamber?: string; party?: string } = {};
    
    // Try to extract state from query
    const stateMatch = message.match(/\b(Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i);
    
    if (stateMatch) {
      filterSuggestions.state = stateMatch[1];
    }

    return new Response(
      JSON.stringify({ 
        answer,
        filterSuggestions,
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