// USA-only geo-restriction utility
// Uses Cloudflare's CF-IPCountry header or Supabase's x-country header

export const USA_COUNTRY_CODES = ['US', 'USA'];

export interface GeoCheckResult {
  allowed: boolean;
  country: string | null;
}

export function checkUSAOnly(req: Request): GeoCheckResult {
  // Check various headers that CDNs use for country detection
  const country = 
    req.headers.get('cf-ipcountry') || // Cloudflare
    req.headers.get('x-country') ||     // Supabase/other proxies
    req.headers.get('x-vercel-ip-country') || // Vercel
    null;

  if (!country) {
    // If no country header, allow for development/testing
    // In production with proper CDN, this header should always be present
    console.log('No country header detected - allowing request (development mode)');
    return { allowed: true, country: null };
  }

  const allowed = USA_COUNTRY_CODES.includes(country.toUpperCase());
  
  if (!allowed) {
    console.log(`Geo-restricted request from country: ${country}`);
  }

  return { allowed, country };
}

export function createGeoBlockedResponse(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ 
      error: 'Access Denied',
      message: 'This service is only available within the United States.',
      code: 'GEO_RESTRICTED'
    }),
    { 
      status: 403, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Input validation utilities
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
}

export function validateBioguideId(id: string): boolean {
  // Bioguide IDs are alphanumeric, 7 characters (letter + 6 digits)
  return /^[A-Z]\d{6}$/.test(id);
}

export function validateState(state: string): boolean {
  const validStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'GU', 'VI', 'AS', 'MP'
  ];
  return validStates.includes(state.toUpperCase());
}
