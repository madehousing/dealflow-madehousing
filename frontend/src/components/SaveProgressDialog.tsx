import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface SaveProgressDialogProps {
  open: boolean;
  progress: {
    total: number;
    saved: number;
    failed: number;
    currentBatch: number;
    totalBatches: number;
    isProcessing: boolean;
  };
}

export const SaveProgressDialog = ({
  open,
  progress,
}: SaveProgressDialogProps) => {
  const percentComplete = progress.total > 0
    ? Math.round(((progress.saved + progress.failed) / progress.total) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">Saving Leads to Database</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{percentComplete}%</span>
              </div>
              <Progress value={percentComplete} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-lg p-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Leads
                </p>
                <p className="text-2xl font-bold">{progress.total.toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Current Batch
                </p>
                <p className="text-2xl font-bold">
                  {progress.currentBatch} / {progress.totalBatches}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm">Successfully Saved</span>
                </div>
                <span className="font-semibold text-success">
                  {progress.saved.toLocaleString()}
                </span>
              </div>

              {progress.failed > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm">Failed</span>
                  </div>
                  <span className="font-semibold text-destructive">
                    {progress.failed.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Please wait while we save your leads...
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
