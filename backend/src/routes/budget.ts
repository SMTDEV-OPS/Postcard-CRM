import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { Types } from "mongoose";
import { requireAuth, hasPermission } from "../middleware/auth";
import { PERMISSIONS } from "../constants/permissions";
import { badRequest, forbidden } from "../utils/httpError";
import { BudgetLineModel, BudgetKind, BudgetPeriod } from "../models/budgetLine";
import { UserModel } from "../models/user";
import {
  defaultOrgId,
  resolveReportPeriod,
  buildReportMeta,
  optionalObjectId,
} from "../services/reportPeriod";
import {
  getFinancialYearRange,
  getOrgSalesSettings,
} from "../services/accountsDashboardService";
import { buildExecutiveBookingRows } from "../services/executiveBookingService";
import { LeadStatus } from "../models/common";

export const budgetRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const QUARTERS: BudgetPeriod[] = ["Q1", "Q2", "Q3", "Q4"];

function canViewBudget(req: {
  user?: { isAdmin?: boolean; permissions?: string[]; id?: string; email?: string };
}): boolean {
  if (!req.user) return false;
  if (req.user.isAdmin) return true;
  const u = req.user as Parameters<typeof hasPermission>[0];
  return (
    hasPermission(u, "reports.view") ||
    hasPermission(u, PERMISSIONS.REPORTS.READ) ||
    hasPermission(u, PERMISSIONS.REPORTS.MANAGE) ||
    hasPermission(u, PERMISSIONS.LEADS.MANAGE)
  );
}

function canUploadBudget(req: {
  user?: { isAdmin?: boolean; permissions?: string[]; id?: string; email?: string };
}): boolean {
  if (!req.user) return false;
  if (req.user.isAdmin) return true;
  const u = req.user as Parameters<typeof hasPermission>[0];
  return (
    hasPermission(u, PERMISSIONS.REPORTS.MANAGE) ||
    hasPermission(u, PERMISSIONS.USERS.MANAGE)
  );
}

/** Map a calendar date into FY quarter relative to FY start month. */
function quarterForDate(
  d: Date,
  fyStartMonth: number
): "Q1" | "Q2" | "Q3" | "Q4" {
  const month = d.getUTCMonth() + 1; // 1-12
  let offset = month - fyStartMonth;
  if (offset < 0) offset += 12;
  if (offset < 3) return "Q1";
  if (offset < 6) return "Q2";
  if (offset < 9) return "Q3";
  return "Q4";
}

function fyStartYearForDate(
  d: Date,
  settings: { financialYearStartMonth: number; financialYearStartDay: number }
): number {
  return getFinancialYearRange(settings, d).start.getFullYear();
}

function emptyMetrics() {
  return { roomRevenue: 0, roomNights: 0, adr: 0 };
}

function withAdr(m: { roomRevenue: number; roomNights: number }) {
  return {
    ...m,
    adr:
      m.roomNights > 0
        ? Math.round((m.roomRevenue / m.roomNights) * 100) / 100
        : 0,
  };
}

function sumMetrics(
  a: { roomRevenue: number; roomNights: number },
  b: { roomRevenue: number; roomNights: number }
) {
  return {
    roomRevenue: a.roomRevenue + b.roomRevenue,
    roomNights: a.roomNights + b.roomNights,
  };
}

function golyPct(actual: number, ly: number): number | null {
  if (!ly) return null;
  return Math.round(((actual - ly) / ly) * 10000) / 100;
}

budgetRouter.use(requireAuth);

budgetRouter.get("/template", async (req, res, next) => {
  try {
    if (!canUploadBudget(req)) throw forbidden("Admin upload required");
    const rows = [
      {
        ExecutiveName: "Jane Doe",
        HotelName: "Postcard Hotel",
        Period: "Q1",
        Kind: "BUDGET",
        RoomRevenue: 100000,
        RoomNights: 200,
        FyStartYear: new Date().getFullYear(),
      },
      {
        ExecutiveName: "Jane Doe",
        HotelName: "Postcard Hotel",
        Period: "Q1",
        Kind: "LY",
        RoomRevenue: 90000,
        RoomNights: 180,
        FyStartYear: new Date().getFullYear(),
      },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "BudgetUpload");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="budget-upload-template.xlsx"'
    );
    res.send(Buffer.from(buf));
  } catch (err) {
    next(err);
  }
});

