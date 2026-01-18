// ======================================
// MEDIA ROSTER TYPE DEFINITIONS
// Matching database schema exactly
// ======================================

// Constants
export const MEDIA_ENTITY_TYPE = {
  CORPORATE_MEDIA: "CORPORATE_MEDIA",
  INDEPENDENT_FIGURE: "INDEPENDENT_FIGURE",
  HYBRID: "HYBRID",
} as const;

export const MEDIA_PLATFORM = {
  TV: "TV",
  DIGITAL: "DIGITAL",
  PODCAST: "PODCAST",
  RADIO: "RADIO",
  SOCIAL: "SOCIAL",
} as const;

export const OWNERSHIP_TYPE = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  SUBSIDIARY: "SUBSIDIARY",
} as const;

export const REVENUE_BAND = {
  UNDER_1M: "UNDER_1M",
  BETWEEN_1M_10M: "BETWEEN_1M_10M",
  BETWEEN_10M_50M: "BETWEEN_10M_50M",
  BETWEEN_50M_100M: "BETWEEN_50M_100M",
  BETWEEN_100M_500M: "BETWEEN_100M_500M",
  BETWEEN_500M_1B: "BETWEEN_500M_1B",
  BETWEEN_1B_5B: "BETWEEN_1B_5B",
  OVER_5B: "OVER_5B",
} as const;

export const AUDIENCE_SIZE_BAND = {
  UNDER_10K: "UNDER_10K",
  BETWEEN_10K_50K: "BETWEEN_10K_50K",
  BETWEEN_50K_100K: "BETWEEN_50K_100K",
  BETWEEN_100K_250K: "BETWEEN_100K_250K",
  BETWEEN_250K_500K: "BETWEEN_250K_500K",
  BETWEEN_500K_1M: "BETWEEN_500K_1M",
  BETWEEN_1M_2_5M: "BETWEEN_1M_2_5M",
  BETWEEN_2_5M_5M: "BETWEEN_2_5M_5M",
  BETWEEN_5M_10M: "BETWEEN_5M_10M",
  BETWEEN_10M_25M: "BETWEEN_10M_25M",
  BETWEEN_25M_50M: "BETWEEN_25M_50M",
  OVER_50M: "OVER_50M",
} as const;

export const DECLARED_SCOPE = {
  NEWS: "news",
  OPINION: "opinion",
  MIXED: "mixed",
} as const;

export const DECLARED_ROLE = {
  JOURNALIST: "journalist",
  COMMENTATOR: "commentator",
  PODCASTER: "podcaster",
  ACTIVIST: "activist",
} as const;

export const BUSINESS_ENTITY_TYPE = {
  LLC: "LLC",
  INC: "INC",
  NONE: "NONE",
  UNKNOWN: "UNKNOWN",
} as const;

export const AFFILIATION_TYPE = {
  EMPLOYEE: "employee",
  CONTRACTOR: "contractor",
  CONTRIBUTOR: "contributor",
  FORMER: "former",
} as const;

export const SOURCE_TYPE = {
  SEC: "SEC",
  FCC: "FCC",
  FEC: "FEC",
  IRS: "IRS",
  PLATFORM: "PLATFORM",
  COURT: "COURT",
  STATE_REGISTRY: "STATE_REGISTRY",
  MANUAL: "MANUAL",
} as const;

// Type definitions derived from constants
export type MediaEntityType = (typeof MEDIA_ENTITY_TYPE)[keyof typeof MEDIA_ENTITY_TYPE];
export type MediaPlatform = (typeof MEDIA_PLATFORM)[keyof typeof MEDIA_PLATFORM];
export type OwnershipType = (typeof OWNERSHIP_TYPE)[keyof typeof OWNERSHIP_TYPE];
export type RevenueBand = (typeof REVENUE_BAND)[keyof typeof REVENUE_BAND];
export type AudienceSizeBand = (typeof AUDIENCE_SIZE_BAND)[keyof typeof AUDIENCE_SIZE_BAND];
export type DeclaredScope = (typeof DECLARED_SCOPE)[keyof typeof DECLARED_SCOPE];
export type DeclaredRole = (typeof DECLARED_ROLE)[keyof typeof DECLARED_ROLE];
export type BusinessEntityType = (typeof BUSINESS_ENTITY_TYPE)[keyof typeof BUSINESS_ENTITY_TYPE];
export type AffiliationType = (typeof AFFILIATION_TYPE)[keyof typeof AFFILIATION_TYPE];
export type SourceType = (typeof SOURCE_TYPE)[keyof typeof SOURCE_TYPE];

// Core entity interface
export interface MediaEntity {
  id: string;
  name: string;
  entity_type: MediaEntityType;
  country: string;
  description?: string;
  primary_platforms: MediaPlatform[];
  active_status: boolean;
  first_seen_at?: string;
  last_verified_at?: string;

