import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, AlertCircle } from "lucide-react";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  newLeadsAdded: number;
  duplicatesFiltered: number;
  invalidLeadsCount: number;
  failedLeadsCount: number;
  totalProcessed: number;
  duplicateRate: number;
  uploadTime: string;
  onUploadAnother: () => void;
  onViewCampaigns: () => void;
  onDownloadFailedLeads?: () => void;
  onDownloadInvalidLeads?: () => void;
}

export const SuccessDialog = ({
  open,
  onOpenChange,
  campaignName,
  newLeadsAdded,
  duplicatesFiltered,
  invalidLeadsCount,
  failedLeadsCount,
  totalProcessed,
  duplicateRate,
  uploadTime,
  onUploadAnother,
  onViewCampaigns,
  onDownloadFailedLeads,
  onDownloadInvalidLeads,
}: SuccessDialogProps) => {
  const hasIssues = failedLeadsCount > 0 || invalidLeadsCount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className={`${hasIssues ? 'bg-warning/10' : 'bg-success/10'} rounded-lg p-8 text-center space-y-6`}>
          <div className="flex justify-center">
            <div className={`rounded-full ${hasIssues ? 'bg-warning/20' : 'bg-success/20'} p-4`}>
              {hasIssues ? (
                <AlertCircle className="h-16 w-16 text-warning" />
              ) : (
                <CheckCircle2 className="h-16 w-16 text-success" />
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              {hasIssues ? (
                <AlertCircle className="h-6 w-6 text-warning" />
              ) : (
                <CheckCircle2 className="h-6 w-6 text-success" />
              )}
              <h2 className="text-2xl font-bold">
                {hasIssues ? 'Import Completed with Issues' : 'Success! Leads Saved to Database'}
              </h2>
            </div>
            <Badge variant="default" className={hasIssues ? 'bg-warning hover:bg-warning' : 'bg-success hover:bg-success'}>
              {hasIssues ? 'PARTIAL SUCCESS' : 'SUCCESS'}
            </Badge>
          </div>

          <p className="text-muted-foreground">
            {newLeadsAdded.toLocaleString()} new leads have been successfully added to Lead Engine OS
            {hasIssues && ` (${failedLeadsCount + invalidLeadsCount} leads excluded)`}
          </p>

          <div className="bg-card rounded-lg p-6 space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign Name:</span>
              <span className="font-medium">{campaignName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Processed:</span>
              <span className="font-medium">{totalProcessed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">✅ Successfully Saved:</span>
              <span className="font-medium text-success">{newLeadsAdded.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">🔄 Duplicates Filtered:</span>
              <span className="font-medium">{duplicatesFiltered.toLocaleString()}</span>
            </div>
            {invalidLeadsCount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">⚠️ Invalid (Missing Data):</span>
                <span className="font-medium text-warning">{invalidLeadsCount.toLocaleString()}</span>
              </div>
            )}
            {failedLeadsCount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">❌ Failed to Save:</span>
                <span className="font-medium text-destructive">{failedLeadsCount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duplicate Rate:</span>
              <span className="font-medium">{duplicateRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Upload Time:</span>
              <span className="font-medium">{uploadTime}</span>
            </div>
          </div>

          {/* Download Reports for Issues */}
          {hasIssues && (
            <div className="space-y-2">
              {failedLeadsCount > 0 && onDownloadFailedLeads && (
                <Button onClick={onDownloadFailedLeads} variant="outline" className="w-full" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Failed Leads Report ({failedLeadsCount})
                </Button>
              )}
              {invalidLeadsCount > 0 && onDownloadInvalidLeads && (
                <Button onClick={onDownloadInvalidLeads} variant="outline" className="w-full" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download Invalid Leads Report ({invalidLeadsCount})
                </Button>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button onClick={onUploadAnother} className="flex-1">
              Upload Another Campaign
            </Button>
            <Button onClick={onViewCampaigns} variant="outline" className="flex-1">
              View All Campaigns (Phase 2)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
