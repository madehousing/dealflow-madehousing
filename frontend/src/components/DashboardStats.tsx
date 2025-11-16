import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";

interface Stats {
  thisWeek: { new: number; dupes: number; total: number };
  thisMonth: { new: number; dupes: number; total: number };
  yearToDate: { new: number; dupes: number; total: number };
  totalDatabase: number;
  overallDuplicateRate: number;
}

export const DashboardStats = () => {
  const [stats, setStats] = useState<Stats>({
    thisWeek: { new: 0, dupes: 0, total: 0 },
    thisMonth: { new: 0, dupes: 0, total: 0 },
    yearToDate: { new: 0, dupes: 0, total: 0 },
    totalDatabase: 0,
    overallDuplicateRate: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Get total leads count
      const { count: totalDatabase } = await supabase.from("leads").select("*", { count: "exact", head: true });

      // Count actual unique leads added in each time period
      const { count: weekLeadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfWeek.toISOString());

      const { count: monthLeadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      const { count: yearLeadsCount } = await supabase
        .from("leads")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfYear.toISOString());

      // Get campaign data for uploaded records and duplicates
      const { data: weekCampaigns } = await supabase
        .from("campaigns")
        .select("total_records, duplicates_found")
        .gte("upload_date", startOfWeek.toISOString());

      const { data: monthCampaigns } = await supabase
        .from("campaigns")
        .select("total_records, duplicates_found")
        .gte("upload_date", startOfMonth.toISOString());

      const { data: yearCampaigns } = await supabase
        .from("campaigns")
        .select("total_records, duplicates_found")
        .gte("upload_date", startOfYear.toISOString());

      const calcStats = (actualLeads: number, campaigns: any[]) => {
        const totalUploaded = campaigns?.reduce((sum, c) => sum + (c.total_records || 0), 0) || 0;
        const totalDupes = campaigns?.reduce((sum, c) => sum + (c.duplicates_found || 0), 0) || 0;
        return {
          new: actualLeads || 0,
          dupes: totalDupes,
          total: totalUploaded,
        };
      };

      const thisWeek = calcStats(weekLeadsCount || 0, weekCampaigns || []);
      const thisMonth = calcStats(monthLeadsCount || 0, monthCampaigns || []);
      const yearToDate = calcStats(yearLeadsCount || 0, yearCampaigns || []);

      const overallDuplicateRate = yearToDate.total > 0 ? Math.round((yearToDate.dupes / yearToDate.total) * 100) : 0;

      setStats({
        thisWeek,
        thisMonth,
        yearToDate,
        totalDatabase: totalDatabase || 0,
        overallDuplicateRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Home className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-3xl font-bold">Lead Engine OS</h2>
          <p className="text-muted-foreground">MadeHousing Lead Management System</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">THIS WEEK</p>
            <p className="text-5xl font-bold mb-2">{stats.thisWeek.new.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {stats.thisWeek.new.toLocaleString()} new + {stats.thisWeek.dupes.toLocaleString()} dupes 
              {stats.thisWeek.total > 0 && ` (${Math.round((stats.thisWeek.dupes / stats.thisWeek.total) * 100)}%)`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">THIS MONTH</p>
            <p className="text-5xl font-bold mb-2">{stats.thisMonth.new.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {stats.thisMonth.new.toLocaleString()} new + {stats.thisMonth.dupes.toLocaleString()} dupes
              {stats.thisMonth.total > 0 && ` (${Math.round((stats.thisMonth.dupes / stats.thisMonth.total) * 100)}%)`}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">YEAR-TO-DATE</p>
            <p className="text-5xl font-bold mb-2">{stats.yearToDate.new.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">
              {stats.yearToDate.new.toLocaleString()} new + {stats.yearToDate.dupes.toLocaleString()} dupes
              {stats.yearToDate.total > 0 && ` (${Math.round((stats.yearToDate.dupes / stats.yearToDate.total) * 100)}%)`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">TOTAL DATABASE</p>
            <p className="text-5xl font-bold">{stats.totalDatabase.toLocaleString()} leads</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">OVERALL DUPLICATE RATE</p>
            <p className="text-5xl font-bold text-destructive">{stats.overallDuplicateRate}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
