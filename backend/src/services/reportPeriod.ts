import { Request } from "express";
import { Types } from "mongoose";
import {
  getFinancialYearRange,
  getOrgSalesSettings,
} from "./accountsDashboardService";
import { badRequest } from "../utils/httpError";

export type ReportPreset = "day" | "mtd" | "ytd" | "month" | "custom" | "yesterday";

export type ReportDataQuality = "live" | "proxy" | "unavailable";

export interface ReportPeriod {
  from: Date;
  to: Date;
  preset: ReportPreset;
  label: string;
}

export interface ReportMeta {
  from: string;
  to: string;
  preset: ReportPreset;
  label: string;
  dataQuality: ReportDataQuality;
  notes?: string;
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function endOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

function parseYmd(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw badRequest(`Invalid date "${value}". Use YYYY-MM-DD.`);
  }
  const d = new Date(value + "T00:00:00.000Z");
  if (Number.isNaN(d.getTime())) throw badRequest(`Invalid date "${value}"`);
  return d;
}

function parseYm(value: string): { year: number; month: number } {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw badRequest(`Invalid month "${value}". Use YYYY-MM.`);
  }
  const [y, m] = value.split("-").map(Number);
  if (m < 1 || m > 12) throw badRequest(`Invalid month "${value}"`);
  return { year: y, month: m };
}

/** Resolve report period from query params. YTD uses org financial year. */
export async function resolveReportPeriod(
  req: Request,
  orgId: Types.ObjectId
): Promise<ReportPeriod> {
  const presetRaw = String(req.query.preset || "day").toLowerCase() as ReportPreset;
  const preset: ReportPreset = [
    "day",
    "mtd",
    "ytd",
    "month",
    "custom",
    "yesterday",
  ].includes(presetRaw)
    ? presetRaw
    : "day";

  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const todayEnd = endOfUtcDay(now);

  if (preset === "day") {
    const dateStr =
      (req.query.date as string) || now.toISOString().slice(0, 10);
    const day = parseYmd(dateStr);
    return {
      from: startOfUtcDay(day),
      to: endOfUtcDay(day),
      preset,
      label: `Day ${dateStr}`,
    };
  }

  if (preset === "yesterday") {
    const y = new Date(todayStart);
    y.setUTCDate(y.getUTCDate() - 1);
    const ymd = y.toISOString().slice(0, 10);
    return {
      from: startOfUtcDay(y),
      to: endOfUtcDay(y),
      preset,
      label: `Yesterday ${ymd}`,
    };
  }

  if (preset === "mtd") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    return {
      from,
      to: todayEnd,
      preset,
      label: `MTD ${from.toISOString().slice(0, 7)}`,
    };
  }

  if (preset === "ytd") {
    const settings = await getOrgSalesSettings(orgId);
    const fy = getFinancialYearRange(settings, now);
    return {
      from: fy.start,
      to: todayEnd,
      preset,
      label: `YTD (FY from ${fy.start.toISOString().slice(0, 10)})`,
    };
  }

  if (preset === "month") {
    const monthStr =
      (req.query.month as string) || now.toISOString().slice(0, 7);
    const { year, month } = parseYm(monthStr);
    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return {
      from,
      to,
      preset,
      label: `Month ${monthStr}`,
    };
  }

  // custom
  const fromStr = req.query.from as string | undefined;
  const toStr = req.query.to as string | undefined;
  if (!fromStr || !toStr) {
    throw badRequest("preset=custom requires from and to (YYYY-MM-DD)");
  }
  const from = startOfUtcDay(parseYmd(fromStr));
  const to = endOfUtcDay(parseYmd(toStr));
  if (from > to) throw badRequest("from must be on or before to");
  return {
    from,
    to,
    preset: "custom",
    label: `${fromStr} → ${toStr}`,
  };
}

export function buildReportMeta(
  period: ReportPeriod,
  dataQuality: ReportDataQuality,
  notes?: string
): ReportMeta {
  return {
    from: period.from.toISOString(),
    to: period.to.toISOString(),
    preset: period.preset,
    label: period.label,
    dataQuality,
    notes,
  };
}

export function optionalObjectId(
  value: unknown,
  fieldName: string
): Types.ObjectId | undefined {
  if (value == null || value === "" || value === "all") return undefined;
  const s = String(value);
  if (!Types.ObjectId.isValid(s)) {
    throw badRequest(`Invalid ${fieldName}`);
  }
  return new Types.ObjectId(s);
}

export function defaultOrgId(req: Request): Types.ObjectId {
  const raw =
    (req.query.orgId as string) ||
    process.env.DEFAULT_ORG_ID ||
    "69ae144fae23030b62f901f5";
  if (!Types.ObjectId.isValid(raw)) {
    throw badRequest("Invalid orgId");
  }
  return new Types.ObjectId(raw);
}

/** Room nights from reservation stay length × rooms. */
export function roomNightsFromReservation(r: {
  checkInDate?: Date;
  checkOutDate?: Date;
  roomsBooked?: number;
}): number {
  if (!r.checkInDate || !r.checkOutDate) return 0;
  const ms = new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime();
  const nights = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  const rooms = r.roomsBooked && r.roomsBooked > 0 ? r.roomsBooked : 1;
  return nights * rooms;
}

export const CONFIRMED_RESERVATION_STATUSES = [
  "CONFIRMED",
  "CHECKED_IN",
  "CHECKED_OUT",
] as const;

export const FIELD_SALES_CALL_TYPES = [
  "SALES_CALL",
  "TELECALL",
  "COLD_CALL",
] as const;
