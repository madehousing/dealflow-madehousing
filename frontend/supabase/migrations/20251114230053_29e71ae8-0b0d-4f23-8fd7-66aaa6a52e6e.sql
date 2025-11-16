-- Remove tax_key_number column (replaced by parcel_id)
ALTER TABLE public.leads DROP COLUMN IF EXISTS tax_key_number;

-- Remove mailing address columns (keeping owner_mailing_address only)
ALTER TABLE public.leads DROP COLUMN IF EXISTS mailing_street;
ALTER TABLE public.leads DROP COLUMN IF EXISTS mailing_city;
ALTER TABLE public.leads DROP COLUMN IF EXISTS mailing_state;
ALTER TABLE public.leads DROP COLUMN IF EXISTS mailing_zip;

-- Remove phone_1 and email_1 (have phone_number and email instead)
ALTER TABLE public.leads DROP COLUMN IF EXISTS phone_1;
ALTER TABLE public.leads DROP COLUMN IF EXISTS email_1;

-- Make owner_full_name a generated column from first and last name
ALTER TABLE public.leads DROP COLUMN IF EXISTS owner_full_name;
ALTER TABLE public.leads ADD COLUMN owner_full_name TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN owner_first_name IS NOT NULL AND owner_last_name IS NOT NULL 
      THEN owner_first_name || ' ' || owner_last_name
    WHEN owner_first_name IS NOT NULL 
      THEN owner_first_name
    WHEN owner_last_name IS NOT NULL 
      THEN owner_last_name
    ELSE NULL
  END
) STORED;