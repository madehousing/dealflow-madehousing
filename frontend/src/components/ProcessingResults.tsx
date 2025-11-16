import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Download,
  Save,
  Upload,
  RefreshCcw,
  Sparkles,
  BarChart3,
  Lightbulb,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { DuplicateDetailsTable } from "./DuplicateDetailsTable";

interface ProcessingResultsProps {
  data: {
    totalRecords: number;
    duplicatesFound: number;
    newLeadsCount: number;
    invalidLeadsCount: number;
    skipTraceSavings: number;
    duplicates: any[];
    invalidLeads: any[];
  };
  onDownloadCSV: () => void;
  onDownloadDuplicatesCSV: () => void;
  onDownloadInvalidLeadsCSV: () => void;
  onSaveToDatabase: () => void;
  isSaving?: boolean;
}
export const ProcessingResults = ({
  data,
  onDownloadCSV,
  onDownloadDuplicatesCSV,
  onDownloadInvalidLeadsCSV,
  onSaveToDatabase,
  isSaving,
}: ProcessingResultsProps) => {
  const duplicateRate = Math.round((data.duplicatesFound / data.totalRecords) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold">Processing Results</h2>
          <Badge variant="default" className="mt-1">
            PHASE 1
          </Badge>
        </div>
      </div>

      {/* Invalid Leads Warning */}
      {data.invalidLeadsCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>⚠️ {data.invalidLeadsCount} Invalid Leads Detected</AlertTitle>
          <AlertDescription>
            <span className="mr-2">
              These leads are missing required fields (city, state, zip, or address) and will be excluded from the
              import.
            </span>
            <Button onClick={onDownloadInvalidLeadsCSV} variant="outline" size="sm" className="mt-2 ml-0">
              <Download className="mr-2 h-4 w-4" />
              Download Invalid Leads Report
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-2">
          <CardContent className="pt-6 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">TOTAL RECORDS UPLOADED</p>
            <p className="text-4xl font-bold">{data.totalRecords.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning border-2">
          <CardContent className="pt-6 text-center">
            <RefreshCcw className="h-10 w-10 text-warning-foreground mx-auto mb-3" />
            <p className="text-xs text-warning-foreground uppercase tracking-wide mb-2">DUPLICATES FOUND</p>
            <p className="text-4xl font-bold text-warning-foreground">{data.duplicatesFound.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-success/10 border-success border-2">
          <CardContent className="pt-6 text-center">
            <Sparkles className="h-10 w-10 text-success mx-auto mb-3" />
            <p className="text-xs text-success uppercase tracking-wide mb-2">NEW LEADS</p>
            <p className="text-4xl font-bold text-success">{data.newLeadsCount.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/10 border-warning border-2">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-10 w-10 text-warning-foreground mx-auto mb-3" />
            <p className="text-xs text-warning-foreground uppercase tracking-wide mb-2">DUPLICATE RATE</p>
            <p className="text-4xl font-bold text-warning-foreground">{duplicateRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-warning/10 border-warning/20">
        <Lightbulb className="h-5 w-5 text-warning-foreground" />
        <AlertDescription className="text-warning-foreground">
          <strong>💡 About Duplicate Rate</strong>
          <br />
          This shows what percentage of your upload was duplicates. Track this over time to evaluate data provider
          quality. Goal: Get duplicate rate under 30% by improving lead sources and list management.
        </AlertDescription>
      </Alert>

      <DuplicateDetailsTable duplicates={data.duplicates} />

      <Alert className="bg-primary/10 border-primary/20">
        <Lightbulb className="h-5 w-5 text-primary" />
        <AlertDescription className="text-primary/80">
          <strong className="text-slate-950">🔍 Why View Duplicates?</strong>
          <br />
          This lets you verify the system is working correctly and identify which campaigns are producing duplicates.
          Use this to evaluate data provider quality and catch any false positives.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={onDownloadCSV}
          size="lg"
          className="w-full bg-success hover:bg-success/90 text-success-foreground"
        >
          <Download className="mr-2 h-5 w-5" />
          Download New Leads CSV ({data.newLeadsCount.toLocaleString()} records)
        </Button>

        <Button onClick={onDownloadDuplicatesCSV} variant="secondary" size="lg" className="w-full">
          <FileText className="mr-2 h-5 w-5" />
          Download Duplicate Report CSV ({data.duplicatesFound.toLocaleString()} records)
        </Button>
      </div>

      <Alert className="bg-warning/10 border-warning/20">
        <Lightbulb className="h-5 w-5 text-warning-foreground" />
        <AlertDescription className="text-warning-foreground">
          <strong>⚠️ Don't forget to save to database!</strong>
          <br />
          Downloads are just for your records. Click "Save New Leads to Database" below to add these{" "}
          {data.newLeadsCount.toLocaleString()} leads to Lead Engine OS.
        </AlertDescription>
      </Alert>

      <Button onClick={onSaveToDatabase} size="lg" className="w-full" disabled={isSaving}>
        <Save className="mr-2 h-5 w-5" />
        {isSaving ? "Saving to Database..." : "Save New Leads to Database"}
      </Button>
    </div>
  );
};
