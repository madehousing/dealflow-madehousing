import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface DuplicateDetailsTableProps {
  duplicates: any[];
}

export const DuplicateDetailsTable = ({ duplicates }: DuplicateDetailsTableProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [campaignNames, setCampaignNames] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const displayedDuplicates = duplicates.slice(0, 4);
  const ITEMS_PER_PAGE = 50;
  
  const totalPages = Math.ceil(duplicates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDuplicates = duplicates.slice(startIndex, endIndex);

  useEffect(() => {
    const fetchCampaignNames = async () => {
      const campaignIds = [...new Set(duplicates.map(d => d.matched_campaign_id).filter(Boolean))];
      
      if (campaignIds.length === 0) {
        setCampaignNames({});
        return;
      }

      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("id, campaign_name")
        .in("id", campaignIds);

      if (error) {
        console.error("Error fetching campaign names:", error);
        // Set all campaign IDs to "Unknown" if fetch fails
        const unknownMap = campaignIds.reduce((acc, id) => {
          acc[id] = "Unknown Campaign";
          return acc;
        }, {} as Record<string, string>);
        setCampaignNames(unknownMap);
        return;
      }

      if (campaigns) {
        const namesMap = campaigns.reduce((acc, campaign) => {
          acc[campaign.id] = campaign.campaign_name;
          return acc;
        }, {} as Record<string, string>);
        
        // For any campaign IDs that weren't found, mark as "Unknown"
        campaignIds.forEach(id => {
          if (!namesMap[id]) {
            namesMap[id] = "Unknown Campaign";
          }
        });
        
        setCampaignNames(namesMap);
      }
    };

    fetchCampaignNames();
  }, [duplicates]);

  const renderTableRow = (duplicate: any, index: number) => {
    const fullAddress = [
      duplicate.original_address,
      duplicate.city,
      duplicate.state,
      duplicate.zip_code
    ].filter(Boolean).join(", ");
    
    const ownerName = [duplicate.owner_first_name, duplicate.owner_last_name]
      .filter(Boolean)
      .join(" ") || "N/A";

    const campaignName = duplicate.matched_campaign_id 
      ? (campaignNames[duplicate.matched_campaign_id] || "Loading...") 
      : "Unknown";

    return (
      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
        <td className="px-2 md:px-4 py-3 text-xs md:text-sm font-mono">
          {duplicate.parcel_id || "N/A"}
        </td>
        <td className="px-2 md:px-4 py-3 text-xs md:text-sm">{fullAddress}</td>
        <td className="px-2 md:px-4 py-3 text-xs md:text-sm hidden sm:table-cell">{ownerName}</td>
        <td className="px-2 md:px-4 py-3 text-xs md:text-sm">
          <Badge variant="default" className="bg-primary text-xs">
            {campaignName}
          </Badge>
        </td>
        <td className="px-2 md:px-4 py-3 text-xs md:text-sm hidden lg:table-cell">
          {duplicate.upload_date || new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </td>
      </tr>
    );
  };

  if (duplicates.length === 0) return null;

  return (
    <Card className="border-2">
      <CardContent className="p-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <span className="font-semibold">View Duplicate Details ({duplicates.length.toLocaleString()} records)</span>
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </button>

        {isExpanded && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-700 text-white">
                <tr>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium">PARCEL ID</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium">PROPERTY ADDRESS</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium hidden sm:table-cell">OWNER NAME</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium">MATCHED TO CAMPAIGN</th>
                  <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium hidden lg:table-cell">ORIGINAL UPLOAD DATE</th>
                </tr>
              </thead>
              <tbody>
                {displayedDuplicates.map((duplicate, index) => renderTableRow(duplicate, index))}
              </tbody>
            </table>
            {duplicates.length > 4 && (
              <div className="flex flex-col items-center gap-3 py-4 bg-slate-50">
                <div className="text-sm text-muted-foreground italic">
                  Showing first 4 of {duplicates.length.toLocaleString()} duplicates
                </div>
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View All Duplicates
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle>All Duplicate Leads ({duplicates.length.toLocaleString()} records)</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto">
                      <table className="w-full min-w-[640px]">
                        <thead className="bg-slate-700 text-white sticky top-0">
                          <tr>
                            <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium">PARCEL ID</th>
                            <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium">PROPERTY ADDRESS</th>
                            <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium hidden sm:table-cell">OWNER NAME</th>
                            <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium">MATCHED TO CAMPAIGN</th>
                            <th className="px-2 md:px-4 py-3 text-left text-xs md:text-sm font-medium hidden lg:table-cell">ORIGINAL UPLOAD DATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedDuplicates.map((duplicate, index) => renderTableRow(duplicate, startIndex + index))}
                        </tbody>
                      </table>
                    </div>
                    <div className="border-t pt-4">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setCurrentPage(pageNum)}
                                  isActive={currentPage === pageNum}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          })}
                          <PaginationItem>
                            <PaginationNext 
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                      <div className="text-center text-sm text-muted-foreground mt-2">
                        Page {currentPage} of {totalPages} ({startIndex + 1}-{Math.min(endIndex, duplicates.length)} of {duplicates.length.toLocaleString()} duplicates)
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
