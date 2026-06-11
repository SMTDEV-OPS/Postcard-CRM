import { config } from "../../config/env";
import { logger } from "../../config/logger";
import { normalizePhone } from "../../utils/phoneUtils";
import { buildPmsCrmHeaders } from "./postcardResortsCrmAuth";

export interface PmsCrmCustomerRaw {
  [key: string]: unknown;
}

export interface PmsCrmCustomer {
  customerId: string;
  name?: string;
  phone?: string;
  email?: string;
  loyaltyTier?: string;
  lastStay?: string;
  totalStays?: number;
  preferredProperty?: string;
  raw: PmsCrmCustomerRaw;
}

export function isPmsCrmConfigured(): boolean {
  return Boolean(
    config.pmsCrm.baseUrl && config.pmsCrm.apiKey && config.pmsCrm.secretKey
  );
}

function pickString(obj: PmsCrmCustomerRaw, keys: string[]): string | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "string" && val.trim()) return val.trim();
    if (typeof val === "number") return String(val);
  }
  return undefined;
}

function pickNumber(obj: PmsCrmCustomerRaw, keys: string[]): number | undefined {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === "number" && !Number.isNaN(val)) return val;
    if (typeof val === "string" && val.trim() && !Number.isNaN(Number(val))) return Number(val);
  }
  return undefined;
}

export function mapPmsCustomerRecord(raw: PmsCrmCustomerRaw): PmsCrmCustomer | null {
  const customerId =
    pickString(raw, [
      "membership_id",
      "customer_id",
      "customerId",
      "id",
      "code",
      "customer_code",
    ]) ?? "";
  if (!customerId) return null;

  const firstName = pickString(raw, ["first_name", "firstName"]);
  const lastName = pickString(raw, ["last_name", "lastName"]);
  const fullName =
    pickString(raw, ["name", "customer_name", "full_name", "fullName"]) ??
    [firstName, lastName].filter(Boolean).join(" ").trim();

  return {
    customerId,
    name: fullName || undefined,
    phone: pickString(raw, ["mobile", "phone", "mobile_number", "contact_number", "phone_number"]),
    email: pickString(raw, ["email", "email_id", "email_address"]),
    loyaltyTier: pickString(raw, [
      "vip_level",
      "loyalty_tier",
      "membership_tier",
      "tier",
      "loyalty_status",
      "membership",
    ]),
    lastStay: pickString(raw, ["last_visit_date", "last_stay", "lastStay", "last_visit"]),
    totalStays: pickNumber(raw, [
      "completed_bookings_count",
      "total_stays",
      "totalStays",
      "stay_count",
      "visits",
    ]),
    preferredProperty: pickString(raw, ["preferred_hotel", "preferred_property", "home_property", "property"]),
    raw,
  };
}

function extractCustomerList(payload: unknown): PmsCrmCustomerRaw[] {
  if (!payload || typeof payload !== "object") return [];
  const obj = payload as Record<string, unknown>;

  const source = obj.source;
  if (source && typeof source === "object" && !Array.isArray(source)) {
    const sourceObj = source as Record<string, unknown>;
    if (Array.isArray(sourceObj.data)) return sourceObj.data as PmsCrmCustomerRaw[];
    if (sourceObj.data && typeof sourceObj.data === "object" && !Array.isArray(sourceObj.data)) {
      return [sourceObj.data as PmsCrmCustomerRaw];
    }
    // Detail endpoint returns the customer object directly under source
    if (
      pickString(sourceObj, ["membership_id", "customer_id", "customerId", "id"]) ||
      pickString(sourceObj, ["mobile", "phone"])
    ) {
      return [sourceObj as PmsCrmCustomerRaw];
    }
  }

  if (Array.isArray(obj.data)) return obj.data as PmsCrmCustomerRaw[];
  if (Array.isArray(obj.customers)) return obj.customers as PmsCrmCustomerRaw[];
  if (Array.isArray(obj.results)) return obj.results as PmsCrmCustomerRaw[];
  if (Array.isArray(payload)) return payload as PmsCrmCustomerRaw[];

  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    return [obj.data as PmsCrmCustomerRaw];
  }

  return [obj as PmsCrmCustomerRaw];
}

