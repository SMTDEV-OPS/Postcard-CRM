import type { AccountFormData } from "./accountFormTypes";
import {
  OPERATOR_STEP_ORDER,
  labelForInboundSegment,
} from "@/constants/travelTradeAccountData";
import type { InboundSegment } from "@/types/travelTradeProfile";
import type { TravelOperatorType } from "@/types/travelTradeProfile";

export type AccountWizardStepId =
  | "organization"
  | "classification"
  | "travel_inbound"
  | "travel_luxury"
  | "travel_series"
  | "travel_domestic"
  | "travel_groups"
  | "hierarchy"
  | "location"
  | "review";

export interface AccountWizardStep {
  id: AccountWizardStepId;
  label: string;
  subtitle: string;
}

const OPERATOR_STEP_MAP: Record<
  TravelOperatorType,
  { id: AccountWizardStepId; label: string; subtitle: string }
> = {
  INBOUND: {
    id: "travel_inbound",
    label: "Inbound",
    subtitle: "Inbound operator segments and markets",
  },
  LUXURY: {
    id: "travel_luxury",
    label: "Luxury",
    subtitle: "Luxury operator profile",
  },
  SERIES: {
    id: "travel_series",
    label: "Series",
    subtitle: "Series program details",
  },
  DOMESTIC_AGENT: {
    id: "travel_domestic",
    label: "Domestic",
    subtitle: "Domestic agent profile",
  },
  GROUPS_INCENTIVES: {
    id: "travel_groups",
    label: "Groups",
    subtitle: "Groups and incentives profile",
  },
};

export function isTravelTrade(formData: AccountFormData): boolean {
  return formData.organizationType === "TRAVEL_AGENT";
}

export function buildAccountWizardSteps(formData: AccountFormData): AccountWizardStep[] {
  const base: AccountWizardStep[] = [
    {
      id: "organization",
      label: "Organization",
      subtitle: "Who is this organization?",
    },
    {
      id: "classification",
      label: "Classification",
      subtitle: "How is this account classified?",
    },
  ];

  if (isTravelTrade(formData)) {
    const selected = formData.travelTradeProfile?.operatorTypes ?? [];
    for (const op of OPERATOR_STEP_ORDER) {
      if (selected.includes(op)) {
        base.push(OPERATOR_STEP_MAP[op]);
      }
    }
  }

  base.push(
    {
      id: "hierarchy",
      label: "Hierarchy",
      subtitle: "Where does it sit in your hierarchy?",
    },
    {
      id: "location",
      label: "Location",
      subtitle: "Where are they located?",
    },
    {
      id: "review",
      label: "Review",
      subtitle: "Review and create the account",
    }
  );

  return base;
}

export interface StepValidationResult {
  valid: boolean;
  message?: string;
}

export function validateWizardStep(
  stepId: AccountWizardStepId,
  formData: AccountFormData
): StepValidationResult {
  if (stepId === "organization") {
    if (!formData.name.trim()) {
      return { valid: false, message: "Account name is required" };
    }
    if (isTravelTrade(formData)) {
      const profile = formData.travelTradeProfile;
      if (!profile?.travelOperatorName?.trim()) {
        return { valid: false, message: "Travel operator name is required" };
      }
      if (!profile.operatorTypes?.length) {
        return { valid: false, message: "Select at least one travel operator type" };
      }
    }
    return { valid: true };
  }

  if (!isTravelTrade(formData)) {
    return { valid: true };
  }

  const profile = formData.travelTradeProfile;

  switch (stepId) {
    case "travel_inbound": {
      const inbound = profile?.inbound;
      if (!inbound?.segments?.length) {
        return { valid: false, message: "Select at least one inbound segment" };
      }
      for (const seg of inbound.segments) {
        const markets = inbound.segmentMarkets?.[seg];
        const marketList = Array.isArray(markets)
          ? markets
          : typeof markets === "string" && (markets as string).trim()
            ? [(markets as string).trim()]
            : [];
        if (!marketList.length) {
          return {
            valid: false,
            message: `At least one market / country is required for ${labelForInboundSegment(seg as InboundSegment)}`,
          };
        }
        const rn = inbound.segmentRoomNights?.[seg];
        if (rn == null || !Number.isFinite(Number(rn)) || Number(rn) < 0) {
          return {
            valid: false,
            message: `Potential room nights are required for ${labelForInboundSegment(seg as InboundSegment)}`,
          };
        }
      }
      if (!inbound.hotelSegments?.length) {
        return { valid: false, message: "Select at least one hotel segment" };
      }
      if (!inbound.hotelMappings?.length) {
        return { valid: false, message: "Map at least one hotel / city" };
      }
      for (const mapping of inbound.hotelMappings) {
        if (!mapping.city?.trim()) {
          return {
            valid: false,
            message: `City is required for ${mapping.propertyName || "selected hotel"}`,
          };
        }
      }
      return { valid: true };
    }
    case "travel_luxury": {
      const luxury = profile?.luxury;
      if (!luxury?.countryMarket?.trim()) {
        return { valid: false, message: "Country / market is required" };
      }
      if (!luxury?.operatorKind) {
        return { valid: false, message: "Type of operator is required" };
      }
      return { valid: true };
    }
    case "travel_series": {
      const series = profile?.series;
      if (!series?.market?.trim()) return { valid: false, message: "Market is required" };
      if (!series?.programName?.trim()) {
        return { valid: false, message: "Series or program name is required" };
      }
      if (!series?.startMonth) return { valid: false, message: "Start month is required" };
      if (!series?.endMonth) return { valid: false, message: "End month is required" };
      if (!series?.frequency) return { valid: false, message: "Frequency is required" };
      if (!series?.pattern) return { valid: false, message: "Pattern is required" };
      return { valid: true };
    }
    case "travel_domestic": {
      const domestic = profile?.domestic;
      if (!domestic?.city?.trim()) return { valid: false, message: "City is required" };
      if (!domestic?.segments?.length) {
        return { valid: false, message: "Select at least one segment" };
      }
      if (!domestic?.agentType) {
        return { valid: false, message: "Agent type is required" };
      }
      return { valid: true };
    }
    case "travel_groups": {
      const groups = profile?.groupsIncentives;
      if (!groups?.market?.trim()) return { valid: false, message: "Market is required" };
      if (!groups?.type) return { valid: false, message: "Type is required" };
      if (!groups?.preferredTravelMonths?.length) {
        return { valid: false, message: "Select at least one preferred travel month" };
      }
      return { valid: true };
    }
    default:
      return { valid: true };
  }
}
