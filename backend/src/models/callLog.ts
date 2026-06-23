import { Schema, model, Document, Types } from "mongoose";
import { GuestRef, LeadRef, UserRef } from "./common";

export interface ICallLog extends Document {
  callUuid: string;
  agentUserId?: Types.ObjectId;
  callerNumber: string;
  calledNumber?: string;
  direction: string;
  status: string;
  durationSeconds?: number;
  recordingUrl?: string;
  hangupCause?: string;
  transferStatus?: string;
  callDateTime: Date;
  rawPayload: Record<string, unknown>;
  leadId?: Types.ObjectId;
  guestId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const callLogSchema = new Schema<ICallLog>(
  {
    callUuid: { type: String, required: true, unique: true, index: true },
    agentUserId: UserRef,
    callerNumber: { type: String, required: true, index: true },
    calledNumber: String,
    direction: { type: String, required: true },
    status: { type: String, required: true, index: true },
    durationSeconds: Number,
    recordingUrl: String,
    hangupCause: String,
    transferStatus: String,
    callDateTime: { type: Date, required: true, index: true },
    rawPayload: { type: Schema.Types.Mixed, required: true },
    leadId: LeadRef,
    guestId: GuestRef,
  },
  { timestamps: true }
);

callLogSchema.index({ agentUserId: 1, callDateTime: -1 });

export const CallLogModel = model<ICallLog>("CallLog", callLogSchema);
