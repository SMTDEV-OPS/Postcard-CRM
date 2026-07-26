import { Schema, Types } from "mongoose";

export type ObjectId = Types.ObjectId;

export enum SunshineTier {
  GOLD = "GOLD",
  PLATINUM = "PLATINUM",
  BLACK = "BLACK",
}

export enum LeadSource {
  DIRECT_CALL = "DIRECT_CALL",
  UNIT = "UNIT",
  EMAIL = "EMAIL",
  REPEAT_GUEST = "REPEAT_GUEST",
  REFERRAL = "REFERRAL",
  CORPORATE_OFFICE = "CORPORATE_OFFICE",
  BRAND_WEBSITE = "BRAND_WEBSITE",
  SOCIAL = "SOCIAL",
  VIP_MR_CHOPRA = "VIP_MR_CHOPRA",
  TRAVEL_AGENT = "TRAVEL_AGENT",
  WALK_IN = "WALK_IN",
  EVENT_MICE = "EVENT_MICE",
  // New SOP sources
  IVR = "IVR",
  IVR_LIVE = "IVR_LIVE",
  WHATSAPP = "WHATSAPP",
  MANUAL = "MANUAL",
  CSV_UPLOAD = "CSV_UPLOAD",
  // Field sales sources
  DOMESTIC_TA = "DOMESTIC_TA",
  INBOUND_TA = "INBOUND_TA",
  FTO = "FTO",
  DIRECT_GUEST = "DIRECT_GUEST",
  CORPORATE_COMPANY = "CORPORATE_COMPANY",
  EVENT_MGMT = "EVENT_MGMT",
  WEDDING_PLANNER = "WEDDING_PLANNER",
}

export enum LeadType {
  STAY = "STAY",
  DINING = "DINING",
  INFORMATION = "INFORMATION",
  MICE = "MICE",
  WEDDING = "WEDDING",
}

/**
 * Legacy status enum - kept for backward compatibility with existing data
 * The new "LeadStage" enum should be used for the SOP-defined pipeline.
 */
export enum LeadStatus {
  NEW = "NEW",
  CONTACTED = "CONTACTED",
  QUOTATION_SHARED = "QUOTATION_SHARED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  ON_HOLD = "ON_HOLD",
  CONFIRMED = "CONFIRMED",
  LOST = "LOST",
  CLOSED_AUTO = "CLOSED_AUTO",
  UNASSIGNED_OVERFLOW = "UNASSIGNED_OVERFLOW",
}

/**
 * SOP-defined 5-stage pipeline
 * New Lead -> 1st Connect -> Discussion -> Payment Request -> Booked/Lost
 */
export enum LeadStage {
  NEW_LEAD = "NEW_LEAD",
  FIRST_CONNECT = "FIRST_CONNECT",
  DISCUSSION = "DISCUSSION",
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
  BOOKED = "BOOKED",
  LOST = "LOST",
}

export enum HeatLevel {
  HOT = "HOT",
  WARM = "WARM",
  COLD = "COLD",
  NOT_INTERESTED = "NOT_INTERESTED",
}

export enum ClosedReason {
  // Current selectable reasons (Lost UI)
  DESTINATION_CHANGED = "DESTINATION_CHANGED",
  EXPERIENCES_NOT_AVAILABLE = "EXPERIENCES_NOT_AVAILABLE",
  CONFIRMED_ANOTHER_TA = "CONFIRMED_ANOTHER_TA",
  CONFIRMED_ANOTHER_SALESPERSON = "CONFIRMED_ANOTHER_SALESPERSON",
  CONFIRMED_RESERVATIONS = "CONFIRMED_RESERVATIONS",
  LOST_TO_ALTERNATE_HOTEL = "LOST_TO_ALTERNATE_HOTEL",
  // Legacy values retained for historical records and auto-close jobs
  PRICE = "PRICE",
  NO_AVAILABILITY = "NO_AVAILABILITY",
  GUEST_NOT_RESPONDING = "GUEST_NOT_RESPONDING",
  OTHER = "OTHER",
  SOLD_OUT = "SOLD_OUT",
  BUDGET = "BUDGET",
  BOOKED_OTA = "BOOKED_OTA",
  BOOKED_WEBSITE = "BOOKED_WEBSITE",
  BOOKED_OTHER_PROPERTY = "BOOKED_OTHER_PROPERTY",
  NO_RESPONSE = "NO_RESPONSE",
  POLICY_UNDER_18 = "POLICY_UNDER_18",
  POLICY_LOCAL_ID = "POLICY_LOCAL_ID",
  POLICY_PET = "POLICY_PET",
  POLICY_ALCOHOL = "POLICY_ALCOHOL",
  POLICY_CREDIT_CARD = "POLICY_CREDIT_CARD",
  PROPERTY_MAINTENANCE = "PROPERTY_MAINTENANCE",
}

