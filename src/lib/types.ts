export type EntityType = 'elected_official' | 'journalist' | 'media_organization';

export type Jurisdiction = 'federal' | 'state' | 'local';

export interface Entity {
  id: string;
  name: string;
  entityType: EntityType;
  state: string;
  jurisdiction?: Jurisdiction;
  office?: string;
  outlet?: string;
  beat?: string;
  metrics: EntityMetrics;
  evidenceLinks: EvidenceLink[];
}

export interface EntityMetrics {
  activity: MetricValue;
  visibility: MetricValue;
  sourceCoverage: MetricValue;
  lastUpdated: string;
}

export interface MetricValue {
  level: 'low' | 'moderate' | 'high';
  description: string;
  timePeriod: string;
}

export interface EvidenceLink {
  id: string;
  title: string;
  source: string;
  url: string;
  dateAccessed: string;
  category: string;
}

export const US_STATES = [
  { code: 'ALL', name: 'All States' },
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
] as const;

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  elected_official: 'Elected Official',
  journalist: 'Journalist',
  media_organization: 'Media Organization',
};

export const JURISDICTION_LABELS: Record<Jurisdiction, string> = {
  federal: 'Federal',
  state: 'State',
  local: 'Local',
};
