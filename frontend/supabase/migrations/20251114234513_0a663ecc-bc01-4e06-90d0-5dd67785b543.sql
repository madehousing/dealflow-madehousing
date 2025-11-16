-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can view leads from their campaigns" ON public.leads;
DROP POLICY IF EXISTS "Users can view duplicate logs from their campaigns" ON public.duplicate_log;

-- Create new policies allowing all authenticated users to view all data
CREATE POLICY "Authenticated users can view all campaigns"
ON public.campaigns
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can view all duplicate logs"
ON public.duplicate_log
FOR SELECT
TO authenticated
USING (true);

-- Keep insert/update policies that still record the user_id for audit purposes
-- but allow any authenticated user to perform these operations
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;

CREATE POLICY "Authenticated users can insert campaigns"
ON public.campaigns
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all campaigns"
ON public.campaigns
FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update leads from their campaigns" ON public.leads;

CREATE POLICY "Authenticated users can insert leads"
ON public.leads
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update all leads"
ON public.leads
FOR UPDATE
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Users can insert duplicate logs" ON public.duplicate_log;

CREATE POLICY "Authenticated users can insert duplicate logs"
ON public.duplicate_log
FOR INSERT
TO authenticated
WITH CHECK (true);