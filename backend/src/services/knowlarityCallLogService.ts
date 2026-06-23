import { Types } from "mongoose";
import { CallLogModel } from "../models/callLog";
import { KnowlarityAgentMappingModel } from "../models/knowlarityAgentMapping";
import { GuestModel } from "../models/guest";
import { LeadModel } from "../models/lead";
import { LeadActivityModel, LeadActivityType } from "../models/leadActivity";
import { CommunicationModel } from "../models/communication";
import {
  CommunicationChannel,
  CommunicationDirection,
  LeadStatus,
} from "../models/common";
import { AccessControlService } from "./auth/AccessControlService";
import { normalizeAgentNumber } from "../utils/agentNumberUtils";
import { normalizePhone } from "../utils/phoneUtils";
import { logger } from "../config/logger";

export const ANSWERED_CALL_STATUSES = new Set([
  "answered",
  "completed",
  "connected",
  "answer",
  "success",
  "agent answered",
]);

export interface KnowlarityLogPushPayload {
  call_date: string;
  call_time: string;
  caller_number: string;
  call_direction: string;
  called_number?: string;
  call_status: string;
  agent_number?: string;
  call_transfer_status?: string;
  caller_duration?: string | number;
  recording_url?: string;
  call_uuid: string;
  hangup_cause?: string;
}

export type ProcessCallLogResult =
  | { status: "ok"; callLogId: string; agentUserId: string; duplicate: boolean }
  | { status: "ignored"; reason: string };

function parseCallDateTime(callDate: string, callTime: string): Date {
  const iso = `${callDate}T${callTime}`;
  const parsed = new Date(iso);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  return new Date();
}

function parseDuration(value?: string | number): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : undefined;
}

export async function resolveAgentUserId(
  agentNumber?: string
): Promise<{ userId: string } | null> {
  if (!agentNumber?.trim()) return null;

  const { primary, digits } = normalizeAgentNumber(agentNumber);
  const mapping = await KnowlarityAgentMappingModel.findOne({
    isActive: true,
    $or: [{ agentNumber: primary }, { agentNumberDigits: digits }],
  }).lean();

  if (!mapping) return null;
  return { userId: mapping.userId.toString() };
}

async function agentHasCallCenterAccess(userId: string): Promise<boolean> {
  const { permissions, isAdmin } = await AccessControlService.getUserPermissions(userId);
  if (isAdmin) return true;
  return permissions.includes("callcenter.access");
}

async function findLeadAndGuestForCaller(callerNumber: string): Promise<{
  leadId?: Types.ObjectId;
  guestId?: Types.ObjectId;
}> {
  const normalized = normalizePhone(callerNumber);
  const digits = callerNumber.replace(/\D/g, "");
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

  const orConditions: Record<string, unknown>[] = [{ phone: callerNumber }];
  if (normalized) orConditions.push({ phone: normalized });
  if (last10) {
    orConditions.push({ phone: { $regex: `${last10}$` } });
    orConditions.push({ secondaryPhones: last10 });
  }

  const guest = await GuestModel.findOne({ $or: orConditions }).lean();
  if (!guest) return {};

  const lead = await LeadModel.findOne({
    guestId: guest._id,
    status: {
      $nin: [LeadStatus.LOST, LeadStatus.CLOSED_AUTO, LeadStatus.CONFIRMED],
    },
  })
    .sort({ createdAt: -1 })
    .lean();

  return {
    guestId: guest._id as Types.ObjectId,
    leadId: lead?._id as Types.ObjectId | undefined,
  };
}

export async function processKnowlarityCallLog(
  payload: KnowlarityLogPushPayload,
  rawPayload: Record<string, unknown>
): Promise<ProcessCallLogResult> {
  const existing = await CallLogModel.findOne({ callUuid: payload.call_uuid }).lean();
  if (existing) {
    return {
      status: "ok",
      callLogId: existing._id.toString(),
      agentUserId: existing.agentUserId?.toString() ?? "",
      duplicate: true,
    };
  }

  const statusNorm = payload.call_status.trim().toLowerCase();
  const isAnswered = ANSWERED_CALL_STATUSES.has(statusNorm);

  if (!isAnswered) {
    return { status: "ignored", reason: "call_not_answered" };
  }

  const agent = await resolveAgentUserId(payload.agent_number);
  if (!agent) {
    return { status: "ignored", reason: "agent_not_mapped" };
  }

  const hasAccess = await agentHasCallCenterAccess(agent.userId);
  if (!hasAccess) {
    return { status: "ignored", reason: "not_call_center_agent" };
  }

  const callDateTime = parseCallDateTime(payload.call_date, payload.call_time);
  const durationSeconds = parseDuration(payload.caller_duration);
  const direction = payload.call_direction.trim().toLowerCase();

  const { leadId, guestId } =
    direction === "inbound"
      ? await findLeadAndGuestForCaller(payload.caller_number)
      : {};

  const callLog = await CallLogModel.create({
    callUuid: payload.call_uuid,
    agentUserId: new Types.ObjectId(agent.userId),
    callerNumber: payload.caller_number,
    calledNumber: payload.called_number,
    direction,
    status: statusNorm,
    durationSeconds,
    recordingUrl: payload.recording_url,
    hangupCause: payload.hangup_cause,
    transferStatus: payload.call_transfer_status,
    callDateTime,
    rawPayload,
    leadId,
    guestId,
  });

  if (leadId) {
    const summaryParts = [
      `Knowlarity call (${direction})`,
      payload.caller_number,
      durationSeconds != null ? `${durationSeconds}s` : null,
    ].filter(Boolean);

    await LeadActivityModel.create({
      leadId,
      type: LeadActivityType.INBOUND_CALL,
      note: summaryParts.join(" · "),
      performedByUserId: new Types.ObjectId(agent.userId),
      performedAt: callDateTime,
      metadata: {
        callUuid: payload.call_uuid,
        recordingUrl: payload.recording_url,
        durationSeconds,
        provider: "knowlarity",
      },
    });

    await CommunicationModel.create({
      leadId,
      guestId,
      channel: CommunicationChannel.CALL,
      direction:
        direction === "outbound"
          ? CommunicationDirection.OUTBOUND
          : CommunicationDirection.INBOUND,
      summary: summaryParts.join(" · "),
      performedByUserId: new Types.ObjectId(agent.userId),
      rawPayload,
      metadata: {
        callUuid: payload.call_uuid,
        recordingUrl: payload.recording_url,
        from: payload.caller_number,
        to: payload.called_number,
      },
    });
  }

  logger.info("Knowlarity call log stored", {
    callUuid: payload.call_uuid,
    agentUserId: agent.userId,
    leadId: leadId?.toString(),
  });

  return {
    status: "ok",
    callLogId: callLog._id.toString(),
    agentUserId: agent.userId,
    duplicate: false,
  };
}
