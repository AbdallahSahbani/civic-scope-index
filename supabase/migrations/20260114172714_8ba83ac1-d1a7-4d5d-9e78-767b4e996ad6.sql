-- ======================================
-- MEDIA ROSTER DATABASE SCHEMA
-- Neutral, public-record-sourced registry
-- ======================================

-- Entity type enum
CREATE TYPE public.media_entity_type AS ENUM (
  'CORPORATE_MEDIA',
  'INDEPENDENT_FIGURE',
  'HYBRID'
);

-- Platform enum
CREATE TYPE public.media_platform AS ENUM (
  'TV',
  'DIGITAL',
  'PODCAST',
  'RADIO',
  'SOCIAL'
);

-- Ownership type enum
CREATE TYPE public.ownership_type AS ENUM (
  'PUBLIC',
  'PRIVATE',
  'SUBSIDIARY'
);

-- Revenue band enum
CREATE TYPE public.revenue_band AS ENUM (
  'UNDER_100M',
  'BETWEEN_100M_1B',
  'OVER_1B'
);

-- Audience size band enum
CREATE TYPE public.audience_size_band AS ENUM (
  'UNDER_100K',
  'BETWEEN_100K_1M',
  'BETWEEN_1M_10M',
  'OVER_10M'
);

-- Declared scope enum
CREATE TYPE public.declared_scope AS ENUM (
  'news',
  'opinion',
  'mixed'
);

-- Declared role enum for individuals
CREATE TYPE public.declared_role AS ENUM (
  'journalist',
  'commentator',
  'podcaster',
  'activist'
);

-- Business entity type
CREATE TYPE public.business_entity_type AS ENUM (
  'LLC',
  'INC',
  'Nonprofit'
  'NONE',
  'UNKNOWN'
);

-- Relationship type for affiliations
CREATE TYPE public.affiliation_type AS ENUM (
  'employee',
  'contractor',
  'contributor',
  'former'
);

-- Source type enum
CREATE TYPE public.source_type AS ENUM (
  'SEC',
  'FCC',
  'FEC',
  'IRS',
  'PLATFORM',
  'COURT',
  'STATE_REGISTRY',
  'MANUAL'
);

-- ======================================
-- SOURCES TABLE (must come first - referenced by others)
-- Every fact must trace back to a source
-- ======================================
CREATE TABLE public.media_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type public.source_type NOT NULL,
  source_url TEXT NOT NULL,
  source_title TEXT,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checksum TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_sources ENABLE ROW LEVEL SECURITY;

-- Public read access (descriptive public data)
CREATE POLICY "Media sources are publicly readable"
  ON public.media_sources FOR SELECT
  USING (true);

-- ======================================
-- MEDIA ENTITIES TABLE (Base entity model)
-- ======================================
CREATE TABLE public.media_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  entity_type public.media_entity_type NOT NULL,
  country TEXT NOT NULL DEFAULT 'US',
  description TEXT,
  primary_platforms public.media_platform[] DEFAULT '{}',
  active_status BOOLEAN NOT NULL DEFAULT true,
  first_seen_at DATE,
  last_verified_at TIMESTAMPTZ,
  
  -- Corporate-specific fields (nullable for individuals)
  legal_name TEXT,
  parent_company TEXT,
  ownership_type public.ownership_type,
  headquarters_city TEXT,
  headquarters_state TEXT,
  fcc_license_id TEXT,
  sec_cik TEXT,
  revenue_band public.revenue_band,
  distribution_channels TEXT[] DEFAULT '{}',
  declared_scope public.declared_scope,
  
  -- Individual-specific fields (nullable for corporates)
  primary_alias TEXT,
  business_entity public.business_entity_type,
  primary_platform public.media_platform,
  audience_size_band public.audience_size_band,
  monetization_methods TEXT[] DEFAULT '{}',
  declared_role public.declared_role,
  
  -- Logo/Image URL (stored externally, not in DB)
  logo_url TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_entities ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Media entities are publicly readable"
  ON public.media_entities FOR SELECT
  USING (true);

