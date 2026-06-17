import type {
  DomesticSegment,
  GroupsIncentiveType,
  HotelSegment,
  InboundSegment,
  TravelOperatorType,
} from "@/types/travelTradeProfile";
import { MONTHS } from "@/constants/accountData";

export const TRAVEL_OPERATOR_TYPES: Array<{ value: TravelOperatorType; label: string }> = [
  { value: "INBOUND", label: "Inbound" },
  { value: "LUXURY", label: "Luxury" },
  { value: "SERIES", label: "Series" },
  { value: "DOMESTIC_AGENT", label: "Domestic Agent" },
  { value: "GROUPS_INCENTIVES", label: "Groups & Incentives" },
];

export const INBOUND_SEGMENTS: Array<{ value: InboundSegment; label: string }> = [
  { value: "FIT", label: "FIT" },
  { value: "GROUPS", label: "Groups" },
  { value: "LUXURY", label: "Luxury" },
  { value: "MICE", label: "MICE" },
  { value: "CHARTERS", label: "Charters" },
];

export const HOTEL_SEGMENTS: Array<{ value: HotelSegment; label: string }> = [
  { value: "LUXURY", label: "Luxury" },
  { value: "MID_SEGMENT", label: "Mid Segment" },
  { value: "BUDGET", label: "Budget" },
  { value: "ECONOMY", label: "Economy" },
];

export const LUXURY_OPERATOR_KINDS = [
  { value: "LUXURY_TOUR_OPERATOR" as const, label: "Luxury Tour Operator" },
  { value: "DMC" as const, label: "DMC" },
];

export const SERIES_FREQUENCIES = [
  { value: "WEEKLY" as const, label: "Weekly" },
  { value: "BIWEEKLY" as const, label: "Biweekly" },
];

export const SERIES_PATTERNS = [
  { value: "WEEKENDS" as const, label: "Weekends" },
  { value: "WEEKDAYS" as const, label: "Weekdays" },
];

export const DOMESTIC_SEGMENTS: Array<{ value: DomesticSegment; label: string }> = [
  { value: "LEISURE", label: "Leisure" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "LUXURY", label: "Luxury" },
];

export const AGENT_TYPES = [
  { value: "B2B" as const, label: "B2B" },
  { value: "B2C" as const, label: "B2C" },
];

export const GROUPS_INCENTIVE_TYPES: Array<{ value: GroupsIncentiveType; label: string }> = [
  { value: "GROUP", label: "Group" },
  { value: "INCENTIVE", label: "Incentive" },
  { value: "CORPORATE_RETREAT", label: "Corporate Retreat" },
];

export const TRAVEL_MONTH_OPTIONS = MONTHS;

export const OPERATOR_STEP_ORDER: TravelOperatorType[] = [
  "INBOUND",
  "LUXURY",
  "SERIES",
  "DOMESTIC_AGENT",
  "GROUPS_INCENTIVES",
];

export function labelForOperatorType(value: TravelOperatorType): string {
  return TRAVEL_OPERATOR_TYPES.find((o) => o.value === value)?.label ?? value;
}

export function labelForInboundSegment(value: InboundSegment): string {
  return INBOUND_SEGMENTS.find((o) => o.value === value)?.label ?? value;
}

export function labelForHotelSegment(value: HotelSegment): string {
  return HOTEL_SEGMENTS.find((o) => o.value === value)?.label ?? value;
}

export function labelForDomesticSegment(value: DomesticSegment): string {
  return DOMESTIC_SEGMENTS.find((o) => o.value === value)?.label ?? value;
}

export function labelForMonth(month?: number): string {
  if (!month) return "—";
  return MONTHS.find((m) => m.value === month)?.label ?? String(month);
}
