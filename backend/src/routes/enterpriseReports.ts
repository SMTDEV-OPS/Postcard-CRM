import { Router } from "express";
import { Types } from "mongoose";
import { LeadModel } from "../models/lead";
import { ContactActivityModel } from "../models/contactActivity";
import { CommunicationModel } from "../models/communication";
import { CallLogModel } from "../models/callLog";
import { ReservationModel } from "../models/reservation";
import { UserModel } from "../models/user";
import { PropertyModel } from "../models/property";
import { LeadStatus, CommunicationChannel } from "../models/common";
import {
  resolveReportPeriod,
  buildReportMeta,
  optionalObjectId,
  defaultOrgId,
  roomNightsFromReservation,
  CONFIRMED_RESERVATION_STATUSES,
  FIELD_SALES_CALL_TYPES,
} from "../services/reportPeriod";
import {
  getFinancialYearRange,
  getOrgSalesSettings,
} from "../services/accountsDashboardService";

async function userNameMap(ids: (Types.ObjectId | string | null | undefined)[]) {
  const unique = [
    ...new Set(
      ids
        .filter(Boolean)
        .map((id) => String(id))
        .filter((id) => Types.ObjectId.isValid(id))
    ),
  ];
  if (unique.length === 0) return new Map<string, string>();
  const users = await UserModel.find({
    _id: { $in: unique.map((id) => new Types.ObjectId(id)) },
  })
    .select("name email")
    .lean();
  const map = new Map<string, string>();
  for (const u of users) {
    map.set(String(u._id), u.name || u.email || "User");
  }
  return map;
}

async function propertyNameMap(ids: (Types.ObjectId | string | null | undefined)[]) {
  const unique = [
    ...new Set(
      ids
        .filter(Boolean)
        .map((id) => String(id))
        .filter((id) => Types.ObjectId.isValid(id))
    ),
  ];
  if (unique.length === 0) return new Map<string, string>();
  const props = await PropertyModel.find({
    _id: { $in: unique.map((id) => new Types.ObjectId(id)) },
  })
    .select("name")
    .lean();
  const map = new Map<string, string>();
  for (const p of props) {
    map.set(String(p._id), p.name || "Property");
  }
  return map;
}

function endOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999));
}

function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0));
}

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

/**
 * Register the 8 enterprise report endpoints on the given router.
 */
