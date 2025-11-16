import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Check, Save, Upload, ChevronsUpDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DATABASE_FIELDS, detectColumnMapping, type ColumnMapping, type MappingTemplate } from "@/types/mappings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ColumnMappingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  csvHeaders: string[];
  onMappingConfirmed: (mappings: ColumnMapping[], template?: MappingTemplate) => void;
  state?: string;
  market?: string;
}

interface MappingRowProps {
  header: string;
  mapping: ColumnMapping | undefined;
  onMappingChange: (csvColumn: string, dbColumn: string) => void;
}

function MappingRow({ header, mapping, onMappingChange }: MappingRowProps) {
  const [open, setOpen] = useState(false);
  const isMapped = !!mapping?.db_column;
  const mappedField = DATABASE_FIELDS.find(f => f.name === mapping?.db_column);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono bg-muted px-2 py-1 rounded break-all">
          {header}
        </span>
        {isMapped && <Check className="h-4 w-4 text-green-600" />}
      </div>
      <div className="w-full">
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {mapping?.db_column
                ? DATABASE_FIELDS.find(f => f.name === mapping.db_column)?.label
                : "Skip this column"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 z-[100]" align="start" side="bottom">
            <Command>
              <CommandInput placeholder="Search fields..." className="h-9" />
              <CommandList className="max-h-[300px] overflow-y-auto">
                <CommandEmpty>No field found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    value="__skip__"
                    onSelect={() => {
                      onMappingChange(header, '');
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        !mapping?.db_column ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Skip this column
                  </CommandItem>
                  {DATABASE_FIELDS.map(field => (
                    <CommandItem
                      key={field.name}
                      value={`${field.label} ${field.name} ${field.category}`}
                      onSelect={() => {
                        onMappingChange(header, field.name);
                        setOpen(false);
                      }}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          mapping?.db_column === field.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{field.label}{field.required && ' *'}</span>
                        <span className="text-xs text-muted-foreground">
                          {field.category} • {field.description}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {mappedField && (
          <p className="text-xs text-muted-foreground mt-1">{mappedField.description}</p>
        )}
      </div>
    </div>
  );
}

export function ColumnMappingDialog({
  open,
  onOpenChange,
  csvHeaders,
  onMappingConfirmed,
  state,
  market,
}: ColumnMappingDialogProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [templates, setTemplates] = useState<MappingTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [sourceType, setSourceType] = useState("");
  const { toast } = useToast();

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, [state]);

  // Auto-detect mappings when dialog opens
  useEffect(() => {
    if (open && csvHeaders.length > 0 && mappings.length === 0) {
      autoDetectMappings();
    }
  }, [open, csvHeaders]);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('column_mapping_templates')
      .select('*')
      .eq('is_active', true)
      .order('last_used_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error loading templates:', error);
      return;
    }

    setTemplates((data || []) as unknown as MappingTemplate[]);
  };

  const autoDetectMappings = () => {
    const detected: ColumnMapping[] = csvHeaders.map(header => {
      const suggestion = detectColumnMapping(header);
      return {
        csv_column: header,
        db_column: suggestion || '',
      };
    });
    setMappings(detected);
  };

  const handleMappingChange = (csvColumn: string, dbColumn: string) => {
    setMappings(prev => {
      const existing = prev.find(m => m.csv_column === csvColumn);
      if (existing) {
        return prev.map(m => 
          m.csv_column === csvColumn ? { ...m, db_column: dbColumn } : m
        );
      }
      return [...prev, { csv_column: csvColumn, db_column: dbColumn }];
    });
  };

  const handleLoadTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === parseInt(templateId));
    if (!template) return;

    // Apply template mappings
    const templateMappings = template.column_mappings as ColumnMapping[];
    const newMappings = csvHeaders.map(header => {
      const match = templateMappings.find(tm => tm.csv_column === header);
      return {
        csv_column: header,
        db_column: match?.db_column || '',
      };
    });
    
    setMappings(newMappings);
    setSelectedTemplate(templateId);

    // Update usage stats
    await supabase
      .from('column_mapping_templates')
      .update({
        last_used_at: new Date().toISOString(),
        usage_count: (template.usage_count || 0) + 1,
      })
      .eq('id', template.id);

    toast({
      title: "Template Loaded",
      description: `Applied mapping template: ${template.template_name}`,
    });
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Template Name Required",
        description: "Please enter a name for the template",
        variant: "destructive",
      });
      return;
    }

    const validMappings = mappings.filter(m => m.db_column);
    
    const { error } = await supabase
      .from('column_mapping_templates')
      .insert([{
        template_name: templateName,
        description: templateDescription,
        source_type: sourceType,
        state: state,
        parcel_id_type: state === 'WI' ? 'Tax Key Number' : 'Property ID',
        column_mappings: validMappings as any,
        sample_headers: csvHeaders as any,
      }]);

    if (error) {
      toast({
        title: "Error Saving Template",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Template Saved",
      description: `Template "${templateName}" saved successfully`,
    });

    loadTemplates();
    setSaveAsTemplate(false);
    setTemplateName("");
    setTemplateDescription("");
    setSourceType("");
  };

  const validateMappings = (): string[] => {
    const errors: string[] = [];
    const requiredFields = DATABASE_FIELDS.filter(f => f.required);
    const mappedDbColumns = mappings.filter(m => m.db_column).map(m => m.db_column);

    requiredFields.forEach(field => {
      if (!mappedDbColumns.includes(field.name)) {
        errors.push(`Required field "${field.label}" is not mapped`);
      }
    });

    return errors;
  };

  const handleConfirm = () => {
    const errors = validateMappings();
    if (errors.length > 0) {
      toast({
        title: "Mapping Validation Failed",
        description: errors.join(', '),
        variant: "destructive",
      });
      return;
    }

    const validMappings = mappings.filter(m => m.db_column);
    onMappingConfirmed(validMappings);
    onOpenChange(false);
  };

  const getMappedCount = () => mappings.filter(m => m.db_column).length;
  const getRequiredMappedCount = () => {
    const requiredFields = DATABASE_FIELDS.filter(f => f.required).map(f => f.name);
    return mappings.filter(m => m.db_column && requiredFields.includes(m.db_column)).length;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Map CSV Columns to Database Fields</DialogTitle>
          <DialogDescription>
            Map your CSV columns to the corresponding database fields. Required fields are marked with a red badge.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Selector */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label>Load Existing Template</Label>
              <Select value={selectedTemplate} onValueChange={handleLoadTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id!.toString()}>
                      {template.template_name} {template.state && `(${template.state})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={autoDetectMappings}>
              Auto-Detect
            </Button>
          </div>

          {/* Mapping Stats */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{getMappedCount()} / {csvHeaders.length} columns mapped</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getRequiredMappedCount() === DATABASE_FIELDS.filter(f => f.required).length ? "default" : "destructive"}>
                {getRequiredMappedCount()} / {DATABASE_FIELDS.filter(f => f.required).length} required fields
              </Badge>
            </div>
          </div>

          {/* Validation Errors */}
          {validateMappings().length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold">Missing required fields:</div>
                <ul className="list-disc list-inside mt-1">
                  {validateMappings().map((error, i) => (
                    <li key={i} className="text-sm">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Mapping Grid */}
          <ScrollArea className="h-[400px] border rounded-md p-4">
            <div className="space-y-3">
              {csvHeaders.map(header => {
                const mapping = mappings.find(m => m.csv_column === header);
                return (
                  <MappingRow
                    key={header}
                    header={header}
                    mapping={mapping}
                    onMappingChange={handleMappingChange}
                  />
                );
              })}
            </div>
          </ScrollArea>

          {/* Save as Template */}
          {saveAsTemplate ? (
            <div className="space-y-3 border rounded-md p-4 max-h-[300px] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <Label htmlFor="template-name">Template Name *</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., REI Reply - Wisconsin"
                    className="w-full"
                  />
                </div>
                <div className="w-full">
                  <Label htmlFor="source-type">Data Source</Label>
                  <Input
                    id="source-type"
                    value={sourceType}
                    onChange={(e) => setSourceType(e.target.value)}
                    placeholder="e.g., REI Reply, PropStream"
                    className="w-full"
                  />
                </div>
              </div>
              <div className="w-full">
                <Label htmlFor="template-desc">Description</Label>
                <Input
                  id="template-desc"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSaveTemplate} size="sm" className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
                <Button onClick={() => setSaveAsTemplate(false)} variant="outline" size="sm" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setSaveAsTemplate(true)} variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={validateMappings().length > 0}>
            <Upload className="h-4 w-4 mr-2" />
            Confirm Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}