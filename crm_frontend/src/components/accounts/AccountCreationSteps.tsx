import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormLabelHelp } from "@/components/help/FormLabelHelp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { listUsers, type User } from "@/services/users";
import {
  ORGANIZATION_TYPES,
  ACCOUNT_LEVELS,
  MONTHS,
  getIndustryCategoriesForOrganizationType,
  formatOrganizationTypeLabel,
  getStatesForZone,
  getCitiesForState,
} from "@/constants/accountData";
import { Account } from "@/services/accounts";
import { Conglomerate } from "@/services/conglomerates";
import { Property } from "@/services/properties";
import { cn } from "@/lib/utils";
import { formGrid2 } from "@/lib/responsive";
import {
  AccountFormData,
  ACCOUNT_TYPE_OPTIONS,
  buildAccountHierarchyProperties,
  getContractingTypeOptions,
  defaultContractingPeriod,
  formatAccountTypeLabel,
  formatContractingPeriod,
  formatContractingTypeLabel,
} from "./accountFormTypes";
import { emptyTravelTradeProfile } from "@/types/travelTradeProfile";
import { isTravelTrade } from "./travelTradeStepPlan";
import { TravelTradeOrganizationFields } from "./TravelTradeSteps";
import { TravelTradeReviewBlock } from "./TravelTradeReview";

export interface StepContext {
  formData: AccountFormData;
  set: (patch: Partial<AccountFormData>) => void;
  conglomerates: Conglomerate[];
  availableAccounts: Account[];
  properties: Property[];
  editingAccount?: Account | null;
  addSam: () => void;
  removeSam: (i: number) => void;
  updateSam: (i: number, patch: Record<string, string>) => void;
  toggleContractingType: (type: string, checked: boolean) => void;
  updateContractingType: (type: string, patch: Record<string, number>) => void;
}

