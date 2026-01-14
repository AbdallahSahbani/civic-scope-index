// ======================================
// MEDIA ROSTER TYPE DEFINITIONS
// Matching database schema exactly
// ======================================

export type MediaEntityType = 'CORPORATE_MEDIA' | 'INDEPENDENT_FIGURE' | 'HYBRID';
export type MediaPlatform = 'TV' | 'DIGITAL' | 'PODCAST' | 'RADIO' | 'SOCIAL';
export type OwnershipType = 'PUBLIC' | 'PRIVATE' | 'SUBSIDIARY';
export type RevenueBand = 'UNDER_100M' | 'BETWEEN_100M_1B' | 'OVER_1B';
export type AudienceSizeBand = 'UNDER_100K' | 'BETWEEN_100K_1M' | 'BETWEEN_1M_10M' | 'OVER_10M';
export type DeclaredScope = 'news' | 'opinion' | 'mixed';
export type DeclaredRole = 'journalist' | 'commentator' | 'podcaster' | 'activist';
export type BusinessEntityType = 'LLC' | 'INC' | 'NONE' | 'UNKNOWN';
export type AffiliationType = 'employee' | 'contractor' | 'contributor' | 'former';
export type SourceType = 'SEC' | 'FCC' | 'FEC' | 'IRS' | 'PLATFORM' | 'COURT' | 'STATE_REGISTRY' | 'MANUAL';

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
  entityType: MediaEntityType | 'all';
  platforms: MediaPlatform[];
  audienceBand: AudienceSizeBand | 'all';
  activeStatus: 'all' | 'active' | 'inactive';
  hasFilings: boolean | null;
  search: string;
}

// Labels for display
export const ENTITY_TYPE_LABELS: Record<MediaEntityType, string> = {
  CORPORATE_MEDIA: 'Corporate Media',
  INDEPENDENT_FIGURE: 'Independent Figure',
  HYBRID: 'Hybrid',
};

export const PLATFORM_LABELS: Record<MediaPlatform, string> = {
  TV: 'Television',
  DIGITAL: 'Digital',
  PODCAST: 'Podcast',
  RADIO: 'Radio',
  SOCIAL: 'Social Media',
};

export const REVENUE_BAND_LABELS: Record<RevenueBand, string> = {
  UNDER_100M: 'Under $100M',
  BETWEEN_100M_1B: '$100M – $1B',
  OVER_1B: 'Over $1B',
};

export const AUDIENCE_BAND_LABELS: Record<AudienceSizeBand, string> = {
  UNDER_100K: 'Under 100K',
  BETWEEN_100K_1M: '100K – 1M',
  BETWEEN_1M_10M: '1M – 10M',
  OVER_10M: 'Over 10M',
};

export const DECLARED_SCOPE_LABELS: Record<DeclaredScope, string> = {
  news: 'News',
  opinion: 'Opinion',
  mixed: 'Mixed',
};

export const DECLARED_ROLE_LABELS: Record<DeclaredRole, string> = {
  journalist: 'Journalist',
  commentator: 'Commentator',
  podcaster: 'Podcaster',
  activist: 'Activist',
};

export const OWNERSHIP_TYPE_LABELS: Record<OwnershipType, string> = {
  PUBLIC: 'Publicly Traded',
  PRIVATE: 'Private',
  SUBSIDIARY: 'Subsidiary',
};

export const AFFILIATION_TYPE_LABELS: Record<AffiliationType, string> = {
  employee: 'Employee',
  contractor: 'Contractor',
  contributor: 'Contributor',
  former: 'Former',
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  SEC: 'SEC Filing',
  FCC: 'FCC Record',
  FEC: 'FEC Filing',
  IRS: 'IRS Record',
  PLATFORM: 'Platform Data',
  COURT: 'Court Record',
  STATE_REGISTRY: 'State Registry',
  MANUAL: 'Manual Entry',
};
