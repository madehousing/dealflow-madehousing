-- Remove the NULL campaign_id allowance from leads policies
DROP POLICY IF EXISTS "Users can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Users can view leads from their campaigns" ON public.leads;

-- Recreate INSERT policy without NULL campaign_id allowance
CREATE POLICY "Users can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (campaign_id IN (
  SELECT campaigns.id
  FROM campaigns
  WHERE campaigns.user_id = auth.uid()
));

-- Recreate SELECT policy without NULL campaign_id allowance
CREATE POLICY "Users can view leads from their campaigns"
ON public.leads
FOR SELECT
USING (campaign_id IN (
  SELECT campaigns.id
  FROM campaigns
  WHERE campaigns.user_id = auth.uid()
));

-- Make campaign_id NOT NULL to enforce ownership at schema level
ALTER TABLE public.leads
ALTER COLUMN campaign_id SET NOT NULL;