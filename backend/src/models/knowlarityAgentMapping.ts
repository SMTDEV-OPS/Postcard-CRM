import { Schema, model, Document, Types } from "mongoose";
import { UserRef } from "./common";

export interface IKnowlarityAgentMapping extends Document {
  agentNumber: string;
  agentNumberDigits: string;
  userId: Types.ObjectId;
  isActive: boolean;
  label?: string;
  createdAt: Date;
  updatedAt: Date;
}

const knowlarityAgentMappingSchema = new Schema<IKnowlarityAgentMapping>(
  {
    agentNumber: { type: String, required: true, unique: true, index: true },
    agentNumberDigits: { type: String, required: true, index: true },
    userId: { ...UserRef, required: true },
    isActive: { type: Boolean, default: true },
    label: String,
  },
  { timestamps: true }
);

export const KnowlarityAgentMappingModel = model<IKnowlarityAgentMapping>(
  "KnowlarityAgentMapping",
  knowlarityAgentMappingSchema
);
