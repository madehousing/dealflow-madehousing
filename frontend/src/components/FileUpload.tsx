import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessingResults } from "./ProcessingResults";
import { ConfirmSaveDialog } from "./ConfirmSaveDialog";
import { SuccessDialog } from "./SuccessDialog";
import { ColumnMappingDialog } from "./ColumnMappingDialog";
import { MarketSelector } from "./MarketSelector";
import { SaveProgressDialog } from "./SaveProgressDialog";
import type { ColumnMapping } from "@/types/mappings";

interface ProcessedData {
  newLeads: any[];
  duplicates: any[];
  invalidLeads: any[];
  totalRecords: number;
  duplicatesFound: number;
  newLeadsCount: number;
  invalidLeadsCount: number;
  skipTraceSavings: number;
}

interface Market {
  id: number;
  market_code: string;
  market_name: string;
  state: string;
  state_full: string;
  parcel_id_type: string;
  parcel_id_format: string;
}

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState("");
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [leadSource, setLeadSource] = useState("");
  const [dataProvider, setDataProvider] = useState("");
  const [campaignVersion, setCampaignVersion] = useState("V1");
  const [campaignNameValid, setCampaignNameValid] = useState(true);
  const [saveProgress, setSaveProgress] = useState({
    total: 0,
    saved: 0,
    failed: 0,
    currentBatch: 0,
    totalBatches: 0,
    isProcessing: false,
  });
  const [failedLeads, setFailedLeads] = useState<Array<{ lead: any; error: string }>>([]);
  const { toast } = useToast();

  // Validate campaign name format: PREFIX_TYPE_YYYY-MM_VX
  const validateCampaignName = (name: string): boolean => {
    const pattern = /^[A-Z]{2,4}_[A-Za-z]+_\d{4}-(0[1-9]|1[0-2])_V\d+$/;
    return pattern.test(name);
  };

  const handleCampaignNameChange = (value: string) => {
    setCampaignName(value);
    if (value) {
      setCampaignNameValid(validateCampaignName(value));
    } else {
      setCampaignNameValid(true);
    }
  };

  const formatParcelId = (parcelId: string, parcelIdType: string): string => {
    if (!parcelId) return "";
    const cleaned = parcelId.replace(/[-\s]/g, "");
    
    if (parcelIdType === 'Tax Key Number' && cleaned.length === 10 && /^\d+$/.test(cleaned)) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 10)}`;
    }
    
    return parcelId;
  };

  const normalizeAddress = (address: string): string => {
    if (!address) return "";
    return address
      .toUpperCase()
      .replace(/\bSTREET\b/g, "ST")
      .replace(/\bDRIVE\b/g, "DR")
      .replace(/\bAVENUE\b/g, "AVE")
      .replace(/\bBOULEVARD\b/g, "BLVD")
      .replace(/\bROAD\b/g, "RD")
      .replace(/\bLANE\b/g, "LN")
      .replace(/\bCOURT\b/g, "CT")
      .replace(/\bCIRCLE\b/g, "CIR")
      .replace(/\bPLACE\b/g, "PL")
      .trim();
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      parseFileHeaders(file);
    }
  };

  const parseFileHeaders = (file: File) => {
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (fileExt === 'csv') {
      Papa.parse(file, {
        header: true,
        preview: 1,
        complete: (results) => {
          setCsvHeaders(results.meta.fields || []);
          parseFullFile(file);
        },
        error: (error) => {
          toast({
            title: "Error parsing CSV",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        
        if (jsonData.length > 0) {
          setCsvHeaders(jsonData[0] as string[]);
          const rows = XLSX.utils.sheet_to_json(firstSheet);
          setCsvData(rows);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const parseFullFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
      },
      error: (error) => {
        toast({
          title: "Error parsing CSV",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleMappingConfirmed = async (mappings: ColumnMapping[]) => {
    setColumnMappings(mappings);
    setShowMappingDialog(false);
    await processWithMappings(mappings);
  };

  const processWithMappings = async (mappings: ColumnMapping[]) => {
    if (!selectedMarket) {
      toast({
        title: "Market Required",
        description: "Please select a market before processing",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProcessingStatus("Preparing data for processing...");
    setProcessingProgress(10);

    try {
      // Create mapping lookup
      const mappingLookup = mappings.reduce((acc, m) => {
        acc[m.db_column] = m.csv_column;
        return acc;
      }, {} as Record<string, string>);

      setProcessingStatus("Mapping CSV data to leads...");
      setProcessingProgress(20);

      // Map CSV data to lead format
      const mappedLeads: any[] = csvData.map((row) => {
        const lead: any = {};
        
        // Map all fields
        Object.keys(mappingLookup).forEach(dbField => {
          const csvField = mappingLookup[dbField];
          lead[dbField] = row[csvField] || null;
        });

        // Auto-generate owner_full_name from first + last name
        if (lead.owner_first_name || lead.owner_last_name) {
          const firstName = (lead.owner_first_name || '').trim();
          const lastName = (lead.owner_last_name || '').trim();
          lead.owner_full_name = `${firstName} ${lastName}`.trim();
        }

        // Format parcel ID
        if (lead.parcel_id) {
          lead.parcel_id = formatParcelId(lead.parcel_id, selectedMarket.parcel_id_type);
          lead.parcel_id_type = selectedMarket.parcel_id_type;
        }

        // Add system fields
        lead.state = selectedMarket.state;
        lead.state_full = selectedMarket.state_full;
        lead.market = selectedMarket.market_code;
        lead.normalized_address = normalizeAddress(lead.original_address);
        lead.status = 'New';
        lead.sync_status = 'Not Synced';
        lead.skip_trace_status = 'Not Started';
        lead.contact_attempts = 0;

        return lead;
      });

      setProcessingStatus("Checking for duplicates (server-side)...");
      setProcessingProgress(40);

      // Call Edge Function with streaming for real-time progress updates
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `https://cucdnannkrwrjfdrmotk.supabase.co/functions/v1/check-duplicates`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({
            leads: mappedLeads,
            market_state: selectedMarket.state,
            parcel_id_type: selectedMarket.parcel_id_type,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Duplicate check failed: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let duplicateCheckResult: any = null;
      let buffer = '';

      if (!reader) {
        throw new Error('No response stream available');
      }

      // Process streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode chunk without flushing to handle split characters
        buffer += decoder.decode(value, { stream: true });
        
        // Split by double newline to get complete SSE messages
        const messages = buffer.split('\n\n');
        
        // Keep the last incomplete message in the buffer
        buffer = messages.pop() || '';

        for (const message of messages) {
          if (message.trim().startsWith('data: ')) {
            try {
              const jsonStr = message.trim().slice(6);
              const data = JSON.parse(jsonStr);
              
              if (data.type === 'progress') {
                // Update progress bar based on chunks processed
                const progress = 40 + Math.floor((data.current / data.total) * 50);
                setProcessingProgress(progress);
                setProcessingStatus(`Checking duplicates... (${data.processed}/${data.totalLeads} leads)`);
              } else if (data.type === 'complete') {
                duplicateCheckResult = data;
              } else if (data.type === 'error') {
                throw new Error(data.message);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE message:', message, parseError);
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim().startsWith('data: ')) {
        try {
          const jsonStr = buffer.trim().slice(6);
          const data = JSON.parse(jsonStr);
          if (data.type === 'complete') {
            duplicateCheckResult = data;
          }
        } catch (parseError) {
          console.error('Failed to parse final SSE message:', buffer, parseError);
        }
      }

      if (!duplicateCheckResult) {
        throw new Error('No results received from duplicate check');
      }

      console.log('Duplicate check summary:', duplicateCheckResult.summary);

      // Transform duplicates to match expected format
      const duplicates = duplicateCheckResult.duplicates.map((dup: any) => ({
        ...dup,
        original_lead_id: dup.duplicate_of_lead_id,
        original_status: 'Existing',
        matched_on: dup.match_type === 'parcel_id' ? 'Parcel ID + State' : 'Address Match',
        matched_campaign_id: dup.duplicate_of_campaign_id,
      }));

      setProcessingStatus("Processing complete!");
      setProcessingProgress(100);

      setProcessedData({
        newLeads: duplicateCheckResult.newLeads,
        duplicates,
        invalidLeads: duplicateCheckResult.invalidLeads,
        totalRecords: csvData.length,
        duplicatesFound: duplicates.length,
        newLeadsCount: duplicateCheckResult.newLeads.length,
        invalidLeadsCount: duplicateCheckResult.invalidLeads.length,
        skipTraceSavings: duplicates.length * 0.75,
      });

      toast({
        title: "Processing Complete",
        description: `Found ${duplicateCheckResult.newLeads.length} new leads and ${duplicates.length} duplicates`,
      });
    } catch (error: any) {
      toast({
        title: "Processing Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!processedData || !selectedMarket) return;

    // Close confirmation dialog
    setShowConfirmDialog(false);
    setIsSaving(true);
    let campaign: any = null;
    const startTime = Date.now();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userEmail = user?.email || 'unknown';

      // Create campaign record
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          campaign_name: campaignName,
          campaign_type: leadSource,
          campaign_version: campaignVersion,
          data_provider: dataProvider,
          state: selectedMarket.state,
          market: selectedMarket.market_code,
          total_records: processedData.totalRecords,
          new_leads_count: processedData.newLeadsCount,
          duplicates_found: processedData.duplicatesFound,
          duplicate_rate: (processedData.duplicatesFound / processedData.totalRecords) * 100,
          skip_trace_needed: processedData.newLeadsCount,
          skip_trace_savings: processedData.skipTraceSavings,
          file_name: selectedFile?.name,
          file_size_kb: selectedFile ? Math.round(selectedFile.size / 1024) : 0,
          status: 'active',
          user_id: user?.id || '',
          uploaded_by: userEmail,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;
      campaign = campaignData;

      // Initialize progress
      const batchSize = 100;
      const totalBatches = Math.ceil(processedData.newLeads.length / batchSize);
      const failedLeadsArray: Array<{ lead: any; error: string }> = [];
      let savedCount = 0;

      setSaveProgress({
        total: processedData.newLeadsCount,
        saved: 0,
        failed: 0,
        currentBatch: 0,
        totalBatches,
        isProcessing: true,
      });

      // Process each batch with resilient error handling
      for (let i = 0; i < processedData.newLeads.length; i += batchSize) {
        const batch = processedData.newLeads.slice(i, i + batchSize).map(lead => ({
          ...lead,
          campaign_id: campaign.id,
        }));

        const batchNumber = Math.floor(i / batchSize) + 1;

        // Try batch insert first (fast path)
        const { error: batchError } = await supabase.from('leads').insert(batch);

        if (!batchError) {
          // Batch succeeded
          savedCount += batch.length;
          setSaveProgress(prev => ({
            ...prev,
            saved: savedCount,
            currentBatch: batchNumber,
          }));
        } else {
          // Batch failed - fall back to individual processing for this batch only
          console.log(`Batch ${batchNumber} failed, processing individually...`);

          for (const lead of batch) {
            const { error: leadError } = await supabase.from('leads').insert([lead]);

            if (!leadError) {
              savedCount++;
              setSaveProgress(prev => ({ ...prev, saved: prev.saved + 1 }));
            } else {
              failedLeadsArray.push({
                lead,
                error: leadError.message,
              });
              setSaveProgress(prev => ({ ...prev, failed: prev.failed + 1 }));
            }
          }

          setSaveProgress(prev => ({ ...prev, currentBatch: batchNumber }));
        }
      }

      // Insert duplicate log
      if (processedData.duplicates.length > 0) {
        // Fetch original campaign details for duplicates
        const campaignIds = [...new Set(processedData.duplicates.map(d => d.matched_campaign_id).filter(Boolean))];
        const { data: originalCampaigns } = await supabase
          .from('campaigns')
          .select('id, campaign_name, upload_date')
          .in('id', campaignIds);
        
        const campaignMap = new Map(originalCampaigns?.map(c => [c.id, c]) || []);

        const duplicateLogs = processedData.duplicates.map(dup => {
          const originalCampaign = campaignMap.get(dup.matched_campaign_id);
          return {
            lead_id: null, // Duplicates are not saved as leads
            duplicate_parcel_id: dup.parcel_id,
            duplicate_address: dup.original_address,
            duplicate_owner_name: dup.owner_full_name,
            duplicate_state: dup.state,
            duplicate_market: dup.market,
            original_lead_id: dup.original_lead_id,
            original_status: dup.original_status,
            matched_on: dup.matched_on,
            match_type: dup.matched_on,
            campaign_id: campaign.id,
            original_campaign_name: originalCampaign?.campaign_name || 'Unknown',
            original_upload_date: originalCampaign?.upload_date || null,
          };
        });

        const { error: dupError } = await supabase.from('duplicate_log').insert(duplicateLogs);
        if (dupError) console.error('Error saving duplicate log:', dupError);
      }

      // Update campaign with processing time
      const endTime = Date.now();
      const processingTime = Math.round((endTime - startTime) / 1000);

      await supabase
        .from('campaigns')
        .update({ 
          processing_time_seconds: processingTime,
          new_leads_count: savedCount, // Update with actual saved count
        })
        .eq('id', campaign.id);

      setFailedLeads(failedLeadsArray);
      setSaveProgress(prev => ({ ...prev, isProcessing: false }));
      setIsSaving(false);
      setShowSuccessDialog(true);

      toast({
        title: "Import Complete",
        description: `Successfully saved ${savedCount} leads${failedLeadsArray.length > 0 ? `, ${failedLeadsArray.length} failed` : ''}`,
      });
    } catch (error: any) {
      setSaveProgress(prev => ({ ...prev, isProcessing: false }));
      setIsSaving(false);

      // If campaign was created, update its status to failed
      if (campaign?.id) {
        await supabase
          .from('campaigns')
          .update({ status: 'failed' })
          .eq('id', campaign.id);
      }

      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDownloadCSV = () => {
    if (!processedData) return;
    const csv = Papa.unparse(processedData.newLeads);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new_leads_${Date.now()}.csv`;
    a.click();
  };

  const handleDownloadDuplicatesCSV = () => {
    if (!processedData) return;
    const csv = Papa.unparse(processedData.duplicates);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duplicates_${Date.now()}.csv`;
    a.click();
  };

  const handleDownloadInvalidLeadsCSV = () => {
    if (!processedData) return;
    const csv = Papa.unparse(processedData.invalidLeads);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invalid_leads_${Date.now()}.csv`;
    a.click();
  };

  const handleDownloadFailedLeadsCSV = () => {
    const reportData = failedLeads.map(({ lead, error }) => ({
      ...lead,
      error_reason: error,
    }));
    const csv = Papa.unparse(reportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed_leads_${Date.now()}.csv`;
    a.click();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB limit
    multiple: false,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === 'file-too-large') {
            toast({
              title: "File too large",
              description: "Maximum file size is 50MB. Please upload a smaller file.",
              variant: "destructive",
            });
          } else if (err.code === 'file-invalid-type') {
            toast({
              title: "Invalid file type",
              description: "Only CSV and Excel files (.csv, .xlsx, .xls) are allowed.",
              variant: "destructive",
            });
          }
        });
      });
    },
  });

  if (processedData) {
    return (
      <>
        <ProcessingResults
          data={processedData}
          onDownloadCSV={handleDownloadCSV}
          onDownloadDuplicatesCSV={handleDownloadDuplicatesCSV}
          onDownloadInvalidLeadsCSV={handleDownloadInvalidLeadsCSV}
          onSaveToDatabase={() => setShowConfirmDialog(true)}
          isSaving={isSaving}
        />
        <ConfirmSaveDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onConfirm={handleSaveToDatabase}
          campaignName={campaignName}
          leadSource={leadSource}
          newLeadsCount={processedData.newLeadsCount}
          duplicatesFound={processedData.duplicatesFound}
        />
        <SaveProgressDialog
          open={saveProgress.isProcessing}
          progress={saveProgress}
        />
        <SuccessDialog
          open={showSuccessDialog}
          onOpenChange={setShowSuccessDialog}
          campaignName={campaignName}
          newLeadsAdded={saveProgress.saved}
          duplicatesFiltered={processedData.duplicatesFound}
          invalidLeadsCount={processedData.invalidLeadsCount}
          failedLeadsCount={saveProgress.failed}
          totalProcessed={processedData.totalRecords}
          duplicateRate={Math.round((processedData.duplicatesFound / processedData.totalRecords) * 100)}
          uploadTime={new Date().toLocaleString()}
          onUploadAnother={() => window.location.reload()}
          onViewCampaigns={() => window.location.href = '/dashboard'}
          onDownloadFailedLeads={failedLeads.length > 0 ? handleDownloadFailedLeadsCSV : undefined}
          onDownloadInvalidLeads={processedData.invalidLeadsCount > 0 ? handleDownloadInvalidLeadsCSV : undefined}
        />
      </>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Market Selection */}
              <MarketSelector
                onMarketChange={setSelectedMarket}
                selectedMarket={selectedMarket}
              />

              {/* Campaign Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaign-name">Campaign Name *</Label>
                  <Input
                    id="campaign-name"
                    value={campaignName}
                    onChange={(e) => handleCampaignNameChange(e.target.value)}
                    placeholder="e.g., DM_Absentee_2024-11_V1"
                    className={!campaignNameValid ? "border-destructive" : ""}
                  />
                  {campaignName && !campaignNameValid && (
                    <p className="text-sm text-destructive mt-1">
                      Format: PREFIX_TYPE_YYYY-MM_VX (e.g., DM_Absentee_2024-11_V1)
                    </p>
                  )}
                  {campaignName && campaignNameValid && (
                    <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" /> Valid format
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lead-source">Lead Source *</Label>
                  <Select value={leadSource} onValueChange={setLeadSource}>
                    <SelectTrigger id="lead-source">
                      <SelectValue placeholder="Select source..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Direct Mail">Direct Mail</SelectItem>
                      <SelectItem value="PPC">PPC</SelectItem>
                      <SelectItem value="Cold Calling">Cold Calling</SelectItem>
                      <SelectItem value="REI Reply">REI Reply</SelectItem>
                      <SelectItem value="PropStream">PropStream</SelectItem>
                      <SelectItem value="DealMachine">DealMachine</SelectItem>
                      <SelectItem value="Offshore Research">Offshore Research</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data-provider">Data Provider</Label>
                  <Input
                    id="data-provider"
                    value={dataProvider}
                    onChange={(e) => setDataProvider(e.target.value)}
                    placeholder="e.g., REI Reply"
                  />
                </div>
                <div>
                  <Label htmlFor="campaign-version">Campaign Version</Label>
                  <Input
                    id="campaign-version"
                    value={campaignVersion}
                    onChange={(e) => setCampaignVersion(e.target.value)}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <Label>Upload File *</Label>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="font-medium">{selectedFile.name}</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium">Drop file here or click to upload</p>
                      <p className="text-sm text-muted-foreground mt-2">Supports CSV, XLSX, XLS (Max 50MB)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Process Button */}
              {selectedFile && csvHeaders.length > 0 && (
                <Button
                  onClick={() => setShowMappingDialog(true)}
                  className="w-full"
                  size="lg"
                  disabled={!selectedMarket || !campaignName || !leadSource}
                >
                  Map Columns & Process
                </Button>
              )}

              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{processingStatus}</span>
                    <span>{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ColumnMappingDialog
        open={showMappingDialog}
        onOpenChange={setShowMappingDialog}
        csvHeaders={csvHeaders}
        onMappingConfirmed={handleMappingConfirmed}
        state={selectedMarket?.state}
        market={selectedMarket?.market_code}
      />
    </>
  );
};

export default FileUpload;
