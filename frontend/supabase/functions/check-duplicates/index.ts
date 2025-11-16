import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lead {
  original_address: string;
  normalized_address: string;
  city: string;
  state: string;
  zip_code: string;
  parcel_id?: string;
  owner_full_name?: string;
  [key: string]: any;
}

interface DuplicateCheckRequest {
  leads: Lead[];
  market_state: string;
  parcel_id_type: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { leads, market_state, parcel_id_type }: DuplicateCheckRequest = await req.json();

    console.log(`Processing ${leads.length} leads for duplicate detection in ${market_state}`);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendProgress = (data: any) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const results = {
            newLeads: [] as Lead[],
            duplicates: [] as any[],
            invalidLeads: [] as Lead[],
          };

          // Process in chunks for efficiency
          const CHUNK_SIZE = 500;
          const totalChunks = Math.ceil(leads.length / CHUNK_SIZE);
          
          for (let i = 0; i < leads.length; i += CHUNK_SIZE) {
            const chunk = leads.slice(i, i + CHUNK_SIZE);
            const chunkNumber = Math.floor(i / CHUNK_SIZE) + 1;
            
            console.log(`Processing chunk ${chunkNumber} of ${totalChunks}`);
            
            // Send progress update
            sendProgress({
              type: 'progress',
              current: chunkNumber,
              total: totalChunks,
              processed: Math.min(i + CHUNK_SIZE, leads.length),
              totalLeads: leads.length
            });

            // Separate leads with parcel IDs from those without
            const leadsWithParcelId = chunk.filter(l => l.parcel_id && l.parcel_id.trim() !== '');
            const leadsWithoutParcelId = chunk.filter(l => !l.parcel_id || l.parcel_id.trim() === '');

            // Check parcel ID duplicates (fast indexed query)
            let parcelDuplicateMap = new Map<string, any>();
            if (leadsWithParcelId.length > 0) {
              const parcelIds = leadsWithParcelId.map(l => l.parcel_id).filter(Boolean);
              
              const { data: parcelDupes, error: parcelError } = await supabase
                .from('leads')
                .select('parcel_id, id, campaign_id, original_address, city, state, zip_code, created_at')
                .in('parcel_id', parcelIds)
                .eq('state', market_state)
                .eq('is_deleted', false)
                .order('created_at', { ascending: true });

              if (parcelError) {
                console.error('Error fetching parcel duplicates:', parcelError);
              } else if (parcelDupes) {
                // Build map of parcel_id to existing lead
                parcelDupes.forEach(dupe => {
                  if (!parcelDuplicateMap.has(dupe.parcel_id)) {
                    parcelDuplicateMap.set(dupe.parcel_id, dupe);
                  }
                });
              }
            }

            // Check address duplicates (for leads without parcel ID or not found by parcel)
            let addressDuplicateMap = new Map<string, any>();
            if (leadsWithoutParcelId.length > 0) {
              // Build address lookup query
              const addressFilters = leadsWithoutParcelId.map(l => ({
                normalized_address: l.normalized_address,
                city: l.city,
                state: l.state,
                zip_code: l.zip_code,
              }));

              // Query for address matches in batches
              for (const addressFilter of addressFilters) {
                const { data: addressDupes, error: addressError } = await supabase
                  .from('leads')
                  .select('normalized_address, city, state, zip_code, id, campaign_id, original_address, created_at')
                  .eq('normalized_address', addressFilter.normalized_address)
                  .eq('city', addressFilter.city)
                  .eq('state', addressFilter.state)
                  .eq('zip_code', addressFilter.zip_code)
                  .eq('is_deleted', false)
                  .order('created_at', { ascending: true })
                  .limit(1);

                if (addressError) {
                  console.error('Error fetching address duplicates:', addressError);
                } else if (addressDupes && addressDupes.length > 0) {
                  const key = `${addressFilter.normalized_address}|${addressFilter.city}|${addressFilter.state}|${addressFilter.zip_code}`;
                  addressDuplicateMap.set(key, addressDupes[0]);
                }
              }
            }

            // Categorize each lead in chunk
            for (const lead of chunk) {
              // Validate required fields
              if (!lead.original_address || !lead.city || !lead.state || !lead.zip_code) {
                results.invalidLeads.push(lead);
                continue;
              }

              let isDuplicate = false;
              let matchedLead = null;
              let matchType = '';

              // Check parcel ID duplicate first
              if (lead.parcel_id && lead.parcel_id.trim() !== '') {
                matchedLead = parcelDuplicateMap.get(lead.parcel_id);
                if (matchedLead) {
                  isDuplicate = true;
                  matchType = 'parcel_id';
                }
              }

              // Check address duplicate if not found by parcel
              if (!isDuplicate) {
                const addressKey = `${lead.normalized_address}|${lead.city}|${lead.state}|${lead.zip_code}`;
                matchedLead = addressDuplicateMap.get(addressKey);
                if (matchedLead) {
                  isDuplicate = true;
                  matchType = 'address';
                }
              }

              if (isDuplicate && matchedLead) {
                results.duplicates.push({
                  ...lead,
                  duplicate_of_lead_id: matchedLead.id,
                  duplicate_of_campaign_id: matchedLead.campaign_id,
                  match_type: matchType,
                  matched_on: matchType === 'parcel_id' ? lead.parcel_id : `${lead.normalized_address}, ${lead.city}, ${lead.state} ${lead.zip_code}`,
                });
              } else {
                results.newLeads.push(lead);
              }
            }
          }

          const summary = {
            total: leads.length,
            new: results.newLeads.length,
            duplicates: results.duplicates.length,
            invalid: results.invalidLeads.length,
          };

          console.log('Duplicate detection complete:', summary);

          // Send final results
          sendProgress({
            type: 'complete',
            ...results,
            summary
          });

          controller.close();
        } catch (error) {
          console.error('Error in streaming duplicate check:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: errorMessage })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error processing duplicate check request:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