export function AccountStepOrganization({ formData, set }: StepContext) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.organization.name" required htmlFor="acct-name">
          Account name
        </FormLabelHelp>
        <Input
          id="acct-name"
          value={formData.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Legal entity name"
        />
      </div>
      <div className={formGrid2}>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.organization.organizationType">Organization type</FormLabelHelp>
          <Select
            value={formData.organizationType}
            onValueChange={(v) => {
              const allowed = getIndustryCategoriesForOrganizationType(v);
              const contractingOptions = getContractingTypeOptions(v).map((o) => o.value);
              const patch: Partial<AccountFormData> = {
                organizationType: v,
                industrySubCategory: "",
              };
              if (formData.industryCategory && !allowed.includes(formData.industryCategory)) {
                patch.industryCategory = "";
              }
              if (formData.contractingTypes?.length) {
                const next = formData.contractingTypes.filter((t) => contractingOptions.includes(t.type));
                if (next.length !== formData.contractingTypes.length) {
                  patch.contractingTypes = next;
                }
              }
              if (v === "TRAVEL_AGENT" && !formData.travelTradeProfile) {
                patch.travelTradeProfile = emptyTravelTradeProfile();
              }
              set(patch);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ORGANIZATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {isTravelTrade(formData) && (
        <TravelTradeOrganizationFields formData={formData} set={set} />
      )}
      <div className={formGrid2}>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.organization.email">Email</FormLabelHelp>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="contact@company.com"
          />
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.organization.website">Website</FormLabelHelp>
          <Input
            value={formData.website}
            onChange={(e) => set({ website: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}

export function AccountStepClassification({ formData, set }: StepContext) {
  const industryOptions = getIndustryCategoriesForOrganizationType(formData.organizationType);
  const industryValue =
    formData.industryCategory && industryOptions.includes(formData.industryCategory)
      ? formData.industryCategory
      : "none";

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <div className={formGrid2}>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.classification.accountLevel">Account level</FormLabelHelp>
          <Select value={formData.accountLevel} onValueChange={(v) => set({ accountLevel: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_LEVELS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.classification.accountType">Account type</FormLabelHelp>
          <Select value={formData.accountType} onValueChange={(v) => set({ accountType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACCOUNT_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="isHq"
            checked={formData.isHeadquarter}
            onCheckedChange={(v) => set({ isHeadquarter: !!v })}
          />
          <label htmlFor="isHq" className="text-sm cursor-pointer">
            Headquarter account
          </label>
        </div>
      </div>
      <div className={cn(formGrid2, "pt-2 border-t border-border")}>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.classification.industryCategory">
            Account classification
          </FormLabelHelp>
          <Select
            value={industryValue}
            onValueChange={(v) => set({ industryCategory: v === "none" ? "" : v, industrySubCategory: "" })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Select —</SelectItem>
              {industryOptions.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.classification.industrySize">Industry size</FormLabelHelp>
          <Select value={formData.industrySize} onValueChange={(v) => set({ industrySize: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMALL">Small</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LARGE">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export function AccountStepHierarchy({ formData, set, conglomerates, availableAccounts, properties, editingAccount }: StepContext) {
  const propertyOptions = buildAccountHierarchyProperties(properties);
  const selectableIds = propertyOptions.filter((p) => p.selectable).map((p) => p.id);
  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => formData.propertyIds.includes(id));

  const toggleSelectAll = (checked: boolean) => {
    if (!checked) {
      set({ propertyIds: formData.propertyIds.filter((id) => !selectableIds.includes(id)) });
      return;
    }
    const merged = new Set([...formData.propertyIds, ...selectableIds]);
    set({ propertyIds: Array.from(merged) });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
        <div className={formGrid2}>
          <div className="space-y-1.5">
            <FormLabelHelp helpId="accounts.wizard.hierarchy.conglomerateId">Conglomerate</FormLabelHelp>
            <Select
              value={formData.conglomerateId || "none"}
              onValueChange={(v) => set({ conglomerateId: v === "none" ? null : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None / Individual</SelectItem>
                {conglomerates.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <FormLabelHelp helpId="accounts.wizard.hierarchy.parentAccountId">Parent account</FormLabelHelp>
            <Select
              value={formData.parentAccountId || "none"}
              onValueChange={(v) => set({ parentAccountId: v === "none" ? null : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Root level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Root level (no parent)</SelectItem>
                {availableAccounts
                  .filter((a) => a.id !== editingAccount?.id)
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                      {a.city ? ` · ${a.city}` : ""}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <FormLabelHelp helpId="accounts.wizard.hierarchy.propertyIds">Assign properties</FormLabelHelp>
          {selectableIds.length > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer text-text-muted">
              <Checkbox checked={allSelected} onCheckedChange={(v) => toggleSelectAll(!!v)} />
              <span>Select all</span>
            </label>
          )}
        </div>
        <div className="rounded-md border border-border p-3 space-y-2 max-h-56 overflow-y-auto">
          {propertyOptions.map((property) => {
            const checked = property.selectable && formData.propertyIds.includes(property.id);
            return (
              <label
                key={property.name}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  property.selectable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={!property.selectable}
                  onCheckedChange={(value) => {
                    if (!property.selectable) return;
                    const next = value
                      ? [...formData.propertyIds, property.id]
                      : formData.propertyIds.filter((id) => id !== property.id);
                    set({ propertyIds: next });
                  }}
                />
                <span>{property.name}</span>
                {property.city && (
                  <span className="text-xs text-text-muted">({property.city})</span>
                )}
              </label>
            );
          })}
        </div>
        {selectableIds.length === 0 && (
          <p className="text-xs text-text-muted">
            Property records are not loaded yet. Refresh or check that hotels exist in the system with matching names.
          </p>
        )}
      </div>
    </div>
  );
}

export function AccountStepLocation({ formData, set }: StepContext) {
  const states = getStatesForZone(formData.zone || "");
  const cities = getCitiesForState(formData.state || "");

  const handleZoneChange = (v: string) => {
    const zone = v === "none" ? "" : v;
    set({ zone, state: "", city: "", locality: "", zip: "" });
  };

  const handleStateChange = (v: string) => {
    const state = v === "none" ? "" : v;
    set({ state, city: "" });
  };

  const handleCityChange = (v: string) => {
    const city = v === "none" ? "" : v;
    set({ city });
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <div className={formGrid2}>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.location.zone">Zone</FormLabelHelp>
          <Select value={formData.zone || "none"} onValueChange={handleZoneChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Select —</SelectItem>
              {["NORTH", "SOUTH", "EAST", "WEST"].map((z) => (
                <SelectItem key={z} value={z}>
                  {z.charAt(0) + z.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.location.state">State</FormLabelHelp>
          <Select
            value={formData.state || "none"}
            onValueChange={handleStateChange}
            disabled={!formData.zone}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.zone ? "Select state" : "Select zone first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— Select —</SelectItem>
              {states.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className={formGrid2}>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.location.city">City</FormLabelHelp>
          {cities.length > 0 ? (
            <Select
              value={formData.city || "none"}
              onValueChange={handleCityChange}
              disabled={!formData.state}
            >
              <SelectTrigger>
                <SelectValue placeholder={formData.state ? "Select city" : "Select state first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Select —</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              value={formData.city}
              onChange={(e) => set({ city: e.target.value })}
              placeholder={formData.state ? "Enter city" : "Select state first"}
              disabled={!formData.state}
            />
          )}
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="accounts.wizard.location.country">Country</FormLabelHelp>
          <Select value={formData.country} onValueChange={(v) => set({ country: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="accounts.wizard.location.addressLine1">Address</FormLabelHelp>
        <Input
          value={formData.addressLine1}
          onChange={(e) => set({ addressLine1: e.target.value })}
          placeholder="Street / building"
        />
      </div>
    </div>
  );
}

export function AccountStepCompliance({ ctx }: { ctx: StepContext }) {
  const { formData, set, addSam, removeSam, updateSam, toggleContractingType, updateContractingType } = ctx;
  const contractingOptions = getContractingTypeOptions(formData.organizationType);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  const pickUser = (userId: string) => users.find((u) => u.id === userId);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
        <h4 className="text-sm font-medium text-text">Identification</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <FormLabelHelp helpId="accounts.wizard.compliance.gstin">GSTIN</FormLabelHelp>
            <Input value={formData.gstin} onChange={(e) => set({ gstin: e.target.value })} placeholder="15-digit GSTIN" />
          </div>
          <div className="space-y-1.5">
            <FormLabelHelp helpId="accounts.wizard.compliance.panNumber">PAN</FormLabelHelp>
            <Input value={formData.panNumber} onChange={(e) => set({ panNumber: e.target.value })} placeholder="10-digit PAN" />
          </div>
          <div className="space-y-1.5">
            <FormLabelHelp helpId="accounts.wizard.compliance.pmsProfileId">PMS profile ID</FormLabelHelp>
            <Input
              value={formData.pmsProfileId}
              onChange={(e) => set({ pmsProfileId: e.target.value })}
              placeholder="External system ID"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
        <h4 className="text-sm font-medium text-text">Sales team</h4>
        <p className="text-xs text-muted-foreground">
          Assign PAM/SAM to transfer ownership. Contacts and activity history stay with the company.
        </p>
        <div className="space-y-2">
          <FormLabelHelp helpId="accounts.wizard.compliance.primaryAccountManager" className="text-sm">
            Primary account manager (PAM)
          </FormLabelHelp>
          <div className={formGrid2}>
            <Select
              value={formData.primaryAccountManager?.userId || "none"}
              onValueChange={(v) => {
                if (v === "none") {
                  set({ primaryAccountManager: { userId: "", name: "", city: formData.primaryAccountManager?.city || "" } });
                  return;
                }
                const u = pickUser(v);
                set({
                  primaryAccountManager: {
                    userId: v,
                    name: u?.name || "",
                    city: formData.primaryAccountManager?.city || "",
                  },
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Unassigned —</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="City (optional)"
              value={formData.primaryAccountManager?.city || ""}
              onChange={(e) =>
                set({
                  primaryAccountManager: {
                    ...formData.primaryAccountManager,
                    city: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabelHelp helpId="accounts.wizard.compliance.secondaryAccountManagers" className="text-sm">
              Secondary account managers (SAM)
            </FormLabelHelp>
            <Button type="button" variant="outline" size="sm" onClick={addSam}>
              Add SAM
            </Button>
          </div>
          {formData.secondaryAccountManagers.map((sam, i) => (
            <div key={i} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[200px] flex-1">
                <Select
                  value={sam.userId || "none"}
                  onValueChange={(v) => {
                    if (v === "none") {
                      updateSam(i, { userId: "", name: "" });
                      return;
                    }
                    const u = pickUser(v);
                    updateSam(i, { userId: v, name: u?.name || "" });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Unassigned —</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                className="w-36"
                placeholder="City"
                value={sam.city}
                onChange={(e) => updateSam(i, { city: e.target.value })}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removeSam(i)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <h4 className="text-sm font-medium text-text">Contracting (optional)</h4>
        {contractingOptions.map(({ value: type, label }) => {
          const isChecked = formData.contractingTypes.some((t) => t.type === type);
          const entry = formData.contractingTypes.find((t) => t.type === type);
          return (
            <div
              key={type}
              className={cn("border border-border rounded-md p-3 space-y-2", isChecked && "bg-hover/50")}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`ct-${type}`}
                  checked={isChecked}
                  onCheckedChange={(v) => toggleContractingType(type, !!v)}
                />
                <label htmlFor={`ct-${type}`} className="text-sm font-medium cursor-pointer">
                  {label}
                </label>
              </div>
              {isChecked && entry && (
                <div className="space-y-3 pl-6">
                  <p className="text-xs text-text-muted">
                    Period: {formatContractingPeriod(entry)}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-text-muted">From month</Label>
                      <Select
                        value={entry.fromMonth?.toString()}
                        onValueChange={(v) => {
                          const fromMonth = parseInt(v, 10);
                          const fromYear = entry.fromYear ?? new Date().getFullYear();
                          const toMonth = entry.toMonth ?? fromMonth;
                          const patch: Record<string, number> = { fromMonth };
                          if (fromMonth > toMonth && (entry.toYear ?? fromYear) <= fromYear) {
                            patch.toYear = fromYear + 1;
                          }
                          updateContractingType(type, patch);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value.toString()}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-text-muted">From year</Label>
                      <Input
                        type="number"
                        min={2000}
                        max={2100}
                        value={entry.fromYear ?? new Date().getFullYear()}
                        onChange={(e) => {
                          const fromYear = parseInt(e.target.value, 10) || new Date().getFullYear();
                          const fromMonth = entry.fromMonth ?? 1;
                          const toMonth = entry.toMonth ?? 12;
                          const patch: Record<string, number> = { fromYear };
                          if (fromMonth > toMonth && (entry.toYear ?? fromYear) <= fromYear) {
                            patch.toYear = fromYear + 1;
                          }
                          updateContractingType(type, patch);
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-text-muted">To month</Label>
                      <Select
                        value={entry.toMonth?.toString()}
                        onValueChange={(v) => {
                          const toMonth = parseInt(v, 10);
                          const fromMonth = entry.fromMonth ?? 1;
                          const fromYear = entry.fromYear ?? new Date().getFullYear();
                          const patch: Record<string, number> = { toMonth };
                          if (fromMonth > toMonth && (entry.toYear ?? fromYear) <= fromYear) {
                            patch.toYear = fromYear + 1;
                          }
                          updateContractingType(type, patch);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value.toString()}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-text-muted">To year</Label>
                      <Input
                        type="number"
                        min={2000}
                        max={2100}
                        value={entry.toYear ?? entry.fromYear ?? new Date().getFullYear()}
                        onChange={(e) =>
                          updateContractingType(type, {
                            toYear: parseInt(e.target.value, 10) || new Date().getFullYear(),
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AccountReviewSummary({
  formData,
  availableAccounts,
}: {
  formData: AccountFormData;
  availableAccounts: Account[];
}) {
  const parent = availableAccounts.find((a) => a.id === formData.parentAccountId);
  const orgLabel = formatOrganizationTypeLabel(formData.organizationType);

  return (
    <div className="rounded-lg border border-border bg-hover/40 p-4 space-y-3 text-sm">
      <div className={cn(formGrid2, "gap-x-4 gap-y-2")}>
        <div>
          <span className="text-text-muted">Account name</span>
          <p className="font-medium text-text">{formData.name || "—"}</p>
        </div>
        <div>
          <span className="text-text-muted">Organization</span>
          <p className="font-medium text-text">{orgLabel}</p>
        </div>
        <div>
          <span className="text-text-muted">City</span>
          <p className="font-medium text-text">{formData.city || "—"}</p>
        </div>
        <div>
          <span className="text-text-muted">Parent</span>
          <p className="font-medium text-text">{parent?.name || "Root level"}</p>
        </div>
        <div>
          <span className="text-text-muted">Account type</span>
          <p className="font-medium text-text">{formatAccountTypeLabel(formData.accountType)}</p>
        </div>
        <div>
          <span className="text-text-muted">Properties</span>
          <p className="font-medium text-text">
            {formData.propertyIds.length > 0 ? `${formData.propertyIds.length} selected` : "None"}
          </p>
        </div>
        {formData.contractingTypes.length > 0 && (
          <div className="col-span-2 pt-2 border-t border-border">
            <span className="text-text-muted">Contracting</span>
            <ul className="mt-1 space-y-1">
              {formData.contractingTypes.map((ct) => (
                <li key={ct.type} className="font-medium text-text text-xs">
                  {formatContractingTypeLabel(ct.type)} — {formatContractingPeriod(ct)}
                </li>
              ))}
            </ul>
          </div>
        )}
        {isTravelTrade(formData) && (
          <TravelTradeReviewBlock profile={formData.travelTradeProfile} />
        )}
      </div>
    </div>
  );
}