-- Create indexes for common queries
CREATE INDEX idx_media_entities_type ON public.media_entities(entity_type);
CREATE INDEX idx_media_entities_platforms ON public.media_entities USING GIN(primary_platforms);
CREATE INDEX idx_media_entities_active ON public.media_entities(active_status);
CREATE INDEX idx_media_entities_state ON public.media_entities(headquarters_state);
CREATE INDEX idx_media_entities_audience ON public.media_entities(audience_size_band);

-- ======================================
-- MEDIA AFFILIATIONS TABLE (Relationships)
-- ======================================
CREATE TABLE public.media_affiliations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  relationship_type public.affiliation_type NOT NULL,
  start_date DATE,
  end_date DATE,
  source_id UUID REFERENCES public.media_sources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure person and org are different entities
  CONSTRAINT different_entities CHECK (person_id != organization_id)
);

-- Enable RLS
ALTER TABLE public.media_affiliations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Media affiliations are publicly readable"
  ON public.media_affiliations FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_affiliations_person ON public.media_affiliations(person_id);
CREATE INDEX idx_affiliations_org ON public.media_affiliations(organization_id);
CREATE INDEX idx_affiliations_type ON public.media_affiliations(relationship_type);

-- ======================================
-- ENTITY SOURCE LINKS (Many-to-many)
-- Links specific fields to their sources
-- ======================================
CREATE TABLE public.media_entity_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES public.media_sources(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(entity_id, source_id, field_name)
);

-- Enable RLS
ALTER TABLE public.media_entity_sources ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Entity sources are publicly readable"
  ON public.media_entity_sources FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_entity_sources_entity ON public.media_entity_sources(entity_id);
CREATE INDEX idx_entity_sources_source ON public.media_entity_sources(source_id);

-- ======================================
-- PUBLIC FILINGS RECORDS (FEC, SEC, etc.)
-- Existence only, no interpretation
-- ======================================
CREATE TABLE public.media_public_filings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  filing_type TEXT NOT NULL, -- 'FEC', 'SEC_10K', 'SEC_S1', 'IRS_990'
  filing_id TEXT,
  filing_date DATE,
  filing_url TEXT,
  description TEXT,
  source_id UUID REFERENCES public.media_sources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_public_filings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public filings are publicly readable"
  ON public.media_public_filings FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_filings_entity ON public.media_public_filings(entity_id);
CREATE INDEX idx_filings_type ON public.media_public_filings(filing_type);

-- ======================================
-- LEGAL RECORDS (Existence only)
-- ======================================
CREATE TABLE public.media_legal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL, -- 'lawsuit', 'regulatory', 'complaint'
  jurisdiction TEXT,
  case_exists BOOLEAN NOT NULL DEFAULT true,
  court_name TEXT,
  record_url TEXT,
  record_date DATE,
  source_id UUID REFERENCES public.media_sources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.media_legal_records ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Legal records are publicly readable"
  ON public.media_legal_records FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_legal_entity ON public.media_legal_records(entity_id);

-- ======================================
-- PLATFORM VERIFICATIONS
-- ======================================
CREATE TABLE public.media_platform_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  platform public.media_platform NOT NULL,
  platform_handle TEXT,
  verified_at TIMESTAMPTZ,
  follower_count_band public.audience_size_band,
  platform_url TEXT,
  source_id UUID REFERENCES public.media_sources(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(entity_id, platform)
);

-- Enable RLS
ALTER TABLE public.media_platform_verifications ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Platform verifications are publicly readable"
  ON public.media_platform_verifications FOR SELECT
  USING (true);

-- Indexes
CREATE INDEX idx_platform_entity ON public.media_platform_verifications(entity_id);
CREATE INDEX idx_platform_type ON public.media_platform_verifications(platform);

-- ======================================
-- UPDATE TIMESTAMP TRIGGER
-- ======================================
CREATE OR REPLACE FUNCTION public.update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_media_entities_updated_at
  BEFORE UPDATE ON public.media_entities
  FOR EACH ROW EXECUTE FUNCTION public.update_media_updated_at();

CREATE TRIGGER update_media_affiliations_updated_at
  BEFORE UPDATE ON public.media_affiliations
  FOR EACH ROW EXECUTE FUNCTION public.update_media_updated_at();