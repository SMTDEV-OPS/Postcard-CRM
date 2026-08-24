import { Types } from "mongoose";
import { LeadModel } from "../models/lead";
import { LeadItineraryModel } from "../models/leadItinerary";
import { ReservationModel } from "../models/reservation";
import { AccountModel } from "../models/account";
import { ContactModel } from "../models/contact";
import { UserModel } from "../models/user";
import { LeadStatus } from "../models/common";
import {
  roomNightsFromReservation,
  CONFIRMED_RESERVATION_STATUSES,
} from "./reportPeriod";

export type ExecutiveBookingRow = {
  leadId: string;
  accountId?: string;
  executiveUserId?: string;
  executiveName: string;
  hotelName: string;
  propertyId?: string;
  checkIn: string;
  checkOut: string;
  bookerName: string;
  city: string;
  country: string;
  mobile: string;
  email: string;
  company: string;
  companyType: string;
  roomNights: number;
  adr: number;
  revenue: number;
  status: string;
};

export type HandoverContactRow = {
  contactId: string;
  accountId?: string;
  contactType: string;
  salutation: string;
  firstName: string;
  lastName: string;
  companyName: string;
  jobTitle: string;
  address: string;
  city: string;
  mobile: string;
  email: string;
  website: string;
  notes: string;
  dataUploadedOn: string;
  executiveName: string;
  executiveUserId?: string;
  zone: string;
};

export type HandoverAccountRow = {
  accountId: string;
  name: string;
  type: string;
  city: string;
  zone: string;
  role: "PAM" | "SAM";
};

function customDataGet(
  customData: Map<string, unknown> | Record<string, unknown> | undefined,
  key: string
): unknown {
  if (!customData) return undefined;
  if (customData instanceof Map) return customData.get(key);
  return (customData as Record<string, unknown>)[key];
}

