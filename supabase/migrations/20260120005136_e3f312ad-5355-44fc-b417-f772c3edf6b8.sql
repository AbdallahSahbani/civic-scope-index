-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add new enums for enhanced affiliation tracking
CREATE TYPE public.financial_flow_type AS ENUM ('none', 'indirect', 'direct', 'unknown');
CREATE TYPE public.routing_context_type AS ENUM ('donations', 'security', 'content', 'employment', 'legal', 'advertising', 'academic');
CREATE TYPE public.verification_status AS ENUM ('verified', 'unverified', 'disputed');

-- Add new columns to media_affiliations
ALTER TABLE public.media_affiliations 
ADD COLUMN financial_flow public.financial_flow_type DEFAULT 'unknown',
ADD COLUMN routing_context public.routing_context_type,
ADD COLUMN verification_status public.verification_status DEFAULT 'unverified',
ADD COLUMN context_description TEXT;

-- Create sponsorships table for commercial relationships (separate from affiliations)
CREATE TABLE public.media_sponsorships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  sponsor_name TEXT NOT NULL,
  sponsor_entity_id UUID REFERENCES public.media_entities(id) ON DELETE SET NULL,
  relationship_type TEXT NOT NULL,
  context TEXT,
  financial_flow public.financial_flow_type DEFAULT 'unknown',
  disclosure_status TEXT DEFAULT 'unknown',
  verification_status public.verification_status DEFAULT 'unverified',
  start_date DATE,
  end_date DATE,
  source_id UUID REFERENCES public.media_sources(id) ON DELETE SET NULL,
  source_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donation routing table
CREATE TABLE public.media_donation_routing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_id UUID NOT NULL REFERENCES public.media_entities(id) ON DELETE CASCADE,
  destination_name TEXT NOT NULL,
  destination_entity_id UUID REFERENCES public.media_entities(id) ON DELETE SET NULL,
  routing_type TEXT NOT NULL,
  control_relationship TEXT DEFAULT 'not_established',
  source_url TEXT,
  snapshot_date DATE,
  source_id UUID REFERENCES public.media_sources(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.media_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_donation_routing ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Media sponsorships are publicly readable" 
ON public.media_sponsorships FOR SELECT USING (true);

CREATE POLICY "Media donation routing is publicly readable" 
ON public.media_donation_routing FOR SELECT USING (true);

-- Add updated_at trigger for sponsorships
CREATE TRIGGER update_media_sponsorships_updated_at
BEFORE UPDATE ON public.media_sponsorships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();