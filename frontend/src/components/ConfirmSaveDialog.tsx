import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ConfirmSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignName: string;
  leadSource: string;
  newLeadsCount: number;
  duplicatesFound: number;
  onConfirm: () => void;
}

export const ConfirmSaveDialog = ({
  open,
  onOpenChange,
  campaignName,
  leadSource,
  newLeadsCount,
  duplicatesFound,
  onConfirm,
}: ConfirmSaveDialogProps) => {
  const duplicateRate = Math.round((duplicatesFound / (newLeadsCount + duplicatesFound)) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">🏠</span> Confirm Save to Database
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You are about to add <strong className="text-foreground">{newLeadsCount.toLocaleString()} new leads</strong> to your Lead Engine OS database. This action cannot be undone.
          </p>

          <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign:</span>
              <span className="font-medium">{campaignName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lead Source:</span>
              <span className="font-medium">{leadSource}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">New Leads:</span>
              <span className="font-medium">{newLeadsCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duplicates Filtered:</span>
              <span className="font-medium">{duplicatesFound.toLocaleString()} ({duplicateRate}%)</span>
            </div>
          </div>

          <Alert className="bg-warning/10 border-warning/20">
            <AlertTriangle className="h-4 w-4 text-warning-foreground" />
            <AlertDescription className="text-warning-foreground text-sm">
              <strong>Important:</strong> Make sure you've downloaded your clean CSV before proceeding.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-success hover:bg-success/90">
              Yes, Save to Database
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
