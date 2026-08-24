import { API_BASE_URL, withAuthHeaders } from "./api";

export type ReportPreset = "day" | "yesterday" | "mtd" | "ytd" | "month" | "custom";
export type ReportDataQuality = "live" | "proxy" | "unavailable";

export interface ReportMeta {
  from: string;
  to: string;
  preset: ReportPreset;
  label: string;
  dataQuality: ReportDataQuality;
  notes?: string;
}

export interface ReportResponse<T = Record<string, unknown>> {
  meta: ReportMeta;
  summary: Record<string, unknown>;
  rows: T[];
  reason?: string;
}

export interface ReportQuery {
  preset?: ReportPreset;
  date?: string;
  from?: string;
  to?: string;
  month?: string;
  propertyId?: string;
  agentUserId?: string;
  source?: string;
}

export type ReportId =
  | "leads-generated"
  | "field-sales-calls"
  | "leads-period-summary"
  | "conversion-performance"
  | "sales-executive-bookings"
  | "agent-call-volume"
  | "missed-calls"
  | "call-response-time"
  | "call-disposition";

export const REPORT_CATALOG: {
  id: ReportId;
  title: string;
  description: string;
  endpoint: string;
  usesPeriodFilter: boolean;
}[] = [
  {
    id: "leads-generated",
    title: "Daily Leads Generated",
    description: "Leads created in the selected period by agent, source, and property.",
    endpoint: "/reports/leads-generated",
    usesPeriodFilter: true,
  },
  {
    id: "field-sales-calls",
    title: "Calls Accomplished (Field Sales)",
    description: "Field sales call activities (sales call, telecall, cold call) by day and agent.",
    endpoint: "/reports/field-sales-calls",
    usesPeriodFilter: true,
  },
  {
    id: "leads-period-summary",
    title: "Leads Generated — Daily, MTD, YTD",
    description: "Lead counts for selected period plus today, month-to-date, and financial year-to-date.",
    endpoint: "/reports/leads-period-summary",
    usesPeriodFilter: true,
  },
  {
    id: "conversion-performance",
    title: "Conversion % — Daily, MTD, YTD",
    description:
      "Conversion rate with confirmed booking count, revenue, and room nights for selected period plus MTD/YTD.",
    endpoint: "/reports/conversion-performance",
    usesPeriodFilter: true,
  },
  {
    id: "sales-executive-bookings",
    title: "Sales Executive Bookings",
    description:
      "Executive-wise bookings: hotel, check-in/out, booker, company, room nights, ADR, revenue, status.",
    endpoint: "/reports/sales-executive-bookings",
    usesPeriodFilter: true,
  },
  {
    id: "agent-call-volume",
    title: "Agent-wise Call Volume",
    description: "Answered CTI calls and logged CALL communications by agent.",
    endpoint: "/reports/agent-call-volume",
    usesPeriodFilter: true,
  },
  {
    id: "missed-calls",
    title: "Missed Calls Report",
    description: "Missed/unanswered call CDRs (requires CTI persistence).",
    endpoint: "/reports/missed-calls",
    usesPeriodFilter: true,
  },
  {
    id: "call-response-time",
    title: "Call Response Time Report",
    description: "Lead first-touch response time by agent (proxy for telephony answer time).",
    endpoint: "/reports/call-response-time",
    usesPeriodFilter: true,
  },
  {
    id: "call-disposition",
    title: "Call Disposition Report",
    description: "Communication dispositions and lead call statuses in period.",
    endpoint: "/reports/call-disposition",
    usesPeriodFilter: true,
  },
];

function buildQuery(params: ReportQuery): string {
  const q = new URLSearchParams();
  if (params.preset) q.set("preset", params.preset);
  if (params.date) q.set("date", params.date);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  if (params.month) q.set("month", params.month);
  if (params.propertyId && params.propertyId !== "all") {
    q.set("propertyId", params.propertyId);
  }
  if (params.agentUserId && params.agentUserId !== "all") {
    q.set("agentUserId", params.agentUserId);
  }
  if (params.source && params.source !== "all") q.set("source", params.source);
  const s = q.toString();
  return s ? `?${s}` : "";
}

async function fetchReport<T>(
  endpoint: string,
  params: ReportQuery
): Promise<ReportResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${endpoint}${buildQuery(params)}`, {
    headers: withAuthHeaders(),
  });
  if (!res.ok) {
    let message = "Failed to load report";
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return res.json();
}

export function fetchEnterpriseReport(
  reportId: ReportId,
  params: ReportQuery
): Promise<ReportResponse> {
  const entry = REPORT_CATALOG.find((r) => r.id === reportId);
  if (!entry) throw new Error("Unknown report");
  return fetchReport(entry.endpoint, params);
}
