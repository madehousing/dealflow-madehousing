-- Phase 1: Create new tables for multi-state support

-- Table 1: Markets (for multi-state management)
CREATE TABLE IF NOT EXISTS public.markets (
    id SERIAL PRIMARY KEY,
    market_code VARCHAR(20) UNIQUE NOT NULL,
    market_name VARCHAR(100) NOT NULL,
    state VARCHAR(2) NOT NULL,
    state_full VARCHAR(50) NOT NULL,
    cities TEXT[],
    counties TEXT[],
    parcel_id_type VARCHAR(50) NOT NULL,
    parcel_id_format VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial market data
INSERT INTO public.markets (market_code, market_name, state, state_full, cities, counties, parcel_id_type, parcel_id_format, is_active) VALUES
('MIL', 'Milwaukee Metro', 'WI', 'Wisconsin', 
 ARRAY['Milwaukee', 'Wauwatosa', 'West Allis'], 
 ARRAY['Milwaukee County'], 
 'Tax Key Number', 
 'Numeric only, 10-13 digits', TRUE),
('HOU', 'Houston Metro', 'TX', 'Texas', 
 ARRAY['Houston', 'Sugar Land', 'The Woodlands'], 
 ARRAY['Harris County', 'Fort Bend County'], 
 'Property ID', 
 'Alphanumeric', TRUE),
('DAL', 'Dallas-Fort Worth', 'TX', 'Texas', 
 ARRAY['Dallas', 'Fort Worth', 'Arlington'], 
 ARRAY['Dallas County', 'Tarrant County'], 
 'Property ID', 
 'Alphanumeric', TRUE);

CREATE INDEX idx_markets_state ON public.markets(state);
CREATE INDEX idx_markets_code ON public.markets(market_code);
CREATE INDEX idx_markets_active ON public.markets(is_active);

-- Table 2: Column Mapping Templates
CREATE TABLE IF NOT EXISTS public.column_mapping_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    source_type VARCHAR(50),
    state VARCHAR(2),
    parcel_id_type VARCHAR(50),
    column_mappings JSONB NOT NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sample_headers JSONB
);

CREATE INDEX idx_templates_source ON public.column_mapping_templates(source_type);
CREATE INDEX idx_templates_state ON public.column_mapping_templates(state);
CREATE INDEX idx_templates_active ON public.column_mapping_templates(is_active);
CREATE INDEX idx_templates_name ON public.column_mapping_templates(template_name);

-- Phase 2: Update leads table with new fields

-- Add multi-state support fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS parcel_id VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS parcel_id_type VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS state_full VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS county VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS market VARCHAR(100);

-- Migrate existing tax_key_number to parcel_id
UPDATE public.leads SET parcel_id = tax_key_number WHERE parcel_id IS NULL AND tax_key_number IS NOT NULL;
UPDATE public.leads SET parcel_id_type = 'Tax Key Number' WHERE parcel_id_type IS NULL AND parcel_id IS NOT NULL;
UPDATE public.leads SET state_full = 'Wisconsin' WHERE state_full IS NULL AND state = 'WI';

-- Add external system integration fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS podio_item_id VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS calltools_lead_id VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ghl_contact_id VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS external_id_1 VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS external_id_2 VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS sync_status VARCHAR(50) DEFAULT 'Not Synced';

-- Enhance contact fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS skip_trace_status VARCHAR(50) DEFAULT 'Not Started';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS skip_trace_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS skip_trace_provider VARCHAR(100);

-- Migrate existing phone/email data
UPDATE public.leads SET phone_number = phone_1 WHERE phone_number IS NULL AND phone_1 IS NOT NULL;
UPDATE public.leads SET email = email_1 WHERE email IS NULL AND email_1 IS NOT NULL;

-- Rename owner contact fields (add new, migrate, drop old later)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS owner_city VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS owner_state VARCHAR(2);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS owner_zip_code VARCHAR(10);