  // Corporate fields
  legal_name?: string;
  parent_company?: string;
  ownership_type?: OwnershipType;
  headquarters_city?: string;
  headquarters_state?: string;
  fcc_license_id?: string;
  sec_cik?: string;
  revenue_band?: RevenueBand;
  distribution_channels?: string[];
  declared_scope?: DeclaredScope;

  // Individual fields
  primary_alias?: string;
  business_entity?: BusinessEntityType;
  primary_platform?: MediaPlatform;
  audience_size_band?: AudienceSizeBand;
  monetization_methods?: string[];
  declared_role?: DeclaredRole;

  logo_url?: string;
  created_at: string;
  updated_at: string;
}

// Source interface
export interface MediaSource {
  id: string;
  source_type: SourceType;
  source_url: string;
  source_title?: string;
  retrieved_at: string;
  checksum?: string;
  created_at: string;
}

// Affiliation interface
export interface MediaAffiliation {
  id: string;
  person_id: string;
  organization_id: string;
  relationship_type: AffiliationType;
  start_date?: string;
  end_date?: string;
  source_id?: string;
  person?: MediaEntity;
  organization?: MediaEntity;
}

// Public filing interface
export interface MediaPublicFiling {
  id: string;
  entity_id: string;
  filing_type: string;
  filing_id?: string;
  filing_date?: string;
  filing_url?: string;
  description?: string;
  source_id?: string;
}

// Legal record interface
export interface MediaLegalRecord {
  id: string;
  entity_id: string;
  record_type: string;
  jurisdiction?: string;
  case_exists: boolean;
  court_name?: string;
  record_url?: string;
  record_date?: string;
  source_id?: string;
}

// Platform verification interface
export interface MediaPlatformVerification {
  id: string;
  entity_id: string;
  platform: MediaPlatform;
  platform_handle?: string;
  verified_at?: string;
  follower_count_band?: AudienceSizeBand;
  platform_url?: string;
  source_id?: string;
}

// Filter state for UI
export interface MediaFilters {
  entityType: MediaEntityType | "all";
  platforms: MediaPlatform[];
  audienceBand: AudienceSizeBand | "all";
  revenueBand: RevenueBand | "all";
  activeStatus: "all" | "active" | "inactive";
  hasFilings: boolean | null;
  search: string;
}

// Labels for display
export const ENTITY_TYPE_LABELS: Record<MediaEntityType, string> = {
  CORPORATE_MEDIA: "Corporate Media",
  INDEPENDENT_FIGURE: "Independent Figure",
  HYBRID: "Hybrid",
};

export const PLATFORM_LABELS: Record<MediaPlatform, string> = {
  TV: "Television",
  DIGITAL: "Digital",
  PODCAST: "Podcast",
  RADIO: "Radio",
  SOCIAL: "Social Media",
};

export const REVENUE_BAND_LABELS: Record<RevenueBand, string> = {
  UNDER_1M: "Under $1M",
  BETWEEN_1M_10M: "$1M – $10M",
  BETWEEN_10M_50M: "$10M – $50M",
  BETWEEN_50M_100M: "$50M – $100M",
  BETWEEN_100M_500M: "$100M – $500M",
  BETWEEN_500M_1B: "$500M – $1B",
  BETWEEN_1B_5B: "$1B – $5B",
  OVER_5B: "Over $5B",
};

export const AUDIENCE_BAND_LABELS: Record<AudienceSizeBand, string> = {
  UNDER_10K: "Under 10K",
  BETWEEN_10K_50K: "10K – 50K",
  BETWEEN_50K_100K: "50K – 100K",
  BETWEEN_100K_250K: "100K – 250K",
  BETWEEN_250K_500K: "250K – 500K",
  BETWEEN_500K_1M: "500K – 1M",
  BETWEEN_1M_2_5M: "1M – 2.5M",
  BETWEEN_2_5M_5M: "2.5M – 5M",
  BETWEEN_5M_10M: "5M – 10M",
  BETWEEN_10M_25M: "10M – 25M",
  BETWEEN_25M_50M: "25M – 50M",
  OVER_50M: "Over 50M",
};

export const DECLARED_SCOPE_LABELS: Record<DeclaredScope, string> = {
  news: "News",
  opinion: "Opinion",
  mixed: "Mixed",
};

export const DECLARED_ROLE_LABELS: Record<DeclaredRole, string> = {
  journalist: "Journalist",
  commentator: "Commentator",
  podcaster: "Podcaster",
  activist: "Activist",
};

export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  PUBLIC: "Publicly Traded",
  PRIVATE: "Private",
  SUBSIDIARY: "Subsidiary",
};

export const AFFILIATION_TYPE_LABELS: Record<AffiliationType, string> = {
  employee: "Employee",
  contractor: "Contractor",
  contributor: "Contributor",
  former: "Former",
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  SEC: "SEC Filing",
  FCC: "FCC Record",
  FEC: "FEC Filing",
  IRS: "IRS Record",
  PLATFORM: "Platform Data",
  COURT: "Court Record",
  STATE_REGISTRY: "State Registry",
  MANUAL: "Manual Entry",
};