budgetRouter.post("/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!canUploadBudget(req)) throw forbidden("Admin upload required");
    if (!req.file?.buffer) throw badRequest("Excel file required (field: file)");

    const orgId = defaultOrgId(req);
    const wb = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<
      string,
      unknown
    >[];

    const normalizeKey = (k: string) =>
      String(k || "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

    const get = (row: Record<string, unknown>, ...keys: string[]) => {
      const wanted = keys.map(normalizeKey);
      for (const [k, v] of Object.entries(row)) {
        if (wanted.includes(normalizeKey(k))) return v;
      }
      return undefined;
    };

    const users = await UserModel.find().select("name email").lean();
    const userByName = new Map<string, Types.ObjectId>();
    for (const u of users) {
      if (u.name) userByName.set(u.name.trim().toLowerCase(), u._id as Types.ObjectId);
      if (u.email) userByName.set(u.email.trim().toLowerCase(), u._id as Types.ObjectId);
    }

    let upserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < raw.length; i++) {
      const row = raw[i];
      const hotelName = String(get(row, "HotelName", "Hotel", "hotel_name") || "").trim();
      const periodRaw = String(get(row, "Period", "Quarter") || "")
        .trim()
        .toUpperCase();
      const kindRaw = String(get(row, "Kind", "Type") || "")
        .trim()
        .toUpperCase();
      const execName = String(
        get(row, "ExecutiveName", "Executive", "SalesExecutive") || ""
      ).trim();
      const fyRaw = get(row, "FyStartYear", "FY", "FinancialYear");
      const rr = Number(get(row, "RoomRevenue", "RR", "Revenue") || 0);
      const rn = Number(get(row, "RoomNights", "RN", "Nights") || 0);

      if (!hotelName) {
        errors.push(`Row ${i + 2}: missing HotelName`);
        continue;
      }
      if (!QUARTERS.includes(periodRaw as BudgetPeriod) && periodRaw !== "H1" && periodRaw !== "H2" && periodRaw !== "TOTAL") {
        errors.push(`Row ${i + 2}: Period must be Q1–Q4 (or H1/H2/TOTAL)`);
        continue;
      }
      if (kindRaw !== "LY" && kindRaw !== "BUDGET") {
        errors.push(`Row ${i + 2}: Kind must be LY or BUDGET`);
        continue;
      }

      const fyStartYear = Number(fyRaw) || new Date().getFullYear();
      const executiveUserId = execName
        ? userByName.get(execName.toLowerCase())
        : undefined;

      await BudgetLineModel.findOneAndUpdate(
        {
          orgId,
          kind: kindRaw as BudgetKind,
          fyStartYear,
          period: periodRaw as BudgetPeriod,
          hotelName,
          ...(executiveUserId
            ? { executiveUserId }
            : { executiveUserId: null }),
        },
        {
          $set: {
            orgId,
            kind: kindRaw as BudgetKind,
            fyStartYear,
            period: periodRaw as BudgetPeriod,
            hotelName,
            executiveUserId: executiveUserId || null,
            executiveName: execName || undefined,
            roomRevenue: Number.isFinite(rr) ? rr : 0,
            roomNights: Number.isFinite(rn) ? rn : 0,
            uploadedByUserId: req.user?.id
              ? new Types.ObjectId(String(req.user.id))
              : undefined,
          },
        },
        { upsert: true, new: true }
      );
      upserted += 1;
    }

    res.json({ ok: true, upserted, errors });
  } catch (err) {
    next(err);
  }
});

