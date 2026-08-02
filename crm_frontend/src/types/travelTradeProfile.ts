export type TravelOperatorType =
  | "INBOUND"
  | "LUXURY"
  | "SERIES"
  | "DOMESTIC_AGENT"
  | "GROUPS_INCENTIVES";

export type InboundSegment = "FIT" | "GROUPS" | "LUXURY" | "MICE" | "CHARTERS";
export type HotelSegment = "LUXURY" | "MID_SEGMENT" | "BUDGET" | "ECONOMY";
export type DomesticSegment = "LEISURE" | "CORPORATE" | "LUXURY";
export type GroupsIncentiveType = "GROUP" | "INCENTIVE" | "CORPORATE_RETREAT";

export interface InboundHotelMapping {
  propertyId: string;
  propertyName?: string;
  city: string;
}

export interface TravelTradeProfile {
  travelOperatorName?: string;
  operatorTypes: TravelOperatorType[];
  inbound?: {
    segments: InboundSegment[];
    /** Markets / countries per inbound segment (multi-select) */
    segmentMarkets: Record<string, string[]>;
    /** Estimated annual room nights per inbound segment */
    segmentRoomNights: Record<string, number>;
    hotelSegments: HotelSegment[];
    /** Postcard hotels + cities this inbound agent feeds */
    hotelMappings: InboundHotelMapping[];
  };
  luxury?: {
    countryMarket?: string;
    operatorKind?: "LUXURY_TOUR_OPERATOR" | "DMC";
    estimatedAnnualRoomNights?: number;
  };
  series?: {
    market?: string;
    programName?: string;
    startMonth?: number;
    endMonth?: number;
    frequency?: "WEEKLY" | "BIWEEKLY";
    pattern?: "WEEKENDS" | "WEEKDAYS";
    roomsPerDeparture?: number;
    estimatedTotalRoomNights?: number;
    blackoutDates?: string;
  };
  domestic?: {
    city?: string;
    segments: DomesticSegment[];
    agentType?: "B2B" | "B2C";
  };
  groupsIncentives?: {
    market?: string;
    type?: GroupsIncentiveType;
    preferredTravelMonths: number[];
    groupSize?: number;
  };
}

function normalizeMarkets(
  raw?: Record<string, string | string[]> | null
): Record<string, string[]> {
  if (!raw) return {};
  const out: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      out[key] = value.map((v) => String(v).trim()).filter(Boolean);
    } else if (typeof value === "string" && value.trim()) {
      out[key] = value
        .split(/[,;/|]/)
        .map((v) => v.trim())
        .filter(Boolean);
    } else {
      out[key] = [];
    }
  }
  return out;
}

function normalizeRoomNights(
  raw?: Record<string, number | string> | null
): Record<string, number> {
  if (!raw) return {};
  const out: Record<string, number> = {};
  for (const [key, value] of Object.entries(raw)) {
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(n) && n >= 0) out[key] = n;
  }
  return out;
}

export function emptyTravelTradeProfile(): TravelTradeProfile {
  return {
    travelOperatorName: "",
    operatorTypes: [],
    inbound: {
      segments: [],
      segmentMarkets: {},
      segmentRoomNights: {},
      hotelSegments: [],
      hotelMappings: [],
    },
    luxury: {},
    series: {},
    domestic: { segments: [] },
    groupsIncentives: { preferredTravelMonths: [] },
  };
}

export function normalizeTravelTradeProfile(
  raw?: Partial<TravelTradeProfile> | null
): TravelTradeProfile {
  const base = emptyTravelTradeProfile();
  if (!raw) return base;
  const inboundRaw = raw.inbound as
    | (Partial<NonNullable<TravelTradeProfile["inbound"]>> & {
        segmentMarkets?: Record<string, string | string[]>;
      })
    | undefined;
  return {
    ...base,
    ...raw,
    operatorTypes: raw.operatorTypes ?? [],
    inbound: {
      segments: inboundRaw?.segments ?? [],
      segmentMarkets: normalizeMarkets(inboundRaw?.segmentMarkets),
      segmentRoomNights: normalizeRoomNights(inboundRaw?.segmentRoomNights),
      hotelSegments: inboundRaw?.hotelSegments ?? [],
      hotelMappings: Array.isArray(inboundRaw?.hotelMappings)
        ? inboundRaw!.hotelMappings
            .filter((m) => m?.propertyId)
            .map((m) => ({
              propertyId: m.propertyId,
              propertyName: m.propertyName,
              city: m.city?.trim() || "",
            }))
        : [],
    },
    luxury: { ...base.luxury, ...raw.luxury },
    series: { ...base.series, ...raw.series },
    domestic: {
      segments: raw.domestic?.segments ?? [],
      city: raw.domestic?.city,
      agentType: raw.domestic?.agentType,
    },
    groupsIncentives: {
      preferredTravelMonths: raw.groupsIncentives?.preferredTravelMonths ?? [],
      market: raw.groupsIncentives?.market,
      type: raw.groupsIncentives?.type,
      groupSize: raw.groupsIncentives?.groupSize,
    },
  };
}
