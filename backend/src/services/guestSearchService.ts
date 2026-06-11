import { GuestModel, IGuest } from "../models/guest";
import { LeadModel } from "../models/lead";
import { ReservationModel } from "../models/reservation";
import { CommunicationModel } from "../models/communication";
import { logger } from "../config/logger";
import { Types } from "mongoose";
import {
  searchCustomersByPhone,
  isPmsCrmConfigured,
  type PmsCrmCustomer,
} from "./pms/postcardResortsCrmClient";

export type PmsLookupStatus = "found" | "not_found" | "not_configured" | "error";

// Plain object type for guest (without Mongoose Document methods)
// This matches the structure returned by .lean()
export interface GuestPlain {
  _id: Types.ObjectId;
  name: string;
  phone?: string;
  email?: string;
  isSunshineMember: boolean;
  sunshineTier?: string | null;
  tags: string[];
  firstSeenAt: Date;
  lastSeenAt: Date;
  totalLeadsCount: number;
  totalReservationsCount: number;
  externalGuestId?: string;
  externalSource?: string;
  lastSyncedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExternalGuestData {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  // Add other fields as needed when external DB structure is known
  [key: string]: any;
}

export interface PmsCustomerSummary {
  customerId: string;
  name?: string;
  phone?: string;
  email?: string;
  loyaltyTier?: string;
  lastStay?: string;
  totalStays?: number;
  preferredProperty?: string;
  raw: Record<string, unknown>;
}

export interface GuestSearchResult {
  guest?: GuestPlain | null;
  source: "local" | "external" | "both";
  externalData?: ExternalGuestData;
  pmsCustomer?: PmsCustomerSummary;
  pmsLookupStatus?: PmsLookupStatus;
  previousLeads?: any[];
  previousReservations?: any[];
  communicationHistory?: any[];
}

function toPmsCustomerSummary(customer: PmsCrmCustomer): PmsCustomerSummary {
  return {
    customerId: customer.customerId,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    loyaltyTier: customer.loyaltyTier,
    lastStay: customer.lastStay,
    totalStays: customer.totalStays,
    preferredProperty: customer.preferredProperty,
    raw: customer.raw,
  };
}

/**
 * Search Postcard home-grown PMS CRM for a customer by phone.
 */
export async function searchGuestInExternalDB(
  phone: string
): Promise<ExternalGuestData | null> {
  const redacted = phone.replace(/\d(?=\d{4})/g, "*");
  logger.info("PMS CRM guest search", { phone: redacted });

  const pmsCustomer = await searchCustomersByPhone(phone);
  if (!pmsCustomer) return null;

  return {
    id: pmsCustomer.customerId,
    name: pmsCustomer.name ?? "Unknown",
    phone: pmsCustomer.phone ?? phone,
    email: pmsCustomer.email,
    ...pmsCustomer.raw,
  };
}

/**
 * Search guest by phone number in local database first, then external database
 */
export async function searchGuestByPhone(
  phone: string
): Promise<GuestSearchResult> {
  // Import phone utilities
  const { normalizePhone } = await import("../utils/phoneUtils");

  // Normalize the search phone
  const normalizedPhone = normalizePhone(phone);

  // Search in local database (primary and secondary phones)
  const localGuest = await GuestModel.findOne({
    $or: [
      { phone: phone },
      { phone: normalizedPhone },
      { secondaryPhones: phone },
      { secondaryPhones: normalizedPhone },
    ],
  }).lean();

  let pmsLookupStatus: PmsLookupStatus = "not_found";
  let pmsHit: PmsCrmCustomer | null = null;

  if (!isPmsCrmConfigured()) {
    pmsLookupStatus = "not_configured";
  } else {
    try {
      pmsHit = await searchCustomersByPhone(phone);
      pmsLookupStatus = pmsHit ? "found" : "not_found";
    } catch (err) {
      logger.error("PMS CRM lookup failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      pmsLookupStatus = "error";
    }
  }

  const externalGuest = pmsHit
    ? {
        id: pmsHit.customerId,
        name: pmsHit.name ?? "Unknown",
        phone: pmsHit.phone ?? phone,
        email: pmsHit.email,
        ...pmsHit.raw,
      }
    : null;

  let guest: GuestPlain | null = null;
  let source: "local" | "external" | "both" = "local";

  if (localGuest && externalGuest) {
    source = "both";
    guest = localGuest as GuestPlain;
  } else if (localGuest) {
    source = "local";
    guest = localGuest as GuestPlain;
  } else if (externalGuest) {
    source = "external";
    guest = {
      _id: new Types.ObjectId(),
      name: externalGuest.name,
      phone: externalGuest.phone,
      email: externalGuest.email,
      isSunshineMember: Boolean(pmsHit?.loyaltyTier),
      sunshineTier: pmsHit?.loyaltyTier ?? null,
      tags: [],
      firstSeenAt: new Date(),
      lastSeenAt: new Date(),
      totalLeadsCount: 0,
      totalReservationsCount: pmsHit?.totalStays ?? 0,
      externalGuestId: externalGuest.id,
      externalSource: "pms_crm",
      lastSyncedAt: new Date(),
    } as GuestPlain;
  }

  // Fetch guest history if guest found
  let previousLeads: any[] = [];
  let previousReservations: any[] = [];
  let communicationHistory: any[] = [];

  if (guest && guest._id) {
    // Get previous leads
    previousLeads = await LeadModel.find({ guestId: guest._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get previous reservations
    previousReservations = await ReservationModel.find({ guestId: guest._id })
      .sort({ checkInDate: -1 })
      .limit(10)
      .lean();

    // Get communication history
    communicationHistory = await CommunicationModel.find({
      $or: [{ guestId: guest._id }, { leadId: { $in: previousLeads.map((l) => l._id) } }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  }

  return {
    guest,
    source,
    externalData: externalGuest || undefined,
    pmsCustomer: pmsHit ? toPmsCustomerSummary(pmsHit) : undefined,
    pmsLookupStatus,
    previousLeads,
    previousReservations,
    communicationHistory,
  };
}

/**
 * Search guest by email
 */
export async function searchGuestByEmail(
  email: string
): Promise<GuestSearchResult> {
  // Import email utilities
  const { normalizeEmail } = await import("../utils/phoneUtils");

  // Normalize the search email
  const normalizedEmail = normalizeEmail(email);

  const localGuest = await GuestModel.findOne({
    $or: [
      { email: normalizedEmail },
      { secondaryEmails: normalizedEmail },
    ],
  }).lean();

  let previousLeads: any[] = [];
  let previousReservations: any[] = [];
  let communicationHistory: any[] = [];

  if (localGuest) {
    previousLeads = await LeadModel.find({ guestId: localGuest._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    previousReservations = await ReservationModel.find({ guestId: localGuest._id })
      .sort({ checkInDate: -1 })
      .limit(10)
      .lean();

    communicationHistory = await CommunicationModel.find({
      $or: [{ guestId: localGuest._id }, { leadId: { $in: previousLeads.map((l) => l._id) } }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
  }

  return {
    guest: localGuest as GuestPlain | null,
    source: localGuest ? "local" : "external",
    previousLeads,
    previousReservations,
    communicationHistory,
  };
}

