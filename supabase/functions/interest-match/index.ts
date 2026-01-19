import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkUSAOnly, createGeoBlockedResponse, sanitizeString } from "../_shared/geo-restrict.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const STOP_WORDS = new Set(["the", "and", "of", "to", "for", "on", "with", "a", "an", "in"]);

interface RelevantItem {
  type: "bill" | "vote";
  title: string;
  description: string;
  date?: string;
  url?: string;
  score: number;
}

interface MatchResult {
  interest: string;
  bills: RelevantItem[];
  votes: RelevantItem[];
  totalMatches: number;
}

interface MatchResponse {
  matches: MatchResult[];
  totalMatches: number;
  disclaimer: string;
}

/* ------------------ helpers ------------------ */

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function scoreMatch(tokens: string[], text: string): number {
  const haystack = text.toLowerCase();
  let score = 0;

  for (const token of tokens) {
    if (haystack.includes(token)) score++;
  }

  return score;
}

function normalizeDate(input?: string): string | undefined {
  if (!input) return undefined;
  const d = new Date(input);
  return isNaN(d.getTime()) ? undefined : d.toISOString().split("T")[0];
}

/* ------------------ server ------------------ */

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const geoCheck = checkUSAOnly(req);
  if (!geoCheck.allowed) {
    return createGeoBlockedResponse(corsHeaders);
  }

  try {
    const body = await req.json();

    if (!Array.isArray(body.interests)) {
      return new Response(JSON.stringify({ error: "Invalid interests array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const interests = body.interests.slice(0, 10).map((i: unknown) => sanitizeString(String(i), 100));

    const bills = Array.isArray(body.bills) ? body.bills : [];
    const votes = Array.isArray(body.votes) ? body.votes : [];

    const matches: MatchResult[] = interests.map((interest: string) => {
      const tokens = tokenize(interest);

      const matchedBills: RelevantItem[] = [];
      const matchedVotes: RelevantItem[] = [];

      for (const bill of bills) {
        const title = sanitizeString(bill.title || "", 200);
        const textBlob = `${bill.title || ""} ${bill.type || ""}`;

        const score = scoreMatch(tokens, textBlob);
        if (score === 0) continue;

        matchedBills.push({
          type: "bill",
          title,
          description: sanitizeString(
            `${bill.type || "Bill"} ${bill.number || ""} – Congress ${bill.congress || ""}`,
            150,
          ),
          date: normalizeDate(bill.latestAction?.actionDate),
          url: sanitizeString(bill.url || "", 300),
          score,
        });
      }

      for (const vote of votes) {
        const title = sanitizeString(vote.title || "", 200);
        const textBlob = `${vote.title || ""} ${vote.billNumber || ""}`;

        const score = scoreMatch(tokens, textBlob);
        if (score === 0) continue;

        matchedVotes.push({
          type: "vote",
          title,
          description: sanitizeString(
            vote.type === "cosponsored" ? `Cosponsored ${vote.billNumber || ""}` : `Voted on ${vote.billNumber || ""}`,
            150,
          ),
          date: normalizeDate(vote.latestAction?.actionDate),
          url: sanitizeString(vote.url || "", 300),
          score,
        });
      }

      matchedBills.sort((a, b) => b.score - a.score);
      matchedVotes.sort((a, b) => b.score - a.score);

      const billsOut = matchedBills.slice(0, 5);
      const votesOut = matchedVotes.slice(0, 5);

      return {
        interest,
        bills: billsOut,
        votes: votesOut,
        totalMatches: billsOut.length + votesOut.length,
      };
    });

    const totalMatches = matches.reduce((sum, m) => sum + m.totalMatches, 0);

    const response: MatchResponse = {
      matches,
      totalMatches,
      disclaimer:
        "This output describes legislative activity textually related to user-selected interests. It does not imply support, opposition, or endorsement.",
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Interest match error:", err);
    return new Response(JSON.stringify({ error: "Internal matching failure" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
