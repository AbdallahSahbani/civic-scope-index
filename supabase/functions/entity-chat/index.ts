import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, context, entityName } = await req.json();

    if (!question || !context) {
      return new Response(
        JSON.stringify({ error: 'Missing question or context' }),
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

    // Citation-locked system prompt - AI can ONLY use provided context
    const systemPrompt = `You are a civic data interpreter for the Civic Roster platform.

CRITICAL RULES:
1. You may ONLY answer using the provided context data. Do not use any external knowledge.
2. Every factual claim MUST cite its source (e.g., "According to Congress.gov...", "Per FEC records...").
3. If the information is not present in the context, respond: "This information is not available in the sourced data for ${entityName || 'this official'}."
4. Never speculate, predict, or express opinions.
5. Be concise and factual.
6. Always remind users that this is descriptive data from public government sources.

You are interpreting data for: ${entityName || 'Unknown Official'}`;

    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `CONTEXT DATA (from official government sources):\n${context}\n\nUSER QUESTION:\n${question}` 
          },
        ],
        stream: false,
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
          JSON.stringify({ error: 'AI service quota exceeded.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Unable to generate a response.';

    return new Response(
      JSON.stringify({ 
        answer,
        disclaimer: 'This response is based solely on public government data. No endorsement or judgment is expressed.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Entity chat error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process question' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
