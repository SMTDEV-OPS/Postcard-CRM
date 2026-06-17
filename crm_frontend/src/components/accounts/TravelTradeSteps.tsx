import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormLabelHelp } from "@/components/help/FormLabelHelp";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AGENT_TYPES,
  DOMESTIC_SEGMENTS,
  GROUPS_INCENTIVE_TYPES,
  HOTEL_SEGMENTS,
  INBOUND_SEGMENTS,
  LUXURY_OPERATOR_KINDS,
  SERIES_FREQUENCIES,
  SERIES_PATTERNS,
  TRAVEL_MONTH_OPTIONS,
  TRAVEL_OPERATOR_TYPES,
  labelForInboundSegment,
} from "@/constants/travelTradeAccountData";
import type { AccountFormData } from "./accountFormTypes";
import type { TravelOperatorType } from "@/types/travelTradeProfile";
import { MONTHS } from "@/constants/accountData";

type SetForm = (patch: Partial<AccountFormData>) => void;

function toggleInArray<T extends string>(arr: T[], value: T, checked: boolean): T[] {
  if (checked) return arr.includes(value) ? arr : [...arr, value];
  return arr.filter((v) => v !== value);
}

export function TravelTradeOrganizationFields({
  formData,
  set,
}: {
  formData: AccountFormData;
  set: SetForm;
}) {
  const profile = formData.travelTradeProfile;
  const operatorTypes = profile?.operatorTypes ?? [];

  const toggleOperatorType = (value: TravelOperatorType, checked: boolean) => {
    const next = toggleInArray(operatorTypes, value, checked);
    set({
      travelTradeProfile: {
        ...profile!,
        operatorTypes: next,
      },
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-hover/30 p-4">
      <p className="text-sm font-medium text-text">Travel trade details</p>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.organization.travelOperatorName" required htmlFor="travel-operator-name">
          Travel operator name
        </FormLabelHelp>
        <Input
          id="travel-operator-name"
          value={profile?.travelOperatorName ?? ""}
          onChange={(e) =>
            set({
              travelTradeProfile: { ...profile!, travelOperatorName: e.target.value },
            })
          }
          placeholder="Operator legal / trade name"
        />
      </div>
      <div className="space-y-2">
        <FormLabelHelp helpId="accounts.wizard.organization.operatorTypes" required>
          Travel operator type
        </FormLabelHelp>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TRAVEL_OPERATOR_TYPES.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={operatorTypes.includes(opt.value)}
                onCheckedChange={(v) => toggleOperatorType(opt.value, !!v)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TravelTradeInboundStep({ formData, set }: { formData: AccountFormData; set: SetForm }) {
  const inbound = formData.travelTradeProfile?.inbound ?? {
    segments: [],
    segmentMarkets: {},
    hotelSegments: [],
  };

  const updateInbound = (patch: Partial<typeof inbound>) => {
    set({
      travelTradeProfile: {
        ...formData.travelTradeProfile!,
        inbound: { ...inbound, ...patch },
      },
    });
  };

  const toggleSegment = (value: (typeof INBOUND_SEGMENTS)[number]["value"], checked: boolean) => {
    const segments = toggleInArray(inbound.segments, value, checked);
    const segmentMarkets = { ...inbound.segmentMarkets };
    if (!checked) delete segmentMarkets[value];
    updateInbound({ segments, segmentMarkets });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-medium">Inbound operator</h3>
      <div className="space-y-2">
        <FormLabelHelp helpId="accounts.wizard.travel.inbound.segments">Segment</FormLabelHelp>
        <div className="grid grid-cols-2 gap-2">
          {INBOUND_SEGMENTS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={inbound.segments.includes(opt.value)}
                onCheckedChange={(v) => toggleSegment(opt.value, !!v)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      {inbound.segments.length > 0 && (
        <div className="space-y-3">
          <FormLabelHelp helpId="accounts.wizard.travel.inbound.segmentMarkets">Market / country per segment</FormLabelHelp>
          {inbound.segments.map((seg) => (
            <div key={seg} className="space-y-1">
              <Label className="text-xs text-text-muted">{labelForInboundSegment(seg)}</Label>
              <Input
                value={inbound.segmentMarkets[seg] ?? ""}
                onChange={(e) =>
                  updateInbound({
                    segmentMarkets: { ...inbound.segmentMarkets, [seg]: e.target.value },
                  })
                }
                placeholder="Market or country"
              />
            </div>
          ))}
        </div>
      )}
      <div className="space-y-2">
        <FormLabelHelp helpId="accounts.wizard.travel.inbound.hotelSegments">Hotel segment</FormLabelHelp>
        <div className="grid grid-cols-2 gap-2">
          {HOTEL_SEGMENTS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={inbound.hotelSegments.includes(opt.value)}
                onCheckedChange={(v) =>
                  updateInbound({
                    hotelSegments: toggleInArray(inbound.hotelSegments, opt.value, !!v),
                  })
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function TravelTradeLuxuryStep({ formData, set }: { formData: AccountFormData; set: SetForm }) {
  const luxury = formData.travelTradeProfile?.luxury ?? {};

  const updateLuxury = (patch: Partial<typeof luxury>) => {
    set({
      travelTradeProfile: {
        ...formData.travelTradeProfile!,
        luxury: { ...luxury, ...patch },
      },
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-medium">Luxury operator</h3>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.travel.luxury.countryMarket">Country / market</FormLabelHelp>
        <Input
          value={luxury.countryMarket ?? ""}
          onChange={(e) => updateLuxury({ countryMarket: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.travel.luxury.operatorKind">Type of operator</FormLabelHelp>
        <Select
          value={luxury.operatorKind ?? ""}
          onValueChange={(v) =>
            updateLuxury({ operatorKind: v as "LUXURY_TOUR_OPERATOR" | "DMC" })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {LUXURY_OPERATOR_KINDS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.travel.luxury.annualRoomNights">Estimated annual room nights</FormLabelHelp>
        <Input
          type="number"
          min={0}
          value={luxury.estimatedAnnualRoomNights ?? ""}
          onChange={(e) =>
            updateLuxury({
              estimatedAnnualRoomNights: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>
    </div>
  );
}

export function TravelTradeSeriesStep({ formData, set }: { formData: AccountFormData; set: SetForm }) {
  const series = formData.travelTradeProfile?.series ?? {};

  const updateSeries = (patch: Partial<typeof series>) => {
    set({
      travelTradeProfile: {
        ...formData.travelTradeProfile!,
        series: { ...series, ...patch },
      },
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-medium">Series operator</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.market">Market</FormLabelHelp>
          <Input value={series.market ?? ""} onChange={(e) => updateSeries({ market: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.programName">Series or program name</FormLabelHelp>
          <Input
            value={series.programName ?? ""}
            onChange={(e) => updateSeries({ programName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.startMonth">Start month</FormLabelHelp>
          <Select
            value={series.startMonth ? String(series.startMonth) : ""}
            onValueChange={(v) => updateSeries({ startMonth: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.endMonth">End month</FormLabelHelp>
          <Select
            value={series.endMonth ? String(series.endMonth) : ""}
            onValueChange={(v) => updateSeries({ endMonth: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.frequency">Frequency</FormLabelHelp>
          <Select
            value={series.frequency ?? ""}
            onValueChange={(v) => updateSeries({ frequency: v as "WEEKLY" | "BIWEEKLY" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {SERIES_FREQUENCIES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.pattern">Pattern</FormLabelHelp>
          <Select
            value={series.pattern ?? ""}
            onValueChange={(v) => updateSeries({ pattern: v as "WEEKENDS" | "WEEKDAYS" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {SERIES_PATTERNS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.roomsPerDeparture">Rooms per departure</FormLabelHelp>
          <Input
            type="number"
            min={0}
            value={series.roomsPerDeparture ?? ""}
            onChange={(e) =>
              updateSeries({
                roomsPerDeparture: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.totalRoomNights">Estimated total room nights</FormLabelHelp>
          <Input
            type="number"
            min={0}
            value={series.estimatedTotalRoomNights ?? ""}
            onChange={(e) =>
              updateSeries({
                estimatedTotalRoomNights: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.travel.series.blackoutDates">Blackout dates</FormLabelHelp>
        <Textarea
          value={series.blackoutDates ?? ""}
          onChange={(e) => updateSeries({ blackoutDates: e.target.value })}
          placeholder="Comma or line-separated dates"
          rows={3}
        />
      </div>
    </div>
  );
}

export function TravelTradeDomesticStep({ formData, set }: { formData: AccountFormData; set: SetForm }) {
  const domestic = formData.travelTradeProfile?.domestic ?? { segments: [] };

  const updateDomestic = (patch: Partial<typeof domestic>) => {
    set({
      travelTradeProfile: {
        ...formData.travelTradeProfile!,
        domestic: { ...domestic, ...patch },
      },
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-medium">Domestic agent</h3>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.travel.domestic.city">City</FormLabelHelp>
        <Input value={domestic.city ?? ""} onChange={(e) => updateDomestic({ city: e.target.value })} />
      </div>
      <div className="space-y-2">
        <FormLabelHelp helpId="accounts.wizard.travel.domestic.segment">Segment</FormLabelHelp>
        <div className="grid grid-cols-2 gap-2">
          {DOMESTIC_SEGMENTS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={domestic.segments.includes(opt.value)}
                onCheckedChange={(v) =>
                  updateDomestic({
                    segments: toggleInArray(domestic.segments, opt.value, !!v),
                  })
                }
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.travel.domestic.agentType">Agent type</FormLabelHelp>
        <Select
          value={domestic.agentType ?? ""}
          onValueChange={(v) => updateDomestic({ agentType: v as "B2B" | "B2C" })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {AGENT_TYPES.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function TravelTradeGroupsStep({ formData, set }: { formData: AccountFormData; set: SetForm }) {
  const groups = formData.travelTradeProfile?.groupsIncentives ?? { preferredTravelMonths: [] };

  const updateGroups = (patch: Partial<typeof groups>) => {
    set({
      travelTradeProfile: {
        ...formData.travelTradeProfile!,
        groupsIncentives: { ...groups, ...patch },
      },
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-medium">Groups & incentives</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.series.market">Market</FormLabelHelp>
          <Input value={groups.market ?? ""} onChange={(e) => updateGroups({ market: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.groups.type">Type</FormLabelHelp>
          <Select
            value={groups.type ?? ""}
            onValueChange={(v) =>
              updateGroups({ type: v as "GROUP" | "INCENTIVE" | "CORPORATE_RETREAT" })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {GROUPS_INCENTIVE_TYPES.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.travel.groups.groupSize">Group size</FormLabelHelp>
          <Input
            type="number"
            min={0}
            value={groups.groupSize ?? ""}
            onChange={(e) =>
              updateGroups({ groupSize: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>
      </div>
      <div className="space-y-2">
        <FormLabelHelp helpId="accounts.wizard.travel.groups.preferredTravelMonths">Preferred travel months</FormLabelHelp>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {TRAVEL_MONTH_OPTIONS.map((m) => (
            <label key={m.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={groups.preferredTravelMonths.includes(m.value)}
                onCheckedChange={(v) =>
                  updateGroups({
                    preferredTravelMonths: toggleInArray(
                      groups.preferredTravelMonths,
                      m.value,
                      !!v
                    ),
                  })
                }
              />
              {m.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
