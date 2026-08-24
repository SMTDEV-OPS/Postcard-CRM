import { Router } from "express";
import { Types } from "mongoose";
import { requireAuth, hasPermission } from "../middleware/auth";
import { PERMISSIONS } from "../constants/permissions";
import { badRequest, forbidden } from "../utils/httpError";
import {
  buildHandoverPreview,
  executeHandover,
} from "../services/executiveBookingService";

export const handoverRouter = Router();

function canManageHandover(req: {
  user?: { isAdmin?: boolean; permissions?: string[]; id?: string; email?: string };
}): boolean {
  if (!req.user) return false;
  if (req.user.isAdmin) return true;
  const u = req.user as Parameters<typeof hasPermission>[0];
  return (
    hasPermission(u, PERMISSIONS.LEADS.MANAGE) ||
    hasPermission(u, PERMISSIONS.ACCOUNTS.ASSIGN_MANAGERS) ||
    hasPermission(u, PERMISSIONS.ACCOUNTS.MANAGE) ||
    hasPermission(u, PERMISSIONS.USERS.MANAGE)
  );
}

handoverRouter.use(requireAuth);

handoverRouter.get("/:userId/preview", async (req, res, next) => {
  try {
    if (!canManageHandover(req)) {
      throw forbidden("Insufficient permissions for handover");
    }
    const userId = String(req.params.userId || "");
    if (!Types.ObjectId.isValid(userId)) throw badRequest("Invalid userId");
    const data = await buildHandoverPreview(new Types.ObjectId(userId));
    res.json(data);
  } catch (err) {
    next(err);
  }
});

handoverRouter.post("/", async (req, res, next) => {
  try {
    if (!canManageHandover(req)) {
      throw forbidden("Insufficient permissions for handover");
    }
    const { fromUserId, toUserId, leadIds, accountIds, contactIds } =
      req.body || {};
    if (!Types.ObjectId.isValid(String(fromUserId))) {
      throw badRequest("Invalid fromUserId");
    }
    if (!Types.ObjectId.isValid(String(toUserId))) {
      throw badRequest("Invalid toUserId");
    }
    if (String(fromUserId) === String(toUserId)) {
      throw badRequest("fromUserId and toUserId must differ");
    }

    const toOid = (v: unknown) => {
      const s = String(v || "");
      if (!Types.ObjectId.isValid(s)) return null;
      return new Types.ObjectId(s);
    };

    const leads = (Array.isArray(leadIds) ? leadIds : [])
      .map(toOid)
      .filter(Boolean) as Types.ObjectId[];
    const accounts = (Array.isArray(accountIds) ? accountIds : [])
      .map(toOid)
      .filter(Boolean) as Types.ObjectId[];
    const contacts = (Array.isArray(contactIds) ? contactIds : [])
      .map(toOid)
      .filter(Boolean) as Types.ObjectId[];

    if (!leads.length && !accounts.length && !contacts.length) {
      throw badRequest("Select at least one lead, account, or contact");
    }

    const result = await executeHandover({
      fromUserId: new Types.ObjectId(String(fromUserId)),
      toUserId: new Types.ObjectId(String(toUserId)),
      leadIds: leads,
      accountIds: accounts,
      contactIds: contacts,
    });

    res.json({ ok: true, ...result });
  } catch (err) {
    next(err);
  }
});
