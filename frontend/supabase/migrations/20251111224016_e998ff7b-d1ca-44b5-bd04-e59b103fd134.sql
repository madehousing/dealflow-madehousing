-- Add missing columns to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS secondary_address text,
ADD COLUMN IF NOT EXISTS owner_secondary_address text;

-- Update the existing columns to ensure they match the CSV structure
COMMENT ON COLUMN public.leads.secondary_address IS 'Secondary address line for property';
COMMENT ON COLUMN public.leads.owner_secondary_address IS 'Secondary address line for owner mailing address';