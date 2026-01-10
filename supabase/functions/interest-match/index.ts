import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchResult {
  interest: string;
  relevantItems: {
    type: 'bill' | 'vote';
    title: string;
    description?: string;
    date?: string;
    url?: string;
  }[];
  matchCount: number;
}

interface MatchResponse {
  matches: MatchResult[];
  totalMatches: number;
  disclaimer: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { interests, bills, votes } = await req.json();

    if (!interests || !Array.isArray(interests)) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid interests array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Match user interests against bills and votes (descriptive only)
    const matches: MatchResult[] = interests.map((interest: string) => {
      const interestLower = interest.toLowerCase();
      const relevantItems: MatchResult['relevantItems'] = [];

      // Search bills for interest keywords
      if (bills && Array.isArray(bills)) {
        bills.forEach((bill: any) => {
          const title = (bill.title || '').toLowerCase();
          const type = (bill.type || '').toLowerCase();
          
          if (title.includes(interestLower)) {
            relevantItems.push({
              type: 'bill',
              title: bill.title,
              description: `${bill.type}${bill.number} - Congress ${bill.congress}`,
              date: bill.latestAction?.actionDate,
              url: bill.url,
            });
          }
        });
      }

      // Search votes/cosponsored legislation
      if (votes && Array.isArray(votes)) {
        votes.forEach((vote: any) => {
          const title = (vote.title || '').toLowerCase();
          const billNumber = (vote.billNumber || '').toLowerCase();
          
          if (title.includes(interestLower)) {
            relevantItems.push({
              type: 'vote',
              title: vote.title,
              description: `${vote.type === 'cosponsored' ? 'Cosponsored' : 'Voted on'}: ${vote.billNumber}`,
              date: vote.latestAction?.actionDate,
              url: vote.url,
            });
          }
        });
      }

      return {
        interest,
        relevantItems: relevantItems.slice(0, 5), // Limit to 5 per interest
        matchCount: relevantItems.length,
      };
    });

    const totalMatches = matches.reduce((sum, m) => sum + m.matchCount, 0);

    const response: MatchResponse = {
      matches,
      totalMatches,
      disclaimer: 'This is descriptive data showing legislative activity related to your interests. It does not represent endorsement, recommendation, or judgment of any kind.',
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Interest match error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process interest matching' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
