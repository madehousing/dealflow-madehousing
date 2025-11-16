-- This migration ensures all tables exist and triggers types generation
DO $$ 
BEGIN
  -- Tables will be created if they don't exist (handled by IF NOT EXISTS in previous migration)
  
  -- Drop and recreate policies to ensure they match our requirements
  DROP POLICY IF EXISTS "Users can view all properties" ON public.properties;
  DROP POLICY IF EXISTS "Users can insert properties" ON public.properties;
  DROP POLICY IF EXISTS "Users can view all contact information" ON public.contact_information;
  DROP POLICY IF EXISTS "Users can insert contact information" ON public.contact_information;
  DROP POLICY IF EXISTS "Users can view their own import history" ON public.import_history;
  DROP POLICY IF EXISTS "Users can insert their own import history" ON public.import_history;

  -- Recreate policies
  CREATE POLICY "Users can view all properties"
    ON public.properties FOR SELECT
    USING (true);

  CREATE POLICY "Users can insert properties"
    ON public.properties FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Users can view all contact information"
    ON public.contact_information FOR SELECT
    USING (true);

  CREATE POLICY "Users can insert contact information"
    ON public.contact_information FOR INSERT
    WITH CHECK (true);

  CREATE POLICY "Users can view their own import history"
    ON public.import_history FOR SELECT
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can insert their own import history"
    ON public.import_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);
END $$;