import ImportHistory from "@/components/ImportHistory";

const ImportHistoryPage = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold">Campaign History</h2>
        <p className="text-muted-foreground">
          View all your previous campaign imports
        </p>
      </div>
      <ImportHistory />
    </div>
  );
};

export default ImportHistoryPage;
