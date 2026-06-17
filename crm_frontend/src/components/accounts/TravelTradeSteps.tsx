import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <Label htmlFor="travel-operator-name">
          Travel operator name <span className="text-destructive">*</span>
        </Label>
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
        <Label>
          Travel operator type <span className="text-destructive">*</span>
        </Label>
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
        <Label>Segment</Label>
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
          <Label>Market / country per segment</Label>
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
        <Label>Hotel segment</Label>
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
        <Label>Country / market</Label>
        <Input
          value={luxury.countryMarket ?? ""}
          onChange={(e) => updateLuxury({ countryMarket: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Type of operator</Label>
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
        <Label>Estimated annual room nights</Label>
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
          <Label>Market</Label>
          <Input value={series.market ?? ""} onChange={(e) => updateSeries({ market: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Series or program name</Label>
          <Input
            value={series.programName ?? ""}
            onChange={(e) => updateSeries({ programName: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Start month</Label>
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
          <Label>End month</Label>
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
          <Label>Frequency</Label>
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
          <Label>Pattern</Label>
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
          <Label>Rooms per departure</Label>
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
          <Label>Estimated total room nights</Label>
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
        <Label>Blackout dates</Label>
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
        <Label>City</Label>
        <Input value={domestic.city ?? ""} onChange={(e) => updateDomestic({ city: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label>Segment</Label>
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
        <Label>Agent type</Label>
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
          <Label>Market</Label>
          <Input value={groups.market ?? ""} onChange={(e) => updateGroups({ market: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
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
          <Label>Group size</Label>
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
        <Label>Preferred travel months</Label>
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
