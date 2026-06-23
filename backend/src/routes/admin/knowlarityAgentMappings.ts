import { Router } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { requireAuth, requirePermissions } from "../../middleware/auth";
import { PERMISSIONS } from "../../constants/permissions";
import { KnowlarityAgentMappingModel } from "../../models/knowlarityAgentMapping";
import { UserModel } from "../../models/user";
import { badRequest, notFound } from "../../utils/httpError";
import { normalizeAgentNumber } from "../../utils/agentNumberUtils";
import { AccessControlService } from "../../services/auth/AccessControlService";

export const adminKnowlarityAgentMappingsRouter = Router();

adminKnowlarityAgentMappingsRouter.use(requireAuth);
adminKnowlarityAgentMappingsRouter.use(requirePermissions([PERMISSIONS.SETTINGS.MANAGE]));

const mappingBodySchema = z.object({
  agentNumber: z.string().min(1),
  userId: z.string().min(1),
  isActive: z.boolean().optional(),
  label: z.string().optional(),
});

adminKnowlarityAgentMappingsRouter.get("/", async (_req, res, next) => {
  try {
    const mappings = await KnowlarityAgentMappingModel.find()
      .sort({ agentNumber: 1 })
      .populate("userId", "name email phone status")
      .lean();
    res.json(mappings);
  } catch (err) {
    next(err);
  }
});

adminKnowlarityAgentMappingsRouter.get("/call-center-users", async (_req, res, next) => {
  try {
    const users = await UserModel.find({ status: "ACTIVE" })
      .select("name email phone")
      .lean();

    const eligible: Array<{ _id: string; name: string; email: string; phone?: string }> = [];
    for (const user of users) {
      const { permissions, isAdmin } = await AccessControlService.getUserPermissions(
        user._id.toString()
      );
      if (isAdmin || permissions.includes("callcenter.access")) {
        eligible.push({
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
        });
      }
    }

    res.json(eligible);
  } catch (err) {
    next(err);
  }
});

adminKnowlarityAgentMappingsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = mappingBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(parsed.error.errors[0]?.message ?? "Invalid payload");
    }

    if (!Types.ObjectId.isValid(parsed.data.userId)) {
      throw badRequest("userId must be a valid ObjectId");
    }

    const user = await UserModel.findById(parsed.data.userId);
    if (!user || user.status !== "ACTIVE") {
      throw badRequest("User not found or inactive");
    }

    const { primary, digits } = normalizeAgentNumber(parsed.data.agentNumber);

    const doc = await KnowlarityAgentMappingModel.create({
      agentNumber: primary,
      agentNumberDigits: digits,
      userId: new Types.ObjectId(parsed.data.userId),
      isActive: parsed.data.isActive ?? true,
      label: parsed.data.label,
    });

    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

adminKnowlarityAgentMappingsRouter.put("/:id", async (req, res, next) => {
  try {
    const parsed = mappingBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw badRequest(parsed.error.errors[0]?.message ?? "Invalid payload");
    }

    const doc = await KnowlarityAgentMappingModel.findById(req.params.id);
    if (!doc) throw notFound("Mapping not found");

    if (parsed.data.agentNumber) {
      const { primary, digits } = normalizeAgentNumber(parsed.data.agentNumber);
      doc.agentNumber = primary;
      doc.agentNumberDigits = digits;
    }
    if (parsed.data.userId) {
      if (!Types.ObjectId.isValid(parsed.data.userId)) {
        throw badRequest("userId must be a valid ObjectId");
      }
      doc.userId = new Types.ObjectId(parsed.data.userId);
    }
    if (parsed.data.isActive !== undefined) doc.isActive = parsed.data.isActive;
    if (parsed.data.label !== undefined) doc.label = parsed.data.label;

    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

adminKnowlarityAgentMappingsRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await KnowlarityAgentMappingModel.findByIdAndDelete(req.params.id);
    if (!result) throw notFound("Mapping not found");
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