export function registerEnterpriseReports(router: Router) {
  // 1. Daily / range Leads Generated
  router.get("/leads-generated", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const period = await resolveReportPeriod(req, orgId);
      const propertyId = optionalObjectId(req.query.propertyId, "propertyId");
      const agentUserId = optionalObjectId(req.query.agentUserId, "agentUserId");
      const source = req.query.source ? String(req.query.source) : undefined;

      const match: Record<string, unknown> = {
        createdAt: { $gte: period.from, $lte: period.to },
      };
      if (propertyId) match.propertyId = propertyId;
      if (agentUserId) match.assignedToUserId = agentUserId;
      if (source && source !== "all") match.source = source;

      const rows = await LeadModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              assignedToUserId: "$assignedToUserId",
              source: "$source",
              propertyId: "$propertyId",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.day": 1 } },
      ]);

      const names = await userNameMap(rows.map((r) => r._id.assignedToUserId));
      const props = await propertyNameMap(rows.map((r) => r._id.propertyId));

      const table = rows.map((r) => ({
        date: r._id.day,
        agentUserId: r._id.assignedToUserId ? String(r._id.assignedToUserId) : null,
        agentName: r._id.assignedToUserId
          ? names.get(String(r._id.assignedToUserId)) || "Unassigned"
          : "Unassigned",
        source: r._id.source || "—",
        propertyId: r._id.propertyId ? String(r._id.propertyId) : null,
        propertyName: r._id.propertyId
          ? props.get(String(r._id.propertyId)) || "—"
          : "—",
        leadsGenerated: r.count,
      }));

      const total = table.reduce((s, r) => s + r.leadsGenerated, 0);

      res.json({
        meta: buildReportMeta(period, "live"),
        summary: { totalLeads: total, rowCount: table.length },
        rows: table,
      });
    } catch (err) {
      next(err);
    }
  });

  // 2. Field Sales Calls Accomplished
  router.get("/field-sales-calls", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const period = await resolveReportPeriod(req, orgId);
      const agentUserId = optionalObjectId(req.query.agentUserId, "agentUserId");

      const match: Record<string, unknown> = {
        activityType: { $in: [...FIELD_SALES_CALL_TYPES] },
        status: { $ne: "CANCELLED" },
        $or: [
          { performedAt: { $gte: period.from, $lte: period.to } },
          {
            performedAt: { $exists: false },
            startsAt: { $gte: period.from, $lte: period.to },
          },
        ],
      };
      if (agentUserId) match.performedByUserId = agentUserId;

      const rows = await ContactActivityModel.aggregate([
        { $match: match },
        {
          $addFields: {
            eventAt: { $ifNull: ["$performedAt", "$startsAt"] },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: "%Y-%m-%d", date: "$eventAt" } },
              performedByUserId: "$performedByUserId",
              activityType: "$activityType",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.day": 1 } },
      ]);

      const names = await userNameMap(rows.map((r) => r._id.performedByUserId));
      const table = rows.map((r) => ({
        date: r._id.day,
        agentUserId: r._id.performedByUserId
          ? String(r._id.performedByUserId)
          : null,
        agentName: r._id.performedByUserId
          ? names.get(String(r._id.performedByUserId)) || "Unknown"
          : "Unknown",
        activityType: r._id.activityType,
        callsAccomplished: r.count,
      }));

      res.json({
        meta: buildReportMeta(
          period,
          "live",
          "Field sales ContactActivity calls (SALES_CALL, TELECALL, COLD_CALL)."
        ),
        summary: {
          totalCalls: table.reduce((s, r) => s + r.callsAccomplished, 0),
          rowCount: table.length,
        },
        rows: table,
      });
    } catch (err) {
      next(err);
    }
  });

  // 3. Leads Generated Daily / MTD / YTD
  router.get("/leads-period-summary", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const propertyId = optionalObjectId(req.query.propertyId, "propertyId");
      const now = new Date();
      const settings = await getOrgSalesSettings(orgId);
      const fy = getFinancialYearRange(settings, now);

      const dayFrom = startOfUtcDay(now);
      const dayTo = endOfUtcDay(now);
      const mtdFrom = startOfUtcMonth(now);
      const ytdFrom = fy.start;
      const to = endOfUtcDay(now);

      const base: Record<string, unknown> = {};
      if (propertyId) base.propertyId = propertyId;

      const countIn = async (from: Date, until: Date) =>
        LeadModel.countDocuments({
          ...base,
          createdAt: { $gte: from, $lte: until },
        });

      const [daily, mtd, ytd] = await Promise.all([
        countIn(dayFrom, dayTo),
        countIn(mtdFrom, to),
        countIn(ytdFrom, to),
      ]);

      // Daily series for current month (for table)
      const monthRows = await LeadModel.aggregate([
        {
          $match: {
            ...base,
            createdAt: { $gte: mtdFrom, $lte: to },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const period = {
        from: ytdFrom,
        to,
        preset: "ytd" as const,
        label: "Daily / MTD / YTD (Financial Year)",
      };

      res.json({
        meta: buildReportMeta(period, "live", "YTD uses organization financial year."),
        summary: {
          daily,
          mtd,
          ytd,
          financialYearStart: fy.start.toISOString(),
        },
        rows: [
          { period: "Daily (Today)", leadsGenerated: daily },
          { period: "MTD", leadsGenerated: mtd },
          { period: "YTD (FY)", leadsGenerated: ytd },
          ...monthRows.map((r) => ({
            period: r._id as string,
            leadsGenerated: r.count as number,
          })),
        ],
      });
    } catch (err) {
      next(err);
    }
  });

  // 4. Conversion % + Revenue + Room Nights (confirmed reservations)
  router.get("/conversion-performance", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const propertyId = optionalObjectId(req.query.propertyId, "propertyId");
      const now = new Date();
      const settings = await getOrgSalesSettings(orgId);
      const fy = getFinancialYearRange(settings, now);

      const buckets: { key: string; label: string; from: Date; to: Date }[] = [
        {
          key: "daily",
          label: "Daily (Today)",
          from: startOfUtcDay(now),
          to: endOfUtcDay(now),
        },
        {
          key: "mtd",
          label: "MTD",
          from: startOfUtcMonth(now),
          to: endOfUtcDay(now),
        },
        {
          key: "ytd",
          label: "YTD (FY)",
          from: fy.start,
          to: endOfUtcDay(now),
        },
      ];

      const leadBase: Record<string, unknown> = {};
      if (propertyId) leadBase.propertyId = propertyId;

      const reservationBase: Record<string, unknown> = {
        status: { $in: [...CONFIRMED_RESERVATION_STATUSES] },
      };
      if (propertyId) reservationBase.propertyId = propertyId;

      const rows = [];
      for (const b of buckets) {
        const leadsCreated = await LeadModel.countDocuments({
          ...leadBase,
          createdAt: { $gte: b.from, $lte: b.to },
        });
        const conversions = await LeadModel.countDocuments({
          ...leadBase,
          status: LeadStatus.CONFIRMED,
          $or: [
            { closedAt: { $gte: b.from, $lte: b.to } },
            {
              closedAt: { $exists: false },
              updatedAt: { $gte: b.from, $lte: b.to },
            },
          ],
        });

        const reservations = await ReservationModel.find({
          ...reservationBase,
          createdAt: { $gte: b.from, $lte: b.to },
        })
          .select("totalAmount checkInDate checkOutDate roomsBooked")
          .lean();

        const confirmedBookingCount = reservations.length;
        const revenue = reservations.reduce(
          (s, r) => s + (typeof r.totalAmount === "number" ? r.totalAmount : 0),
          0
        );
        const roomNights = reservations.reduce(
          (s, r) => s + roomNightsFromReservation(r),
          0
        );
        const conversionPct =
          leadsCreated > 0
            ? Math.round((conversions / leadsCreated) * 10000) / 100
            : 0;

        rows.push({
          period: b.label,
          periodKey: b.key,
          leadsCreated,
          conversions,
          conversionPct,
          confirmedBookingCount,
          revenue,
          roomNights,
        });
      }

      const period = {
        from: fy.start,
        to: endOfUtcDay(now),
        preset: "ytd" as const,
        label: "Conversion Daily / MTD / YTD (FY)",
      };

      res.json({
        meta: buildReportMeta(
          period,
          "live",
          "Revenue and room nights from confirmed reservations (CONFIRMED/CHECKED_IN/CHECKED_OUT). Room nights = nights × roomsBooked."
        ),
        summary: {
          daily: rows.find((r) => r.periodKey === "daily"),
          mtd: rows.find((r) => r.periodKey === "mtd"),
          ytd: rows.find((r) => r.periodKey === "ytd"),
        },
        rows,
      });
    } catch (err) {
      next(err);
    }
  });

  // 5. Agent-wise Call Volume (proxy: answered CallLog + CALL Communications)
  router.get("/agent-call-volume", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const period = await resolveReportPeriod(req, orgId);
      const agentUserId = optionalObjectId(req.query.agentUserId, "agentUserId");

      const callLogMatch: Record<string, unknown> = {
        callDateTime: { $gte: period.from, $lte: period.to },
      };
      if (agentUserId) callLogMatch.agentUserId = agentUserId;

      const callLogRows = await CallLogModel.aggregate([
        { $match: callLogMatch },
        {
          $group: {
            _id: "$agentUserId",
            answeredCalls: { $sum: 1 },
            totalDurationSeconds: { $sum: { $ifNull: ["$durationSeconds", 0] } },
          },
        },
      ]);

      const commMatch: Record<string, unknown> = {
        channel: CommunicationChannel.CALL,
        createdAt: { $gte: period.from, $lte: period.to },
      };
      if (agentUserId) commMatch.performedByUserId = agentUserId;

      const commRows = await CommunicationModel.aggregate([
        { $match: commMatch },
        {
          $group: {
            _id: "$performedByUserId",
            loggedCalls: { $sum: 1 },
          },
        },
      ]);

      const agentIds = [
        ...callLogRows.map((r) => r._id),
        ...commRows.map((r) => r._id),
      ];
      const names = await userNameMap(agentIds);

      const byAgent = new Map<
        string,
        {
          agentUserId: string | null;
          agentName: string;
          answeredCtiCalls: number;
          loggedCommunications: number;
          totalDurationSeconds: number;
        }
      >();

      const keyOf = (id: unknown) => (id ? String(id) : "unassigned");

      for (const r of callLogRows) {
        const k = keyOf(r._id);
        byAgent.set(k, {
          agentUserId: r._id ? String(r._id) : null,
          agentName: r._id ? names.get(String(r._id)) || "Unknown" : "Unassigned",
          answeredCtiCalls: r.answeredCalls,
          loggedCommunications: 0,
          totalDurationSeconds: r.totalDurationSeconds || 0,
        });
      }
      for (const r of commRows) {
        const k = keyOf(r._id);
        const existing = byAgent.get(k);
        if (existing) {
          existing.loggedCommunications = r.loggedCalls;
        } else {
          byAgent.set(k, {
            agentUserId: r._id ? String(r._id) : null,
            agentName: r._id
              ? names.get(String(r._id)) || "Unknown"
              : "Unassigned",
            answeredCtiCalls: 0,
            loggedCommunications: r.loggedCalls,
            totalDurationSeconds: 0,
          });
        }
      }

      const table = Array.from(byAgent.values()).map((r) => ({
        ...r,
        totalVolume: r.answeredCtiCalls + r.loggedCommunications,
      }));
      table.sort((a, b) => b.totalVolume - a.totalVolume);

      res.json({
        meta: buildReportMeta(
          period,
          "proxy",
          "Knowlarity stores answered calls only. Volume = answered CTI CallLog + CALL Communications."
        ),
        summary: {
          totalAnsweredCti: table.reduce((s, r) => s + r.answeredCtiCalls, 0),
          totalLoggedComms: table.reduce((s, r) => s + r.loggedCommunications, 0),
          agentCount: table.length,
        },
        rows: table,
      });
    } catch (err) {
      next(err);
    }
  });

  // 6. Missed Calls — unavailable (Knowlarity drops non-answered)
  router.get("/missed-calls", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const period = await resolveReportPeriod(req, orgId);
      res.json({
        meta: buildReportMeta(
          period,
          "unavailable",
          "Knowlarity ingestion currently discards non-answered calls. Missed-call CDRs are not stored."
        ),
        summary: { totalMissed: 0, rowCount: 0 },
        rows: [],
        reason:
          "Missed calls are not persisted. Extend Knowlarity webhook handling to store unanswered CDRs before this report can show live data.",
      });
    } catch (err) {
      next(err);
    }
  });

  // 7. Call Response Time — proxy: lead first-touch TAT
  router.get("/call-response-time", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const period = await resolveReportPeriod(req, orgId);
      const agentUserId = optionalObjectId(req.query.agentUserId, "agentUserId");

      const pipelineMatch: Record<string, unknown> = {
        leadAssignedAt: { $ne: null },
        firstResponseAt: { $gte: period.from, $lte: period.to },
      };
      if (agentUserId) pipelineMatch.assignedToUserId = agentUserId;

      const rows = await LeadModel.aggregate([
        { $match: pipelineMatch },
        {
          $project: {
            assignedToUserId: 1,
            firstResponseMinutes: {
              $divide: [
                { $subtract: ["$firstResponseAt", "$leadAssignedAt"] },
                1000 * 60,
              ],
            },
          },
        },
        {
          $group: {
            _id: "$assignedToUserId",
            avgFirstResponseMinutes: { $avg: "$firstResponseMinutes" },
            minFirstResponseMinutes: { $min: "$firstResponseMinutes" },
            maxFirstResponseMinutes: { $max: "$firstResponseMinutes" },
            leadsHandled: { $sum: 1 },
          },
        },
        { $sort: { avgFirstResponseMinutes: 1 } },
      ]);

      const names = await userNameMap(rows.map((r) => r._id));
      const table = rows.map((r) => ({
        agentUserId: r._id ? String(r._id) : null,
        agentName: r._id ? names.get(String(r._id)) || "Unknown" : "Unassigned",
        avgFirstResponseMinutes:
          Math.round((r.avgFirstResponseMinutes || 0) * 100) / 100,
        minFirstResponseMinutes:
          Math.round((r.minFirstResponseMinutes || 0) * 100) / 100,
        maxFirstResponseMinutes:
          Math.round((r.maxFirstResponseMinutes || 0) * 100) / 100,
        leadsHandled: r.leadsHandled,
      }));

      const overallAvg =
        table.length > 0
          ? Math.round(
              (table.reduce(
                (s, r) => s + r.avgFirstResponseMinutes * r.leadsHandled,
                0
              ) /
                table.reduce((s, r) => s + r.leadsHandled, 0)) *
                100
            ) / 100
          : 0;

      res.json({
        meta: buildReportMeta(
          period,
          "proxy",
          "Lead first-touch TAT (firstResponseAt − leadAssignedAt), not telephony ring-to-answer."
        ),
        summary: {
          overallAvgFirstResponseMinutes: overallAvg,
          agentCount: table.length,
          leadsSampled: table.reduce((s, r) => s + r.leadsHandled, 0),
        },
        rows: table,
      });
    } catch (err) {
      next(err);
    }
  });

  // 8. Call Disposition (proxy)
  router.get("/call-disposition", async (req, res, next) => {
    try {
      const orgId = defaultOrgId(req);
      const period = await resolveReportPeriod(req, orgId);

      const dispositionRows = await CommunicationModel.aggregate([
        {
          $match: {
            channel: CommunicationChannel.CALL,
            createdAt: { $gte: period.from, $lte: period.to },
            disposition: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: "$disposition",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const callStatusRows = await LeadModel.aggregate([
        {
          $match: {
            callStatus: { $exists: true, $ne: null },
            updatedAt: { $gte: period.from, $lte: period.to },
          },
        },
        {
          $group: {
            _id: "$callStatus",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]);

      const rows = [
        ...dispositionRows.map((r) => ({
          category: "Communication disposition",
          value: r._id || "—",
          count: r.count as number,
        })),
        ...callStatusRows.map((r) => ({
          category: "Lead call status",
          value: r._id || "—",
          count: r.count as number,
        })),
      ];

      res.json({
        meta: buildReportMeta(
          period,
          "proxy",
          "Rollup of Communication.disposition (CALL) and Lead.callStatus. CTI does not always set disposition."
        ),
        summary: {
          dispositionTypes: dispositionRows.length,
          callStatusTypes: callStatusRows.length,
          totalTagged: rows.reduce((s, r) => s + r.count, 0),
        },
        rows,
      });
    } catch (err) {
      next(err);
    }
  });
}
