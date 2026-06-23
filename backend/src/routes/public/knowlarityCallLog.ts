import { Router, Request, Response } from "express";
import { z } from "zod";
import { config } from "../../config/env";
import { logger } from "../../config/logger";
import { processKnowlarityCallLog } from "../../services/knowlarityCallLogService";

export const publicKnowlarityCallLogRouter = Router();

const knowlarityLogPushSchema = z.object({
  call_date: z.string().min(1),
  call_time: z.string().min(1),
  caller_number: z.string().min(1),
  call_direction: z.string().min(1),
  called_number: z.string().optional(),
  call_status: z.string().min(1),
  agent_number: z.string().optional(),
  call_transfer_status: z.string().optional(),
  caller_duration: z.union([z.string(), z.number()]).optional(),
  recording_url: z.string().optional(),
  call_uuid: z.string().min(1),
  hangup_cause: z.string().optional(),
});

function validateWebhookSecret(req: Request): boolean {
  const secret = config.knowlarityWebhookSecret?.trim();
  if (!secret) return true;
  const header = req.get("x-webhook-secret")?.trim();
  return header === secret;
}

/** Reachability probe — Knowlarity can GET this before configuring Log Push. */
publicKnowlarityCallLogRouter.get("/", (_req, res) => {
  const secret = config.knowlarityWebhookSecret?.trim();
  res.json({
    status: "ready",
    method: "POST",
    path: "/api/public/knowlarity-call-log",
    authRequired: Boolean(secret),
    secretConfigured: Boolean(secret),
    secretLength: secret ? secret.length : 0,
  });
});

publicKnowlarityCallLogRouter.post("/", async (req, res) => {
  try {
    if (!validateWebhookSecret(req)) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const parsed = knowlarityLogPushSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(", ");
      return res.status(400).json({ status: "error", message });
    }

    const rawPayload =
      typeof req.body === "object" && req.body !== null
        ? (req.body as Record<string, unknown>)
        : {};

    const result = await processKnowlarityCallLog(parsed.data, rawPayload);

    if (result.status === "ignored") {
      return res.status(200).json({ status: "ignored", reason: result.reason });
    }

    return res.status(200).json({
      status: "ok",
      call_log_id: result.callLogId,
      agent_user_id: result.agentUserId,
      duplicate: result.duplicate,
    });
  } catch (err) {
    logger.error("Knowlarity call log webhook failed", {
      error: err instanceof Error ? err.message : String(err),
    });
    return res.status(200).json({ status: "error", message: "Internal processing error" });
  }
});
