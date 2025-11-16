-- Add indexes to optimize duplicate detection queries
-- These indexes will dramatically speed up the initial fetch of existing leads

-- Index on tax_key_number for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_tax_key_number ON public.leads(tax_key_number) WHERE tax_key_number IS NOT NULL;

-- Composite index on address fields for fast address-based duplicate detection
CREATE INDEX IF NOT EXISTS idx_leads_address_composite ON public.leads(normalized_address, city, state, zip_code);

-- Index on campaign_id for faster filtering by campaign
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON public.leads(campaign_id);