UPDATE public.leads SET owner_city = mailing_city WHERE owner_city IS NULL AND mailing_city IS NOT NULL;
UPDATE public.leads SET owner_state = mailing_state WHERE owner_state IS NULL AND mailing_state IS NOT NULL;
UPDATE public.leads SET owner_zip_code = mailing_zip WHERE owner_zip_code IS NULL AND mailing_zip IS NOT NULL;

-- Add lead management fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS disposition VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contact_method VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_attempts INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS interested_in_selling BOOLEAN;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100);

-- Add property details fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS property_type VARCHAR(50);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS bedrooms INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS bathrooms DECIMAL(3,1);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS square_footage INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lot_size DECIMAL(10,2);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estimated_value DECIMAL(12,2);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_sale_date DATE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_sale_price DECIMAL(12,2);

-- Add system fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS data_source VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS data_provider VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS list_name VARCHAR(200);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS created_by VARCHAR(100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;

-- Create critical indexes for leads table
CREATE INDEX IF NOT EXISTS idx_leads_parcel_id ON public.leads(parcel_id);
CREATE INDEX IF NOT EXISTS idx_leads_state_market ON public.leads(state, market);
CREATE INDEX IF NOT EXISTS idx_leads_podio ON public.leads(podio_item_id);
CREATE INDEX IF NOT EXISTS idx_leads_calltools ON public.leads(calltools_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_ghl ON public.leads(ghl_contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_sync_status ON public.leads(sync_status);
CREATE INDEX IF NOT EXISTS idx_leads_skip_trace ON public.leads(skip_trace_status);
CREATE INDEX IF NOT EXISTS idx_leads_is_deleted ON public.leads(is_deleted);

-- Create composite unique constraint for parcel_id + state
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_parcel_state_unique 
ON public.leads(parcel_id, state) 
WHERE parcel_id IS NOT NULL AND is_deleted = FALSE;

-- Phase 3: Update duplicate_log table
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS duplicate_parcel_id VARCHAR(50);
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS duplicate_address TEXT;
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS duplicate_owner_name VARCHAR(200);
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS duplicate_state VARCHAR(2);
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS duplicate_market VARCHAR(100);
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS original_status VARCHAR(50);
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS matched_on VARCHAR(50);
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS original_campaign_name VARCHAR(100);
ALTER TABLE public.duplicate_log ADD COLUMN IF NOT EXISTS original_upload_date TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_duplicates_parcel ON public.duplicate_log(duplicate_parcel_id);
CREATE INDEX IF NOT EXISTS idx_duplicates_state ON public.duplicate_log(duplicate_state);
CREATE INDEX IF NOT EXISTS idx_duplicates_market ON public.duplicate_log(duplicate_market);
CREATE INDEX IF NOT EXISTS idx_duplicates_matched_on ON public.duplicate_log(matched_on);

-- Phase 4: Update campaigns table
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS market VARCHAR(100);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(50);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR(100);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS file_size_kb INTEGER;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS processing_time_seconds INTEGER;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS duplicate_rate DECIMAL(5,2);
ALTER TABLE public.campaigns ADD COLUMN IF NOT EXISTS skip_trace_needed INTEGER DEFAULT 0;

-- Set default state for existing campaigns
UPDATE public.campaigns SET state = 'WI' WHERE state IS NULL;
UPDATE public.campaigns SET market = 'MIL' WHERE market IS NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_state ON public.campaigns(state);
CREATE INDEX IF NOT EXISTS idx_campaigns_market ON public.campaigns(market);
CREATE INDEX IF NOT EXISTS idx_campaigns_type ON public.campaigns(campaign_type);

-- Enable RLS on new tables
ALTER TABLE public.markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.column_mapping_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for markets (read-only for all authenticated users)
CREATE POLICY "Markets are viewable by authenticated users"
ON public.markets FOR SELECT
USING (auth.role() = 'authenticated');

-- RLS policies for column_mapping_templates
CREATE POLICY "Users can view all templates"
ON public.column_mapping_templates FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create templates"
ON public.column_mapping_templates FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update templates"
ON public.column_mapping_templates FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete templates"
ON public.column_mapping_templates FOR DELETE
USING (auth.role() = 'authenticated');