function parseRevenue(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number(String(raw).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function roomNightsFromItinerary(it: {
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  rooms?: unknown[] | null;
  numberOfGuests?: string | null;
}): number {
  if (!it.checkInDate || !it.checkOutDate) return 0;
  const ms =
    new Date(it.checkOutDate).getTime() - new Date(it.checkInDate).getTime();
  const nights = Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
  const roomCount =
    Array.isArray(it.rooms) && it.rooms.length > 0 ? it.rooms.length : 1;
  return nights * roomCount;
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = String(full || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function userNameMap(ids: (Types.ObjectId | string | null | undefined)[]) {
  const unique = [
    ...new Set(
      ids
        .filter(Boolean)
        .map((id) => String(id))
        .filter((id) => Types.ObjectId.isValid(id))
    ),
  ];
  if (unique.length === 0) return new Map<string, string>();
  const users = await UserModel.find({
    _id: { $in: unique.map((id) => new Types.ObjectId(id)) },
  })
    .select("name email")
    .lean();
  const map = new Map<string, string>();
  for (const u of users) {
    map.set(String(u._id), u.name || u.email || "User");
  }
  return map;
}

export async function buildExecutiveBookingRows(opts: {
  from?: Date;
  to?: Date;
  executiveUserId?: Types.ObjectId;
  propertyId?: Types.ObjectId;
  status?: string;
  leadIds?: Types.ObjectId[];
  dateField?: "createdAt" | "checkIn";
}): Promise<ExecutiveBookingRow[]> {
  const match: Record<string, unknown> = {};
  if (opts.executiveUserId) match.assignedToUserId = opts.executiveUserId;
  if (opts.propertyId) match.propertyId = opts.propertyId;
  if (opts.status) match.status = opts.status;
  if (opts.leadIds?.length) match._id = { $in: opts.leadIds };
  if (opts.from && opts.to && opts.dateField !== "checkIn") {
    match.createdAt = { $gte: opts.from, $lte: opts.to };
  }

  const leads = await LeadModel.find(match)
    .select(
      "assignedToUserId propertyId status contactDetails accountId companyName customerType estimatedValue budget customData createdAt"
    )
    .lean();

  if (leads.length === 0) return [];

  const leadIds = leads.map((l) => l._id as Types.ObjectId);
  const accountIds = [
    ...new Set(
      leads
        .map((l) => (l.accountId ? String(l.accountId) : ""))
        .filter((id) => Types.ObjectId.isValid(id))
    ),
  ].map((id) => new Types.ObjectId(id));

  const [itineraries, reservations, accounts, names] = await Promise.all([
    LeadItineraryModel.find({ leadId: { $in: leadIds } })
      .sort({ checkInDate: 1 })
      .lean(),
    ReservationModel.find({
      leadId: { $in: leadIds },
      status: { $in: [...CONFIRMED_RESERVATION_STATUSES] },
    })
      .select("leadId totalAmount checkInDate checkOutDate roomsBooked")
      .lean(),
    accountIds.length
      ? AccountModel.find({ _id: { $in: accountIds } })
          .select("name type city country zone")
          .lean()
      : Promise.resolve([]),
    userNameMap(leads.map((l) => l.assignedToUserId)),
  ]);

  const itineraryByLead = new Map<string, (typeof itineraries)[0]>();
  for (const it of itineraries) {
    const key = String(it.leadId);
    if (!itineraryByLead.has(key)) itineraryByLead.set(key, it);
  }

  const reservationByLead = new Map<string, (typeof reservations)[0]>();
  for (const r of reservations) {
    const key = String(r.leadId);
    if (!reservationByLead.has(key)) reservationByLead.set(key, r);
  }

  const accountById = new Map(
    accounts.map((a) => [String(a._id), a] as const)
  );

  const rows: ExecutiveBookingRow[] = [];
  for (const lead of leads) {
    const it = itineraryByLead.get(String(lead._id));
    if (opts.dateField === "checkIn" && opts.from && opts.to) {
      const ci = it?.checkInDate ? new Date(it.checkInDate) : null;
      if (!ci || ci < opts.from || ci > opts.to) continue;
    }

    const reservation = reservationByLead.get(String(lead._id));
    const account = lead.accountId
      ? accountById.get(String(lead.accountId))
      : undefined;

    let roomNights = 0;
    let revenue = 0;
    if (reservation) {
      roomNights = roomNightsFromReservation(reservation);
      revenue =
        typeof reservation.totalAmount === "number" ? reservation.totalAmount : 0;
    }
    if (roomNights <= 0 && it) {
      roomNights = roomNightsFromItinerary(it);
    }
    if (revenue <= 0) {
      revenue =
        parseRevenue(lead.estimatedValue) ||
        (typeof lead.budget === "number" ? lead.budget : 0);
    }
    const adr =
      roomNights > 0 ? Math.round((revenue / roomNights) * 100) / 100 : 0;

    const bookerFromCustom = customDataGet(
      lead.customData as Map<string, unknown> | undefined,
      "booker_name"
    );
    const contactName = lead.contactDetails?.name || "";
    const bookerName =
      (typeof bookerFromCustom === "string" && bookerFromCustom.trim()) ||
      contactName ||
      "—";

    const execId = lead.assignedToUserId
      ? String(lead.assignedToUserId)
      : undefined;

    rows.push({
      leadId: String(lead._id),
      accountId: lead.accountId ? String(lead.accountId) : undefined,
      executiveUserId: execId,
      executiveName: execId ? names.get(execId) || "Unassigned" : "Unassigned",
      hotelName: it?.hotelName || "—",
      propertyId: it?.propertyId
        ? String(it.propertyId)
        : lead.propertyId
          ? String(lead.propertyId)
          : undefined,
      checkIn: it?.checkInDate
        ? new Date(it.checkInDate).toISOString().slice(0, 10)
        : "",
      checkOut: it?.checkOutDate
        ? new Date(it.checkOutDate).toISOString().slice(0, 10)
        : "",
      bookerName,
      city: account?.city || "",
      country: account?.country || "",
      mobile: lead.contactDetails?.phone || "",
      email: lead.contactDetails?.email || "",
      company: lead.companyName || account?.name || "",
      companyType: account?.type || lead.customerType || "",
      roomNights,
      adr,
      revenue,
      status: String(lead.status || ""),
    });
  }

  rows.sort((a, b) => {
    const n = a.executiveName.localeCompare(b.executiveName);
    if (n !== 0) return n;
    return a.checkIn.localeCompare(b.checkIn);
  });
  return rows;
}

export async function buildHandoverPreview(userId: Types.ObjectId): Promise<{
  leads: ExecutiveBookingRow[];
  contacts: HandoverContactRow[];
  accounts: HandoverAccountRow[];
}> {
  const [leads, pamAccounts, samAccounts, contacts] = await Promise.all([
    buildExecutiveBookingRows({ executiveUserId: userId }),
    AccountModel.find({ "primaryAccountManager.userId": userId })
      .select("name type city zone primaryAccountManager")
      .lean(),
    AccountModel.find({ "secondaryAccountManagers.userId": userId })
      .select("name type city zone secondaryAccountManagers")
      .lean(),
    ContactModel.find({ createdByUserId: userId })
      .select(
        "accountId title name designation officeAddress mobileNumber1 email personnelDetails createdAt keyPersonnelRole clientStatus"
      )
      .lean(),
  ]);

  const accountRows: HandoverAccountRow[] = [];
  const seenAccounts = new Set<string>();
  for (const a of pamAccounts) {
    const id = String(a._id);
    seenAccounts.add(id);
    accountRows.push({
      accountId: id,
      name: a.name || "—",
      type: a.type || "",
      city: a.city || "",
      zone: a.zone || "",
      role: "PAM",
    });
  }
  for (const a of samAccounts) {
    const id = String(a._id);
    if (seenAccounts.has(id)) continue;
    seenAccounts.add(id);
    accountRows.push({
      accountId: id,
      name: a.name || "—",
      type: a.type || "",
      city: a.city || "",
      zone: a.zone || "",
      role: "SAM",
    });
  }

  const contactAccountIds = [
    ...new Set(
      contacts
        .map((c) => (c.accountId ? String(c.accountId) : ""))
        .filter((id) => Types.ObjectId.isValid(id))
    ),
  ].map((id) => new Types.ObjectId(id));

  const contactAccounts = contactAccountIds.length
    ? await AccountModel.find({ _id: { $in: contactAccountIds } })
        .select("name city zone")
        .lean()
    : [];
  const contactAccountById = new Map(
    contactAccounts.map((a) => [String(a._id), a] as const)
  );
  const execNames = await userNameMap([userId]);
  const execName = execNames.get(String(userId)) || "User";

  const contactRows: HandoverContactRow[] = contacts.map((c) => {
    const { firstName, lastName } = splitName(c.name || "");
    const acct = c.accountId
      ? contactAccountById.get(String(c.accountId))
      : undefined;
    const addr = c.officeAddress?.addressLine1 || "";
    return {
      contactId: String(c._id),
      accountId: c.accountId ? String(c.accountId) : undefined,
      contactType: c.keyPersonnelRole || c.clientStatus || "",
      salutation: c.title || "",
      firstName,
      lastName,
      companyName: acct?.name || "",
      jobTitle: c.designation || "",
      address: addr,
      city: c.officeAddress?.city || acct?.city || "",
      mobile: c.mobileNumber1 || "",
      email: c.email || "",
      website: "",
      notes: c.personnelDetails || "",
      dataUploadedOn: c.createdAt
        ? new Date(c.createdAt).toISOString().slice(0, 10)
        : "",
      executiveName: execName,
      executiveUserId: String(userId),
      zone: acct?.zone || "",
    };
  });

  return { leads, contacts: contactRows, accounts: accountRows };
}

export async function executeHandover(opts: {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  leadIds: Types.ObjectId[];
  accountIds: Types.ObjectId[];
  contactIds: Types.ObjectId[];
}): Promise<{
  leadsUpdated: number;
  accountsUpdated: number;
  contactsUpdated: number;
}> {
  const { fromUserId, toUserId, leadIds, accountIds, contactIds } = opts;

  let leadsUpdated = 0;
  let accountsUpdated = 0;
  let contactsUpdated = 0;

  if (leadIds.length) {
    const result = await LeadModel.updateMany(
      { _id: { $in: leadIds }, assignedToUserId: fromUserId },
      { $set: { assignedToUserId: toUserId } }
    );
    leadsUpdated = result.modifiedCount || 0;
  }

  if (accountIds.length) {
    const pam = await AccountModel.updateMany(
      {
        _id: { $in: accountIds },
        "primaryAccountManager.userId": fromUserId,
      },
      { $set: { "primaryAccountManager.userId": toUserId } }
    );
    const sam = await AccountModel.updateMany(
      {
        _id: { $in: accountIds },
        "secondaryAccountManagers.userId": fromUserId,
      },
      {
        $set: { "secondaryAccountManagers.$[elem].userId": toUserId },
      },
      {
        arrayFilters: [{ "elem.userId": fromUserId }],
      }
    );
    accountsUpdated = (pam.modifiedCount || 0) + (sam.modifiedCount || 0);
  }

  if (contactIds.length) {
    const result = await ContactModel.updateMany(
      { _id: { $in: contactIds }, createdByUserId: fromUserId },
      { $set: { createdByUserId: toUserId } }
    );
    contactsUpdated = result.modifiedCount || 0;
  }

  return { leadsUpdated, accountsUpdated, contactsUpdated };
}

/** Aggregate CONFIRMED lead actuals by executive × hotel for a date range (check-in). */
export async function aggregateConfirmedActuals(opts: {
  from: Date;
  to: Date;
  executiveUserId?: Types.ObjectId;
}): Promise<
  Map<
    string,
    { executiveUserId: string; hotelName: string; roomRevenue: number; roomNights: number }
  >
> {
  const rows = await buildExecutiveBookingRows({
    from: opts.from,
    to: opts.to,
    executiveUserId: opts.executiveUserId,
    status: LeadStatus.CONFIRMED,
    dateField: "checkIn",
  });

  const map = new Map<
    string,
    { executiveUserId: string; hotelName: string; roomRevenue: number; roomNights: number }
  >();

  for (const r of rows) {
    const hotel = r.hotelName && r.hotelName !== "—" ? r.hotelName : "Unknown";
    const exec = r.executiveUserId || "unassigned";
    const key = `${exec}::${hotel.toLowerCase()}`;
    const cur = map.get(key) || {
      executiveUserId: exec,
      hotelName: hotel,
      roomRevenue: 0,
      roomNights: 0,
    };
    cur.roomRevenue += r.revenue || 0;
    cur.roomNights += r.roomNights || 0;
    map.set(key, cur);
  }
  return map;
}
