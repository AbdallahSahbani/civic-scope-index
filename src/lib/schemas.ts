// Canonical entity shape - single source of truth for real officials data

export type EntitySource = 'congress' | 'openstates' | 'curated';

export interface RosterEntity {
  id: string;               // bioguideId or OpenStates ID
  name: string;
  role: string;             // e.g. "U.S. Senator", "State Representative", "Governor", "Mayor"
  chamber: 'Federal' | 'State' | 'Executive' | 'Local';
  party: string;
  state: string;
  district?: string;
  city?: string;            // For mayors
  source: EntitySource;
  bioguideId?: string;
  photoUrl?: string;        // Official portrait URL from Congress.gov
}

export interface RosterResponse {
  updatedAt: string;
  count: number;
  entities: RosterEntity[];
}

export interface EntityDetailResponse {
  member: CongressMember | null;
  bills: Bill[];
  funding: FECCandidate | null;
  source: string;
}

export interface CongressMember {
  bioguideId: string;
  name: string;
  partyName: string;
  state: string;
  district?: string;
  terms: Term[];
  depiction?: {
    imageUrl: string;
    attribution: string;
  };
  currentMember: boolean;
}

export interface Term {
  chamber: string;
  startYear: number;
  endYear?: number;
}

export interface Bill {
  congress: number;
  type: string;
  number: string;
  title: string;
  latestAction?: {
    actionDate: string;
    text: string;
  };
  url: string;
}

export interface FECCandidate {
  candidate_id: string;
  name: string;
  party: string;
  office: string;
  state: string;
  district?: string;
  cycles: number[];
}
