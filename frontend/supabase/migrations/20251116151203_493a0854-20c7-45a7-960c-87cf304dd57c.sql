-- Add indexes for faster duplicate detection queries
-- These indexes will significantly improve performance when checking for duplicates

-- Index for parcel ID lookups by state
CREATE INDEX IF NOT EXISTS idx_leads_parcel_state 
ON leads(parcel_id, state) 
WHERE is_deleted = false AND parcel_id IS NOT NULL;

-- Index for address-based duplicate detection
CREATE INDEX IF NOT EXISTS idx_leads_address 
ON leads(normalized_address, city, state, zip_code) 
WHERE is_deleted = false;

-- Index for campaign lookups (used in duplicate details)
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id 
ON leads(campaign_id) 
WHERE is_deleted = false;