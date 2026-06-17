import type { ReactNode } from "react";
import {
  AGENT_TYPES,
  GROUPS_INCENTIVE_TYPES,
  LUXURY_OPERATOR_KINDS,
  OPERATOR_STEP_ORDER,
  SERIES_FREQUENCIES,
  SERIES_PATTERNS,
  labelForDomesticSegment,
  labelForHotelSegment,
  labelForInboundSegment,
  labelForMonth,
  labelForOperatorType,
} from "@/constants/travelTradeAccountData";
import type { TravelTradeProfile, TravelOperatorType } from "@/types/travelTradeProfile";

function Field({ label, value }: { label: string; value: ReactNode }) {
  if (value === undefined || value === null || value === "" || value === "—") return null;
  return (
    <div>
      <span className="text-text-muted">{label}</span>
      <p className="font-medium text-text">{value}</p>
    </div>
  );
}

function labelFromOptions<T extends string>(
  value: T | undefined,
  options: Array<{ value: T; label: string }>
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

function renderInbound(profile: TravelTradeProfile) {
  const inbound = profile.inbound;
  if (!profile.operatorTypes.includes("INBOUND") || !inbound) return null;
  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Inbound</p>
      <Field
        label="Segments"
        value={inbound.segments.map((s) => labelForInboundSegment(s)).join(", ")}
      />
      {inbound.segments.map((seg) => (
        <Field
          key={seg}
          label={`${labelForInboundSegment(seg)} market`}
          value={inbound.segmentMarkets[seg]}
        />
      ))}
      <Field
        label="Hotel segments"
        value={inbound.hotelSegments.map((h) => labelForHotelSegment(h)).join(", ")}
      />
    </div>
  );
}

function renderLuxury(profile: TravelTradeProfile) {
  const luxury = profile.luxury;
  if (!profile.operatorTypes.includes("LUXURY") || !luxury) return null;
  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Luxury</p>
      <Field label="Country / market" value={luxury.countryMarket} />
      <Field
        label="Operator kind"
        value={labelFromOptions(luxury.operatorKind, LUXURY_OPERATOR_KINDS)}
      />
      <Field label="Est. annual room nights" value={luxury.estimatedAnnualRoomNights} />
    </div>
  );
}

function renderSeries(profile: TravelTradeProfile) {
  const series = profile.series;
  if (!profile.operatorTypes.includes("SERIES") || !series) return null;
  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Series</p>
      <Field label="Market" value={series.market} />
      <Field label="Program" value={series.programName} />
      <Field
        label="Season"
        value={
          series.startMonth && series.endMonth
            ? `${labelForMonth(series.startMonth)} → ${labelForMonth(series.endMonth)}`
            : undefined
        }
      />
      <Field label="Frequency" value={labelFromOptions(series.frequency, SERIES_FREQUENCIES)} />
      <Field label="Pattern" value={labelFromOptions(series.pattern, SERIES_PATTERNS)} />
      <Field label="Rooms per departure" value={series.roomsPerDeparture} />
      <Field label="Est. total room nights" value={series.estimatedTotalRoomNights} />
      <Field label="Blackout dates" value={series.blackoutDates} />
    </div>
  );
}

function renderDomestic(profile: TravelTradeProfile) {
  const domestic = profile.domestic;
  if (!profile.operatorTypes.includes("DOMESTIC_AGENT") || !domestic) return null;
  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Domestic agent</p>
      <Field label="City" value={domestic.city} />
      <Field
        label="Segments"
        value={domestic.segments.map((s) => labelForDomesticSegment(s)).join(", ")}
      />
      <Field label="Agent type" value={labelFromOptions(domestic.agentType, AGENT_TYPES)} />
    </div>
  );
}

function renderGroups(profile: TravelTradeProfile) {
  const groups = profile.groupsIncentives;
  if (!profile.operatorTypes.includes("GROUPS_INCENTIVES") || !groups) return null;
  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Groups & incentives</p>
      <Field label="Market" value={groups.market} />
      <Field label="Type" value={labelFromOptions(groups.type, GROUPS_INCENTIVE_TYPES)} />
      <Field label="Group size" value={groups.groupSize} />
      <Field
        label="Preferred months"
        value={groups.preferredTravelMonths.map((m) => labelForMonth(m)).join(", ")}
      />
    </div>
  );
}

const RENDERERS: Record<TravelOperatorType, (p: TravelTradeProfile) => ReactNode> = {
  INBOUND: renderInbound,
  LUXURY: renderLuxury,
  SERIES: renderSeries,
  DOMESTIC_AGENT: renderDomestic,
  GROUPS_INCENTIVES: renderGroups,
};

export function TravelTradeReviewBlock({ profile }: { profile?: TravelTradeProfile | null }) {
  if (!profile?.operatorTypes?.length) return null;

  const operatorLabels = profile.operatorTypes
    .filter((t) => OPERATOR_STEP_ORDER.includes(t))
    .sort((a, b) => OPERATOR_STEP_ORDER.indexOf(a) - OPERATOR_STEP_ORDER.indexOf(b))
    .map((t) => labelForOperatorType(t))
    .join(", ");

  return (
    <div className="col-span-2 pt-2 border-t border-border space-y-2">
      <span className="text-text-muted">Travel trade</span>
      <Field label="Operator name" value={profile.travelOperatorName} />
      <Field label="Operator types" value={operatorLabels} />
      {OPERATOR_STEP_ORDER.filter((t) => profile.operatorTypes.includes(t)).map((t) => (
        <div key={t}>{RENDERERS[t](profile)}</div>
      ))}
    </div>
  );
}
