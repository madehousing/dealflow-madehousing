-- Rename apn column to tax_key_number in leads table
ALTER TABLE public.leads 
RENAME COLUMN apn TO tax_key_number;

-- Update comments
COMMENT ON COLUMN public.leads.tax_key_number IS 'Tax key number (APN) for the property';