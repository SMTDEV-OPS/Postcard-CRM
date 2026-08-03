import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import { useToast } from "@/hooks/use-toast";
import {
  exportReportCsv,
  exportReportExcel,
  exportReportPdf,
  type ExportColumn,
} from "@/lib/reportExport";
import {
  REPORT_CATALOG,
  fetchEnterpriseReport,
  type ReportId,
  type ReportMeta,
  type ReportPreset,
  type ReportQuery,
  type ReportResponse,
} from "@/services/reports";

interface ReportsProps {
  userName: string;
}

const PRESETS: { id: ReportPreset; label: string }[] = [
  { id: "day", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "mtd", label: "MTD" },
  { id: "ytd", label: "YTD (FY)" },
  { id: "month", label: "Month" },
  { id: "custom", label: "Custom" },
];

function qualityBadge(q: ReportMeta["dataQuality"]) {
  if (q === "live") {
    return <Badge className="bg-emerald-600 hover:bg-emerald-600">Live data</Badge>;
  }
  if (q === "proxy") {
    return (
      <Badge variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
        Proxy data
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-rose-400 text-rose-700 dark:text-rose-400">
      Unavailable
    </Badge>
  );
}

function inferColumns(rows: Record<string, unknown>[]): ExportColumn[] {
  if (rows.length === 0) return [];
  const keys = Object.keys(rows[0]).filter(
    (k) => !k.toLowerCase().endsWith("userid") && k !== "periodKey"
  );
  return keys.map((key) => ({
    key,
    label: key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (c) => c.toUpperCase())
      .trim(),
  }));
}

function formatCell(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "number") {
    if (Number.isInteger(value)) return value.toLocaleString();
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}

const Reports = ({ userName }: ReportsProps) => {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<ReportId>("leads-generated");
  const [preset, setPreset] = useState<ReportPreset>("day");
  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [from, setFrom] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReportResponse | null>(null);

  const active = REPORT_CATALOG.find((r) => r.id === activeId)!;

  const query: ReportQuery = useMemo(() => {
    const q: ReportQuery = { preset };
    if (preset === "day") q.date = date;
    if (preset === "month") q.month = month;
    if (preset === "custom") {
      q.from = from;
      q.to = to;
    }
    return q;
  }, [preset, date, month, from, to]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEnterpriseReport(
        activeId,
        active.usesPeriodFilter ? query : {}
      );
      setData(result);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, query.preset, query.date, query.month, query.from, query.to]);

  const rows = (data?.rows ?? []) as Record<string, unknown>[];
  const columns = useMemo(() => inferColumns(rows), [rows]);

  const metaLines = useMemo(() => {
    if (!data?.meta) return [] as string[];
    const lines = [
      `Period: ${data.meta.label}`,
      `From: ${new Date(data.meta.from).toLocaleString()}`,
      `To: ${new Date(data.meta.to).toLocaleString()}`,
      `Data quality: ${data.meta.dataQuality}`,
      `Generated for: ${userName}`,
    ];
    if (data.meta.notes) lines.push(`Notes: ${data.meta.notes}`);
    return lines;
  }, [data, userName]);

  const exportDisabled = loading || !data || rows.length === 0;

  const runExport = (kind: "csv" | "xlsx" | "pdf") => {
    if (!data || columns.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Load a report with rows first.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (kind === "csv") exportReportCsv(active.title, columns, rows, metaLines);
      else if (kind === "xlsx") exportReportExcel(active.title, columns, rows, metaLines);
      else exportReportPdf(active.title, columns, rows, metaLines);
      toast({ title: "Export ready", description: `${active.title} downloaded.` });
    } catch (err) {
      toast({
        title: "Export failed",
        description: err instanceof Error ? err.message : "Could not export",
        variant: "destructive",
      });
    }
  };

  const summaryEntries = Object.entries(data?.summary ?? {}).filter(
    ([, v]) => v != null && typeof v !== "object"
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Enterprise analytics with on-screen results and CSV, Excel, and PDF export."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={() => runExport("csv")}
            >
              <FileText className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={() => runExport("xlsx")}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={exportDisabled}
              onClick={() => runExport("pdf")}
            >
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Report catalog
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 p-3 pt-0">
            {REPORT_CATALOG.map((report) => {
              const selected = report.id === activeId;
              return (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => setActiveId(report.id)}
                  className={`w-full rounded-md px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-text"
                  }`}
                >
                  <div className="text-sm font-medium leading-snug">{report.title}</div>
                  <div
                    className={`mt-0.5 text-[11px] leading-snug ${
                      selected ? "text-primary-foreground/80" : "text-muted-foreground"
                    }`}
                  >
                    {report.description}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-4">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-text">{active.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
                </div>
                {data?.meta && qualityBadge(data.meta.dataQuality)}
              </div>

              {active.usesPeriodFilter && (
                <div className="space-y-3 border-t border-border pt-3">
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <Button
                        key={p.id}
                        size="sm"
                        variant={preset === p.id ? "default" : "outline"}
                        onClick={() => setPreset(p.id)}
                      >
                        {p.label}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {preset === "day" && (
                      <div>
                        <Label htmlFor="report-date">Date</Label>
                        <Input
                          id="report-date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    {preset === "month" && (
                      <div>
                        <Label htmlFor="report-month">Month</Label>
                        <Input
                          id="report-month"
                          type="month"
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    )}
                    {preset === "custom" && (
                      <>
                        <div>
                          <Label htmlFor="report-from">From</Label>
                          <Input
                            id="report-from"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="report-to">To</Label>
                          <Input
                            id="report-to"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {!active.usesPeriodFilter && (
                <p className="text-sm text-muted-foreground border-t border-border pt-3">
                  This report always shows Daily, MTD, and YTD (financial year) buckets.
                </p>
              )}

              {data?.meta?.notes && (
                <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  {data.meta.notes}
                </p>
              )}
            </CardContent>
          </Card>

          {summaryEntries.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {summaryEntries.map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1")}
                    </div>
                    <div className="mt-1 text-xl font-semibold text-text">
                      {formatCell(value)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex min-h-48 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-medium text-text">Unable to load report</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  <Button className="mt-4" variant="outline" onClick={() => void load()}>
                    Try again
                  </Button>
                </div>
              ) : data?.meta.dataQuality === "unavailable" ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-medium text-text">Data not available yet</p>
                  <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
                    {data.reason ||
                      data.meta.notes ||
                      "This report requires additional telephony data capture."}
                  </p>
                </div>
              ) : rows.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-medium text-text">No rows for this period</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try another date range or confirm activity exists in CRM.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left">
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          {columns.map((col) => (
                            <td key={col.key} className="px-4 py-2.5 text-text">
                              {formatCell(row[col.key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
