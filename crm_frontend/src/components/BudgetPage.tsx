import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL, withAuthHeaders } from "@/services/api";
import { listUsers, type User } from "@/services/users";
import type { ReportPreset } from "@/services/reports";

type Metrics = { roomRevenue: number; roomNights: number; adr: number };
type Cell = {
  ly: Metrics;
  budget: Metrics;
  actual: Metrics;
  golyPct?: number | null;
};

type BudgetHotelRow = {
  hotelName: string;
  executiveUserId?: string;
  executiveName?: string;
  periods: Record<string, Cell>;
};

const PERIODS = ["Q1", "Q2", "Q3", "Q4", "H1", "H2", "TOTAL"] as const;

const PRESETS: { id: ReportPreset; label: string }[] = [
  { id: "mtd", label: "MTD" },
  { id: "ytd", label: "YTD (FY)" },
  { id: "month", label: "Month" },
  { id: "custom", label: "Custom" },
];

function fmt(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtAdr(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function BudgetPage({ isAdmin }: { isAdmin?: boolean }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [executiveUserId, setExecutiveUserId] = useState("all");
  const [preset, setPreset] = useState<ReportPreset>("ytd");
  const [month, setMonth] = useState(() => format(new Date(), "yyyy-MM"));
  const [from, setFrom] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [to, setTo] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<BudgetHotelRow[]>([]);
  const [fyStartYear, setFyStartYear] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void listUsers()
      .then(setUsers)
      .catch(() => undefined);
  }, []);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set("preset", preset);
    if (preset === "month") q.set("month", month);
    if (preset === "custom") {
      q.set("from", from);
      q.set("to", to);
    }
    if (executiveUserId !== "all") q.set("executiveUserId", executiveUserId);
    return q.toString();
  }, [preset, month, from, to, executiveUserId]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/budget/vs-actual?${query}`, {
        headers: withAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to load budget");
      setRows((data.rows || []) as BudgetHotelRow[]);
      setFyStartYear(typeof data.fyStartYear === "number" ? data.fyStartYear : null);
    } catch (err) {
      setRows([]);
      toast({
        title: "Budget load failed",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/budget/template`, {
        headers: withAuthHeaders(),
      });
      if (!res.ok) throw new Error("Template download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "budget-upload-template.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast({
        title: "Template failed",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    }
  };

  const onUpload = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE_URL}/budget/upload`, {
        method: "POST",
        headers: withAuthHeaders(),
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Upload failed");
      toast({
        title: "Upload complete",
        description: `Upserted ${data.upserted ?? 0} row(s)${
          data.errors?.length ? `; ${data.errors.length} warning(s)` : ""
        }.`,
      });
      await load();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Error",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Budget vs Actual"
        subtitle="LY and Budget from upload; Actual from CONFIRMED leads by check-in."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {isAdmin && (
              <>
                <Button variant="outline" size="sm" onClick={() => void downloadTemplate()}>
                  Template
                </Button>
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      void onUpload(e.target.files?.[0] || null);
                      e.target.value = "";
                    }}
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Excel
                    </span>
                  </Button>
                </label>
              </>
            )}
          </div>
        }
      />

      <Card>
        <CardContent className="space-y-4 p-4">
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
          <div className="grid gap-3 sm:grid-cols-3">
            {preset === "month" && (
              <div>
                <Label>Month</Label>
                <Input
                  type="month"
                  className="mt-1"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            )}
            {preset === "custom" && (
              <>
                <div>
                  <Label>From</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label>To</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                </div>
              </>
            )}
            <div>
              <Label>Executive</Label>
              <Select value={executiveUserId} onValueChange={setExecutiveUserId}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All executives</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {fyStartYear != null && (
            <p className="text-xs text-muted-foreground">
              Financial year start: {fyStartYear}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Hotel × period (LY | Budget | Actual)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading…
            </div>
          ) : (
            <table className="w-full min-w-[1400px] text-left text-xs">
              <thead className="border-b bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="sticky left-0 bg-muted/40 p-2">Executive</th>
                  <th className="sticky left-[120px] bg-muted/40 p-2">Hotel</th>
                  {PERIODS.map((p) => (
                    <th key={p} className="p-2 text-center" colSpan={3}>
                      {p}
                      {p === "H1" || p === "H2" || p === "TOTAL" ? " (+GOLY%)" : ""}
                    </th>
                  ))}
                </tr>
                <tr>
                  <th className="sticky left-0 bg-muted/40 p-2" />
                  <th className="sticky left-[120px] bg-muted/40 p-2" />
                  {PERIODS.flatMap((p) =>
                    ["LY", "Bud", "Act"].map((label) => (
                      <th key={`${p}-${label}`} className="p-1 text-center font-medium">
                        {label}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={`${row.executiveUserId}-${row.hotelName}`}
                    className="border-b border-border/50 align-top"
                  >
                    <td className="sticky left-0 bg-background p-2 whitespace-nowrap">
                      {row.executiveName || "—"}
                    </td>
                    <td className="sticky left-[120px] bg-background p-2 whitespace-nowrap">
                      {row.hotelName}
                    </td>
                    {PERIODS.flatMap((p) => {
                      const cell = row.periods[p];
                      const blocks: Metrics[] = [
                        cell?.ly || { roomRevenue: 0, roomNights: 0, adr: 0 },
                        cell?.budget || { roomRevenue: 0, roomNights: 0, adr: 0 },
                        cell?.actual || { roomRevenue: 0, roomNights: 0, adr: 0 },
                      ];
                      return blocks.map((m, idx) => (
                        <td
                          key={`${p}-${idx}`}
                          className="p-1 text-right tabular-nums whitespace-nowrap"
                        >
                          <div>RR {fmt(m.roomRevenue)}</div>
                          <div>RN {fmt(m.roomNights)}</div>
                          <div>ADR {fmtAdr(m.adr)}</div>
                          {idx === 2 &&
                            (p === "H1" || p === "H2" || p === "TOTAL") &&
                            cell?.golyPct != null && (
                              <div className="text-muted-foreground">
                                GOLY {cell.golyPct}%
                              </div>
                            )}
                        </td>
                      ));
                    })}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={2 + PERIODS.length * 3} className="p-4 text-muted-foreground">
                      No budget or actual rows for this filter. Upload LY/Budget or confirm leads.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
