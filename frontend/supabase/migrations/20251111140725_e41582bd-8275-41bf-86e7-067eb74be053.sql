-- Drop existing tables and recreate with new schema
DROP TABLE IF EXISTS public.contact_information CASCADE;
DROP TABLE IF EXISTS public.import_history CASCADE;
DROP TABLE IF EXISTS public.properties CASCADE;

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  lead_source TEXT,
  data_provider TEXT,
  campaign_version TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_records INTEGER DEFAULT 0,
  duplicates_found INTEGER DEFAULT 0,
  new_leads_count INTEGER DEFAULT 0,
  skip_trace_savings DECIMAL(10, 2) DEFAULT 0,
  total_called INTEGER DEFAULT 0,
  total_contacted INTEGER DEFAULT 0,
  total_interested INTEGER DEFAULT 0,
  total_deals INTEGER DEFAULT 0,
  roi_score DECIMAL(10, 2) DEFAULT 0,
  cost_per_lead DECIMAL(10, 2) DEFAULT 0,
  cost_per_deal DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leads table (combining properties and contact_information)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  original_address TEXT NOT NULL,
  normalized_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  apn TEXT,
  owner_full_name TEXT,
  owner_first_name TEXT,
  owner_last_name TEXT,
  owner_mailing_address TEXT,
  mailing_street TEXT,
  mailing_city TEXT,
  mailing_state TEXT,
  mailing_zip TEXT,
  phone_1 TEXT,
  phone_2 TEXT,
  phone_3 TEXT,
  phone_4 TEXT,
  phone_5 TEXT,
  email_1 TEXT,
  email_2 TEXT,
  email_3 TEXT,
  email_4 TEXT,
  group_list TEXT,
  status TEXT DEFAULT 'new',
  last_contact_date TIMESTAMP WITH TIME ZONE,
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create duplicate_log table
CREATE TABLE public.duplicate_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  original_lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  match_type TEXT,
  match_confidence DECIMAL(3, 2)
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_log ENABLE ROW LEVEL SECURITY;

-- Create policies for campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for leads
CREATE POLICY "Users can view leads from their campaigns"
  ON public.leads FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    ) OR campaign_id IS NULL
  );

CREATE POLICY "Users can insert leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    ) OR campaign_id IS NULL
  );

CREATE POLICY "Users can update leads from their campaigns"
  ON public.leads FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  );

-- Create policies for duplicate_log
CREATE POLICY "Users can view duplicate logs from their campaigns"
  ON public.duplicate_log FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert duplicate logs"
  ON public.duplicate_log FOR INSERT
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM public.campaigns WHERE user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();