budgetRouter.get("/vs-actual", async (req, res, next) => {
  try {
    if (!canViewBudget(req)) throw forbidden("Insufficient permissions");

    const orgId = defaultOrgId(req);
    const period = await resolveReportPeriod(req, orgId);
    const executiveUserId = optionalObjectId(
      req.query.executiveUserId,
      "executiveUserId"
    );
    const settings = await getOrgSalesSettings(orgId);
    const fyStartYear = fyStartYearForDate(period.from, settings);
    const fyStartMonth = settings.financialYearStartMonth;

    const lineFilter: Record<string, unknown> = {
      orgId,
      fyStartYear,
      period: { $in: QUARTERS },
    };
    if (executiveUserId) lineFilter.executiveUserId = executiveUserId;

    const lines = await BudgetLineModel.find(lineFilter).lean();

    type Cell = {
      ly: { roomRevenue: number; roomNights: number; adr: number };
      budget: { roomRevenue: number; roomNights: number; adr: number };
      actual: { roomRevenue: number; roomNights: number; adr: number };
      golyPct?: number | null;
    };

    type HotelRow = {
      hotelName: string;
      executiveUserId?: string;
      executiveName?: string;
      periods: Record<string, Cell>;
    };

    const hotelMap = new Map<string, HotelRow>();

    const ensure = (
      hotelName: string,
      execId?: string,
      execName?: string
    ): HotelRow => {
      const key = `${execId || "all"}::${hotelName.toLowerCase()}`;
      let row = hotelMap.get(key);
      if (!row) {
        row = {
          hotelName,
          executiveUserId: execId,
          executiveName: execName,
          periods: {},
        };
        for (const q of [...QUARTERS, "H1", "H2", "TOTAL"] as string[]) {
          row.periods[q] = {
            ly: emptyMetrics(),
            budget: emptyMetrics(),
            actual: emptyMetrics(),
          };
        }
        hotelMap.set(key, row);
      }
      return row;
    };

    for (const line of lines) {
      const row = ensure(
        line.hotelName,
        line.executiveUserId ? String(line.executiveUserId) : undefined,
        line.executiveName
      );
      const cell = row.periods[line.period];
      if (!cell) continue;
      const metrics = withAdr({
        roomRevenue: line.roomRevenue || 0,
        roomNights: line.roomNights || 0,
      });
      if (line.kind === "LY") cell.ly = metrics;
      else cell.budget = metrics;
    }

    // Distribute actuals into quarters by check-in date within filter range
    const confirmed = await buildExecutiveBookingRows({
      from: period.from,
      to: period.to,
      executiveUserId,
      status: LeadStatus.CONFIRMED,
      dateField: "checkIn",
    });

    for (const r of confirmed) {
      if (!r.checkIn) continue;
      const ci = new Date(r.checkIn + "T00:00:00.000Z");
      const q = quarterForDate(ci, fyStartMonth);
      const hotel = r.hotelName && r.hotelName !== "—" ? r.hotelName : "Unknown";
      const row = ensure(hotel, r.executiveUserId, r.executiveName);
      const cell = row.periods[q];
      cell.actual = withAdr(
        sumMetrics(cell.actual, {
          roomRevenue: r.revenue || 0,
          roomNights: r.roomNights || 0,
        })
      );
    }

    // Roll up H1 / H2 / TOTAL
    for (const row of hotelMap.values()) {
      const h1Ly = sumMetrics(row.periods.Q1.ly, row.periods.Q2.ly);
      const h1Bud = sumMetrics(row.periods.Q1.budget, row.periods.Q2.budget);
      const h1Act = sumMetrics(row.periods.Q1.actual, row.periods.Q2.actual);
      row.periods.H1 = {
        ly: withAdr(h1Ly),
        budget: withAdr(h1Bud),
        actual: withAdr(h1Act),
        golyPct: golyPct(h1Act.roomRevenue, h1Ly.roomRevenue),
      };

      const h2Ly = sumMetrics(row.periods.Q3.ly, row.periods.Q4.ly);
      const h2Bud = sumMetrics(row.periods.Q3.budget, row.periods.Q4.budget);
      const h2Act = sumMetrics(row.periods.Q3.actual, row.periods.Q4.actual);
      row.periods.H2 = {
        ly: withAdr(h2Ly),
        budget: withAdr(h2Bud),
        actual: withAdr(h2Act),
        golyPct: golyPct(h2Act.roomRevenue, h2Ly.roomRevenue),
      };

      const totLy = sumMetrics(h1Ly, h2Ly);
      const totBud = sumMetrics(h1Bud, h2Bud);
      const totAct = sumMetrics(h1Act, h2Act);
      row.periods.TOTAL = {
        ly: withAdr(totLy),
        budget: withAdr(totBud),
        actual: withAdr(totAct),
        golyPct: golyPct(totAct.roomRevenue, totLy.roomRevenue),
      };
    }

    // Ensure hotels that only have actuals are included (already via ensure)

    const rows = [...hotelMap.values()].sort((a, b) => {
      const e = (a.executiveName || "").localeCompare(b.executiveName || "");
      if (e !== 0) return e;
      return a.hotelName.localeCompare(b.hotelName);
    });

    res.json({
      meta: buildReportMeta(
        period,
        "live",
        "Actual = CONFIRMED leads by check-in in range. LY/Budget from admin upload."
      ),
      fyStartYear,
      summary: {
        hotels: rows.length,
        totalActualRevenue: rows.reduce(
          (s, r) => s + (r.periods.TOTAL?.actual.roomRevenue || 0),
          0
        ),
      },
      rows,
    });
  } catch (err) {
    next(err);
  }
});
