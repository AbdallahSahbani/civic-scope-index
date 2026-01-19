// Types for USGeocoder jurisdiction resolution

export interface GeocoderLocation {
  address: string;
  city: string;
  state: string;
  stateAbbr: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
}

export interface CongressionalDistrict {
  districtName: string;
  districtId: string;
  state: string;
}

export interface Official {
  name: string;
  title: string;
  party?: string;
  chamber?: string;
  district?: string;
  contactUrl?: string;
  email?: string;
  phone?: string;
  level: 'federal' | 'state' | 'local';
}

export interface LocalInfo {
  votingDistrict?: string;
  schoolDistrict?: string;
  stateFips?: string;
  countyFips?: string;
}

export interface GeocoderResponse {
  success: boolean;
  error?: string;
  location: GeocoderLocation | null;
  congressional: CongressionalDistrict | null;
  representatives: Official[];
  stateOfficials: Official[];
  localInfo: LocalInfo | null;
}

export interface GeocoderInput {
  address?: string;
  zipcode?: string;
  lat?: number;
  lon?: number;
}