/** Reasons shown when marking a lead Lost (excludes legacy auto-close codes). */
export const SELECTABLE_CLOSED_REASONS: ClosedReason[] = [
  ClosedReason.DESTINATION_CHANGED,
  ClosedReason.EXPERIENCES_NOT_AVAILABLE,
  ClosedReason.CONFIRMED_ANOTHER_TA,
  ClosedReason.CONFIRMED_ANOTHER_SALESPERSON,
  ClosedReason.CONFIRMED_RESERVATIONS,
  ClosedReason.LOST_TO_ALTERNATE_HOTEL,
];

export const CLOSED_REASON_LABELS: Record<string, string> = {
  DESTINATION_CHANGED: "Destination changed",
  EXPERIENCES_NOT_AVAILABLE: "Experiences not available",
  CONFIRMED_ANOTHER_TA: "Confirmed through another source – Another TA",
  CONFIRMED_ANOTHER_SALESPERSON: "Confirmed through another source – Another Sales person",
  CONFIRMED_RESERVATIONS: "Confirmed through another source – Reservations",
  LOST_TO_ALTERNATE_HOTEL: "Lost to alternate hotel",
  PRICE: "Price",
  NO_AVAILABILITY: "No availability",
  GUEST_NOT_RESPONDING: "Guest not responding",
  OTHER: "Other",
  SOLD_OUT: "Sold out",
  BUDGET: "Budget",
  BOOKED_OTA: "Booked elsewhere – OTA",
  BOOKED_WEBSITE: "Booked elsewhere – Website",
  BOOKED_OTHER_PROPERTY: "Booked elsewhere – Other property",
  NO_RESPONSE: "No response",
  POLICY_UNDER_18: "Policy – Under 18",
  POLICY_LOCAL_ID: "Policy – Local ID",
  POLICY_PET: "Policy – Pet",
  POLICY_ALCOHOL: "Policy – Alcohol",
  POLICY_CREDIT_CARD: "Policy – Credit card",
  PROPERTY_MAINTENANCE: "Property under maintenance",
};

export function formatClosedReasonLabel(reason?: string | null): string {
  if (!reason) return "—";
  return CLOSED_REASON_LABELS[reason] ?? reason;
}

export enum CommunicationChannel {
  CALL = "CALL",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
  SMS = "SMS",
}

export enum CommunicationDirection {
  INBOUND = "INBOUND",
  OUTBOUND = "OUTBOUND",
}

export enum CommunicationDisposition {
  SHOPPING_CALL = "SHOPPING_CALL",
  SHOPPING_FOLLOW_UP = "SHOPPING_FOLLOW_UP",
  NO_FOLLOW_UP = "NO_FOLLOW_UP",
  INFORMATION_QUERY = "INFORMATION_QUERY",
  DINING_INQUIRY = "DINING_INQUIRY",
  RESERVATION_CONFIRMED = "RESERVATION_CONFIRMED",
  CANCELLATION_REQUEST = "CANCELLATION_REQUEST",
  AMENDMENT_REQUEST = "AMENDMENT_REQUEST",
}

export enum CallStatus {
  QUOTATION_SHARED = "QUOTATION_SHARED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  NOT_INTERESTED = "NOT_INTERESTED",
}

export enum TicketStatus {
  NEW = "NEW",
  IN_PROGRESS = "IN_PROGRESS",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
  CANCELLED = "CANCELLED",
}

export enum TicketPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum TicketCategory {
  TECHNICAL = "TECHNICAL",
  BILLING = "BILLING",
  GENERAL = "GENERAL",
  FEATURE_REQUEST = "FEATURE_REQUEST",
  BUG_REPORT = "BUG_REPORT",
}

export enum PMSProvider {
  NONE = "NONE",
  EZEE = "EZEE",
}

export const GuestRef = { type: Schema.Types.ObjectId, ref: "Guest", index: true };
export const UserRef = { type: Schema.Types.ObjectId, ref: "User", index: true };
export const RoleRef = { type: Schema.Types.ObjectId, ref: "Role", index: true };
export const PropertyRef = { type: Schema.Types.ObjectId, ref: "Property", index: true };
export const LeadRef = { type: Schema.Types.ObjectId, ref: "Lead", index: true };
export const AccountRef = { type: Schema.Types.ObjectId, ref: "Account", index: true };
export const RegionRef = { type: Schema.Types.ObjectId, ref: "Region", index: true };
export const TicketRef = { type: Schema.Types.ObjectId, ref: "Ticket", index: true };
export const ProfileRef = { type: Schema.Types.ObjectId, ref: "Profile", index: true };
