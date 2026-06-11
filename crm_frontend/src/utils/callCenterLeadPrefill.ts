import type { GuestSearchResult } from "@/services/calls";
import type { LeadFormData } from "@/components/leads/useLeadForm";
import type { Property } from "@/services/properties";

function splitFullName(fullName: string): {
  firstName: string;
  middleName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", middleName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], middleName: "", lastName: parts[0] };
  if (parts.length === 2) return { firstName: parts[0], middleName: "", lastName: parts[1] };
  return {
    firstName: parts[0],
    middleName: parts.slice(1, -1).join(" "),
    lastName: parts[parts.length - 1],
  };
}

function pickString(raw: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!raw) return undefined;
  for (const key of keys) {
    const val = raw[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  return undefined;
}

export function mapGuestSearchToLeadPrefill(
  result: GuestSearchResult | null,
  phone: string,
  hotelOptions: Property[] = []
): { form: Partial<LeadFormData>; customData: Record<string, unknown> } {
  const pms = result?.pmsCustomer;
  const guest = result?.guest;
  const raw = pms?.raw;

  const firstFromPms = pickString(raw, ["first_name", "firstName"]);
  const lastFromPms = pickString(raw, ["last_name", "lastName"]);
  let firstName = firstFromPms ?? "";
  let middleName = "";
  let lastName = lastFromPms ?? "";

  if (!firstName && !lastName) {
    const nameSource = pms?.name || guest?.name || "";
    const split = splitFullName(nameSource);
    firstName = split.firstName;
    middleName = split.middleName;
    lastName = split.lastName;
  }

  const guestContactNumber = pms?.phone || guest?.phone || phone;
  const guestEmail = pms?.email || guest?.email || "";

  const preferredProperty = pms?.preferredProperty;
  const matchedHotel = preferredProperty
    ? hotelOptions.find(
        (p) =>
          p.name.toLowerCase() === preferredProperty.toLowerCase() ||
          p.name.toLowerCase().includes(preferredProperty.toLowerCase())
      )
    : undefined;

  const customData: Record<string, unknown> = {};
  if (pms?.customerId) customData.pms_customer_id = pms.customerId;
  if (pms?.loyaltyTier) customData.pms_loyalty_tier = pms.loyaltyTier;
  if (pms?.preferredProperty) customData.pms_preferred_property = pms.preferredProperty;
  if (pms?.lastStay) customData.pms_last_stay = pms.lastStay;
  if (pms?.totalStays !== undefined) customData.pms_total_stays = pms.totalStays;

  return {
    form: {
      firstName,
      middleName,
      lastName,
      guestContactNumber,
      guestEmail,
      bookingSource: "Phone",
      heatLevel: "WARM",
      leadType: "FIT",
      corporateBooking: "no",
      hotels: [
        {
          hotelName: matchedHotel?.name ?? "",
          checkInDate: undefined as unknown as Date,
          checkOutDate: undefined as unknown as Date,
          rooms: [{ roomCategory: "", roomPreference: "", numberOfGuests: "" }],
        },
      ],
    },
    customData,
  };
}
