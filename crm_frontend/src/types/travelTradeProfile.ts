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

export interface TravelTradeProfile {
  travelOperatorName?: string;
  operatorTypes: TravelOperatorType[];
  inbound?: {
    segments: InboundSegment[];
    segmentMarkets: Record<string, string>;
    hotelSegments: HotelSegment[];
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

export function emptyTravelTradeProfile(): TravelTradeProfile {
  return {
    travelOperatorName: "",
    operatorTypes: [],
    inbound: { segments: [], segmentMarkets: {}, hotelSegments: [] },
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
  return {
    ...base,
    ...raw,
    operatorTypes: raw.operatorTypes ?? [],
    inbound: {
      segments: raw.inbound?.segments ?? [],
      segmentMarkets: raw.inbound?.segmentMarkets ?? {},
      hotelSegments: raw.inbound?.hotelSegments ?? [],
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
