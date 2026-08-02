import { Input } from "@/components/ui/input";
import { FormLabelHelp } from "@/components/help/FormLabelHelp";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { Contract, ContractChannel } from "@/services/contracts";
import type { Contact } from "@/services/contacts";
import type { PostcardPropertyOption } from "@/constants/postcardProperties";
import { cn } from "@/lib/utils";
import { formGrid2 } from "@/lib/responsive";
import { DEFAULT_RATE_SLABS } from "@/models/contract";

export interface ContractCreateForm {
  companyName: string;
  channel: ContractChannel;
  propertyIds: string[];
  /** One Cat A/B/C per selected property */
  propertyCategories: Record<string, string>;
  contactId: string;
  contactEmail: string;
}

export function ContractStepBasics({
  form,
  set,
  accountNameLocked,
}: {
  form: ContractCreateForm;
  set: (patch: Partial<ContractCreateForm>) => void;
  accountNameLocked?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
      <div className="space-y-1.5">
        <FormLabelHelp helpId="contracts.wizard.companyName" required>Company name</FormLabelHelp>
        <Input
          value={form.companyName}
          onChange={(e) => set({ companyName: e.target.value })}
          placeholder="Legal entity name on contract"
          readOnly={accountNameLocked}
          className={accountNameLocked ? "bg-muted/40" : undefined}
        />
        {accountNameLocked && (
          <p className="text-xs text-text-muted">Autofilled from the account name.</p>
        )}
      </div>
      <div className="space-y-1.5">
        <FormLabelHelp helpId="contracts.wizard.channel">Channel</FormLabelHelp>
        <Select value={form.channel} onValueChange={(v) => set({ channel: v as ContractChannel })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="B2B">B2B</SelectItem>
            <SelectItem value="B2C">B2C</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function ContractStepParties({
  form,
  set,
  contacts,
  propertyOptions,
}: {
  form: ContractCreateForm;
  set: (patch: Partial<ContractCreateForm>) => void;
  contacts: Contact[];
  propertyOptions: PostcardPropertyOption[];
}) {
  const selectableIds = propertyOptions.filter((p) => p.selectable).map((p) => p.id);

  const toggleProperty = (id: string, checked: boolean) => {
    if (!id) return;
    const propertyIds = checked
      ? [...form.propertyIds, id]
      : form.propertyIds.filter((x) => x !== id);
    const propertyCategories = { ...form.propertyCategories };
    if (checked) {
      if (!propertyCategories[id]) propertyCategories[id] = "CAT A";
    } else {
      delete propertyCategories[id];
    }
    set({ propertyIds, propertyCategories });
  };

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => form.propertyIds.includes(id));

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-surface p-4 space-y-4">
        <div className="space-y-1.5">
          <FormLabelHelp helpId="contracts.wizard.contactId">Send to contact (optional)</FormLabelHelp>
          <Select
            value={form.contactId || "__none__"}
            onValueChange={(v) => set({ contactId: v === "__none__" ? "" : v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No contact</SelectItem>
              {contacts.map((ct) => (
                <SelectItem key={ct.id} value={ct.id}>
                  {ct.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-text-muted">
            Client email is sent only after the contract is approved.
          </p>
        </div>
        <div className="space-y-1.5">
          <FormLabelHelp helpId="contracts.wizard.contactEmail">Or email (optional)</FormLabelHelp>
          <Input
            value={form.contactEmail}
            onChange={(e) => set({ contactEmail: e.target.value })}
            placeholder="someone@company.com"
            type="email"
          />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <FormLabelHelp helpId="contracts.wizard.propertyIds">Properties</FormLabelHelp>
          {selectableIds.length > 0 && (
            <label className="flex items-center gap-2 text-sm cursor-pointer text-text-muted">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(v) => {
                  if (v) {
                    const propertyCategories = { ...form.propertyCategories };
                    for (const id of selectableIds) {
                      if (!propertyCategories[id]) propertyCategories[id] = "CAT A";
                    }
                    set({ propertyIds: selectableIds, propertyCategories });
                  } else {
                    set({ propertyIds: [], propertyCategories: {} });
                  }
                }}
              />
              Select all
            </label>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
          {propertyOptions.map((p) => {
            const checked = p.selectable && form.propertyIds.includes(p.id);
            return (
              <div
                key={p.name}
                className={cn(
                  "rounded-md border border-border/70 p-2 space-y-2",
                  !p.selectable && "opacity-60"
                )}
              >
                <label
                  className={cn(
                    "flex items-start gap-2 text-sm",
                    p.selectable ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    disabled={!p.selectable}
                    onCheckedChange={(v) => toggleProperty(p.id, !!v)}
                    className="mt-0.5"
                  />
                  <span className="leading-snug">{p.name}</span>
                </label>
                {checked && (
                  <div className="ml-6 max-w-xs space-y-1">
                    <FormLabelHelp helpId="contracts.wizard.propertyCategory">
                      Rate category
                    </FormLabelHelp>
                    <Select
                      value={form.propertyCategories[p.id] || "CAT A"}
                      onValueChange={(v) =>
                        set({
                          propertyCategories: { ...form.propertyCategories, [p.id]: v },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_RATE_SLABS.map((slab) => (
                          <SelectItem key={slab} value={slab}>
                            {slab}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {selectableIds.length === 0 && (
          <p className="text-xs text-text-muted">
            No matching hotels in the system yet. Add properties with matching names to enable selection.
          </p>
        )}
      </div>
    </div>
  );
}

export function ContractCreateReview({
  form,
  propertyMap,
  contacts,
}: {
  form: ContractCreateForm;
  propertyMap: Map<string, string>;
  contacts: Contact[];
}) {
  const contactName = contacts.find((c) => c.id === form.contactId)?.name;
  const propertyNames = form.propertyIds.map((id) => {
    const cat = form.propertyCategories[id];
    const name = propertyMap.get(id) ?? id;
    return cat ? `${name} (${cat})` : name;
  });

  return (
    <div className="rounded-lg border border-border bg-hover/40 p-4 space-y-3 text-sm">
      <div className={cn(formGrid2, "gap-x-4 gap-y-2")}>
        <div>
          <span className="text-text-muted">Company</span>
          <p className="font-medium text-text">{form.companyName || "—"}</p>
        </div>
        <div>
          <span className="text-text-muted">Channel</span>
          <p className="font-medium text-text">{form.channel}</p>
        </div>
        <div>
          <span className="text-text-muted">Contact</span>
          <p className="font-medium text-text">{contactName || form.contactEmail || "—"}</p>
        </div>
        <div>
          <span className="text-text-muted">Properties</span>
          <p className="font-medium text-text">
            {propertyNames.length > 0 ? propertyNames.join(", ") : "None"}
          </p>
        </div>
      </div>
    </div>
  );
}

function stepBadgeClass(status: "PENDING" | "APPROVED" | "REJECTED") {
  if (status === "APPROVED") return "bg-green-50 border-green-200 text-green-700";
  if (status === "REJECTED") return "bg-red-50 border-red-200 text-red-700";
  return "bg-amber-50 border-amber-200 text-amber-700";
}

export function ContractOverviewStep({
  contract,
  propertyMap,
  contactName,
}: {
  contract: Contract;
  propertyMap: Map<string, string>;
  contactName?: string;
}) {
  const propertyNames = (contract.propertyIds ?? []).map((id) => propertyMap.get(id) ?? id);

  return (
    <div className="rounded-lg border border-border bg-surface p-4 space-y-4 text-sm">
      <div className={cn(formGrid2, "gap-x-4 gap-y-3")}>
        <div>
          <span className="text-text-muted">Company</span>
          <p className="font-medium text-text">{contract.companyName}</p>
        </div>
        <div>
          <span className="text-text-muted">Channel</span>
          <p className="font-medium text-text">{contract.channel}</p>
        </div>
        <div>
          <span className="text-text-muted">Status</span>
          <Badge variant="outline" className="mt-0.5">
            {contract.status}
          </Badge>
        </div>
        <div>
          <span className="text-text-muted">Contact</span>
          <p className="font-medium text-text">{contactName || contract.contactEmail || "—"}</p>
        </div>
        <div className="col-span-2">
          <span className="text-text-muted">Properties</span>
          <p className="font-medium text-text mt-0.5">
            {propertyNames.length ? propertyNames.join(", ") : "—"}
          </p>
        </div>
      </div>
      {contract.approvals && contract.approvals.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Approval chain</p>
          <div className="flex flex-wrap gap-2">
            {[...contract.approvals]
              .sort((a, b) => a.step - b.step)
              .map((approval, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border",
                    stepBadgeClass(approval.status)
                  )}
                >
                  {approval.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                  {approval.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                  {approval.status === "PENDING" && <Clock className="h-3 w-3" />}
                  <span>{approval.label || `Step ${approval.step}`}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