/**
 * PMS signs GET requests using query-string params as JSON (string values).
 * e.g. ?page=1 -> {"page":"1"}, ?phone=9800907654 -> {"phone":"9800907654"}
 */
export function buildSignBodyFromQuery(search: string): Record<string, string> {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const body: Record<string, string> = {};
  params.forEach((value, key) => {
    body[key] = value;
  });
  return body;
}

function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function phonesMatch(candidate: string, mobile?: string): boolean {
  if (!mobile) return false;
  const a = phoneDigits(candidate);
  const b = phoneDigits(mobile);
  if (!a || !b) return false;
  const a10 = a.length > 10 ? a.slice(-10) : a;
  const b10 = b.length > 10 ? b.slice(-10) : b;
  return a10 === b10 && a10.length >= 10;
}

async function pmsCrmRequest(
  method: "GET" | "POST",
  path: string,
  requestBody: Record<string, unknown> = {}
): Promise<unknown> {
  if (!isPmsCrmConfigured()) {
    logger.warn("PMS CRM lookup skipped: credentials not configured");
    return null;
  }

  const base = config.pmsCrm.baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  let signBody = requestBody;
  if (method === "GET") {
    const queryIndex = normalizedPath.indexOf("?");
    signBody =
      queryIndex >= 0
        ? buildSignBodyFromQuery(normalizedPath.slice(queryIndex))
        : (requestBody as Record<string, string>);
  }

  const headers = buildPmsCrmHeaders(
    signBody as Record<string, unknown>,
    config.pmsCrm.apiKey,
    config.pmsCrm.secretKey
  );

  const response = await fetch(url, {
    method,
    headers,
    body: method === "GET" ? undefined : JSON.stringify(requestBody),
  });

  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }

  if (!response.ok) {
    logger.warn("PMS CRM API error", {
      status: response.status,
      path,
      bodyPreview: text.slice(0, 200),
    });
    return null;
  }

  return json;
}

export async function getCustomerById(customerId: string): Promise<PmsCrmCustomer | null> {
  const encodedId = encodeURIComponent(customerId);
  const payload = await pmsCrmRequest(
    "GET",
    `/api/crm/customer/${encodedId}?membership_id=${encodedId}`,
    {}
  );
  if (!payload) return null;
  const records = extractCustomerList(payload);
  const mapped = records.map(mapPmsCustomerRecord).find(Boolean);
  return mapped ?? null;
}

export async function listCustomers(page = 1): Promise<PmsCrmCustomer[]> {
  const payload = await pmsCrmRequest("GET", `/api/crm/customers?page=${page}`, {});
  if (!payload) return [];
  return extractCustomerList(payload)
    .map(mapPmsCustomerRecord)
    .filter((c): c is PmsCrmCustomer => c !== null);
}

/**
 * Search PMS customers by phone using list API with ?phone= query param.
 */
export async function searchCustomersByPhone(phone: string): Promise<PmsCrmCustomer | null> {
  if (!isPmsCrmConfigured()) return null;

  const normalized = normalizePhone(phone) ?? phone.replace(/\D/g, "");
  const digitsOnly = phone.replace(/\D/g, "");

  const attempts = [
    normalized,
    digitsOnly,
    digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly,
  ].filter((v, i, arr) => v && arr.indexOf(v) === i) as string[];

  for (const candidate of attempts) {
    const payload = await pmsCrmRequest(
      "GET",
      `/api/crm/customers?phone=${encodeURIComponent(candidate)}`,
      {}
    );
    if (!payload) continue;

    const records = extractCustomerList(payload)
      .map(mapPmsCustomerRecord)
      .filter((c): c is PmsCrmCustomer => c !== null);

    const match =
      records.find((c) => phonesMatch(candidate, c.phone)) ??
      records.find((c) => phonesMatch(phone, c.phone)) ??
      (records.length === 1 ? records[0] : undefined);

    if (match) {
      logger.info("PMS CRM customer found by phone", {
        customerId: match.customerId,
        phone: candidate.slice(0, 4) + "****",
      });
      return match;
    }
  }

  return null;
}
