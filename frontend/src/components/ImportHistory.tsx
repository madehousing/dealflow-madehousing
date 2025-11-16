import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface CampaignRecord {
  id: string;
  campaign_name: string;
  lead_source: string;
  data_provider: string;
  campaign_version: string;
  total_records: number;
  duplicates_found: number;
  new_leads_count: number;
  skip_trace_savings: number;
  upload_date: string;
  status: string;
}

const ImportHistory = () => {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("upload_date", { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No campaigns yet. Upload your first file to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campaign Name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">New Leads</TableHead>
              <TableHead className="text-right">Duplicates</TableHead>
              <TableHead className="text-right">Savings</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell className="font-medium">
                  <div>{campaign.campaign_name}</div>
                  <div className="text-xs text-muted-foreground">{campaign.campaign_version}</div>
                </TableCell>
                <TableCell>
                  <div>{campaign.lead_source}</div>
                  {campaign.data_provider && (
                    <div className="text-xs text-muted-foreground">{campaign.data_provider}</div>
                  )}
                </TableCell>
                <TableCell className="text-right">{campaign.total_records}</TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  {campaign.new_leads_count}
                </TableCell>
                <TableCell className="text-right text-yellow-600 font-medium">
                  {campaign.duplicates_found}
                </TableCell>
                <TableCell className="text-right text-blue-600 font-medium">
                  ${campaign.skip_trace_savings.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(campaign.upload_date), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ImportHistory;
