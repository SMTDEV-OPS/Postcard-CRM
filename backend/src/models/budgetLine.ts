import { Schema, model, Document, Types } from "mongoose";

export type BudgetKind = "LY" | "BUDGET";
export type BudgetPeriod = "Q1" | "Q2" | "Q3" | "Q4" | "H1" | "H2" | "TOTAL";

export interface IBudgetLine extends Document {
  orgId: Types.ObjectId;
  kind: BudgetKind;
  executiveUserId?: Types.ObjectId;
  executiveName?: string;
  propertyId?: Types.ObjectId;
  hotelName: string;
  /** FY start calendar year (e.g. 2025 for FY 2025-26 when FY starts in April). */
  fyStartYear: number;
  period: BudgetPeriod;
  roomRevenue: number;
  roomNights: number;
  uploadedByUserId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const budgetLineSchema = new Schema<IBudgetLine>(
  {
    orgId: { type: Schema.Types.ObjectId, required: true, index: true },
    kind: { type: String, enum: ["LY", "BUDGET"], required: true, index: true },
    executiveUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    executiveName: String,
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    hotelName: { type: String, required: true, trim: true },
    fyStartYear: { type: Number, required: true, index: true },
    period: {
      type: String,
      enum: ["Q1", "Q2", "Q3", "Q4", "H1", "H2", "TOTAL"],
      required: true,
    },
    roomRevenue: { type: Number, default: 0 },
    roomNights: { type: Number, default: 0 },
    uploadedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

budgetLineSchema.index(
  {
    orgId: 1,
    kind: 1,
    fyStartYear: 1,
    period: 1,
    hotelName: 1,
    executiveUserId: 1,
  },
  { unique: true }
);

export const BudgetLineModel = model<IBudgetLine>("BudgetLine", budgetLineSchema);
