import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { logger } from "../../config/logger";
import { emitToUser } from "../../websocket";
import { UserModel } from "../../models/user";

export const publicKnowlarityWebhooksRouter = Router();

const knowlarityPayloadSchema = z.object({
  From: z.string().optional(),
  To: z.string().optional(),
  CallSid: z.string().optional(),
  AgentId: z.string().optional(),
  Event: z.string().optional(),
  // Alternate casing from providers
  from: z.string().optional(),
  to: z.string().optional(),
  call_sid: z.string().optional(),
  agent_id: z.string().optional(),
  event: z.string().optional(),
});

function normalizeEvent(event?: string): string {
  return (event ?? "").toLowerCase().trim();
}

function resolvePhone(data: z.infer<typeof knowlarityPayloadSchema>): string | null {
  const phone = data.From ?? data.from;
  return phone?.trim() || null;
}

function resolveAgentId(data: z.infer<typeof knowlarityPayloadSchema>): string | null {
  const agentId = data.AgentId ?? data.agent_id;
  return agentId?.trim() || null;
}

/**
 * Knowlarity CTI webhook stub — emits call:incoming to the target CRM agent.
 * AgentId should be the CRM user MongoDB _id until Knowlarity mapping is finalized.
 */
publicKnowlarityWebhooksRouter.post("/", async (req, res) => {
  try {
    const parsed = knowlarityPayloadSchema.safeParse({ ...req.query, ...req.body });
    if (!parsed.success) {
      logger.warn("Knowlarity webhook: invalid payload", {
        errors: parsed.error.errors.map((e) => e.message),
      });
      return res.status(200).send("Ignored");
    }

    const data = parsed.data;
    const event = normalizeEvent(data.Event ?? data.event);
    const phone = resolvePhone(data);
    const agentId = resolveAgentId(data);
    const callSid = data.CallSid ?? data.call_sid;

    logger.info("Knowlarity webhook received", {
      event: event || "unknown",
      phone: phone ? phone.slice(0, 4) + "****" : null,
      agentId,
      callSid,
    });

    if (!phone) {
      return res.status(200).send("Ignored");
    }

    const isIncoming = ["ringing", "answered", "incoming", "start"].includes(event) || !event;

    if (!isIncoming) {
      return res.status(200).send("OK");
    }

    if (!agentId || !Types.ObjectId.isValid(agentId)) {
      logger.warn("Knowlarity webhook: missing or invalid AgentId — cannot route call", {
        agentId,
      });
      return res.status(200).send("OK");
    }

    const user = await UserModel.findById(agentId).lean();
    if (!user) {
      logger.warn("Knowlarity webhook: agent user not found", { agentId });
      return res.status(200).send("OK");
    }

    emitToUser(agentId, "call:incoming", {
      phone,
      callSid: callSid ?? null,
      to: data.To ?? data.to ?? null,
      event: event || "ringing",
      timestamp: new Date().toISOString(),
    });

    return res.status(200).send("OK");
  } catch (err) {
    logger.error("Knowlarity webhook processing failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(200).send("Error");
  }
});
