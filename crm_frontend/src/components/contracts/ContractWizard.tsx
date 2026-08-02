import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FormWizardShell } from "@/components/forms/FormWizardShell";
import { WizardStepIndicator } from "@/components/forms/WizardStepIndicator";
import { RateGrid } from "@/components/RateGrid";
import {
  createEmptyRateGridValue,
  normalizeRateGridValue,
  type RateGridValue,
  DEFAULT_RATE_SLABS,
} from "@/models/contract";
import {
  createContract,
  updateContractRateGrid,
  type Contract,
} from "@/services/contracts";
import type { Contact } from "@/services/contacts";
import type { Property } from "@/services/properties";
import {
  buildPostcardPropertyOptions,
  propertyMapFromOptions,
} from "@/constants/postcardProperties";
import {
  ContractCreateForm,
  ContractStepBasics,
  ContractStepParties,
  ContractCreateReview,
  ContractOverviewStep,
} from "./ContractWizardSteps";

const CREATE_STEPS = [
  { num: 1, label: "Basics" },
  { num: 2, label: "Parties" },
  { num: 3, label: "Rates" },
  { num: 4, label: "Review" },
] as const;

const CREATE_SUBTITLES: Record<number, string> = {
  1: "Company name and sales channel",
  2: "Contact, properties, and rate category per hotel",
  3: "Room categories and rates for selected Cat slabs",
  4: "Review and submit for approval",
};

const EDIT_STEPS = [
  { num: 1, label: "Details" },
  { num: 2, label: "Rates" },
  { num: 3, label: "Save" },
] as const;

const EDIT_SUBTITLES: Record<number, string> = {
  1: "Contract summary",
  2: "Update B2B and B2C rates",
  3: "Review and save changes",
};

const emptyForm: ContractCreateForm = {
  companyName: "",
  channel: "B2B",
  propertyIds: [],
  propertyCategories: {},
  contactId: "",
  contactEmail: "",
};

function slabsFromCategories(categories: Record<string, string>, propertyIds: string[]): string[] {
  const slabs = propertyIds
    .map((id) => categories[id])
    .filter(Boolean);
  const unique = [...new Set(slabs)];
  if (unique.length === 0) return ["CAT A"];
  return DEFAULT_RATE_SLABS.filter((s) => unique.includes(s)).concat(
    unique.filter((s) => !(DEFAULT_RATE_SLABS as readonly string[]).includes(s))
  );
}

interface ContractWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountId: string;
  accountName?: string;
  contacts: Contact[];
  apiProperties: Property[];
  mode?: "create" | "edit";
  contract?: Contract | null;
  contactName?: string;
  onComplete: () => void;
}

export function ContractWizard({
  open,
  onOpenChange,
  accountId,
  accountName,
  contacts,
  apiProperties,
  mode = "create",
  contract,
  contactName,
  onComplete,
}: ContractWizardProps) {
  const { toast } = useToast();
  const isEdit = mode === "edit";
  const steps = isEdit ? EDIT_STEPS : CREATE_STEPS;
  const totalSteps = steps.length;

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ContractCreateForm>({ ...emptyForm });
  const [rateGridValue, setRateGridValue] = useState<RateGridValue>(() =>
    createEmptyRateGridValue(undefined, ["CAT A"])
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const propertyOptions = useMemo(
    () => buildPostcardPropertyOptions(apiProperties),
    [apiProperties]
  );
  const propertyMap = useMemo(
    () => propertyMapFromOptions(propertyOptions, apiProperties),
    [propertyOptions, apiProperties]
  );

  const set = (patch: Partial<ContractCreateForm>) => setForm((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    if (!open) {
      setStep(1);
      if (!isEdit) {
        setForm({
          ...emptyForm,
          companyName: accountName?.trim() || "",
        });
        setRateGridValue(createEmptyRateGridValue(undefined, ["CAT A"]));
      }
      return;
    }
    if (isEdit && contract) {
      setForm({
        companyName: contract.companyName,
        channel: contract.channel,
        propertyIds: contract.propertyIds ?? [],
        propertyCategories: contract.propertyCategories ?? {},
        contactId: contract.contactId ?? "",
        contactEmail: contract.contactEmail ?? "",
      });
      setRateGridValue(
        contract.rateGrid
          ? normalizeRateGridValue(contract.rateGrid as RateGridValue)
          : createEmptyRateGridValue()
      );
    } else if (!isEdit) {
      setForm({
        ...emptyForm,
        companyName: accountName?.trim() || "",
      });
      setRateGridValue(createEmptyRateGridValue(undefined, ["CAT A"]));
    }
  }, [open, isEdit, contract?.id, accountName]);

  // Rebuild rate grid room/cat structure when property categories change (create mode)
  useEffect(() => {
    if (!open || isEdit) return;
    const slabs = slabsFromCategories(form.propertyCategories, form.propertyIds);
    setRateGridValue((prev) => {
      const next = createEmptyRateGridValue(undefined, slabs);
      // Preserve rates for matching roomType+rateSlab cells
      const preserve = (fromRows: typeof prev.b2b.rows, toRows: typeof next.b2b.rows) =>
        toRows.map((row) => {
          const match = fromRows.find(
            (r) => r.roomType === row.roomType && r.rateSlab === row.rateSlab
          );
          return match ? { ...row, ...match, id: row.id } : row;
        });
      return {
        ...next,
        b2b: { ...next.b2b, rows: preserve(prev.b2b.rows, next.b2b.rows) },
        b2c: { ...next.b2c, rows: preserve(prev.b2c.rows, next.b2c.rows) },
      };
    });
  }, [open, isEdit, form.propertyIds.join("|"), JSON.stringify(form.propertyCategories)]);

  const validateStep = (s: number): boolean => {
    if (!isEdit && s === 1 && !form.companyName.trim()) {
      toast({ title: "Required", description: "Company name is required", variant: "destructive" });
      return false;
    }
    if (!isEdit && s === 2) {
      if (form.propertyIds.length === 0) {
        toast({
          title: "Required",
          description: "Select at least one property",
          variant: "destructive",
        });
        return false;
      }
      for (const id of form.propertyIds) {
        if (!form.propertyCategories[id]) {
          toast({
            title: "Required",
            description: "Choose Cat A, B, or C for each property",
            variant: "destructive",
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const handleSubmit = async () => {
    if (!isEdit && !validateStep(1)) {
      setStep(1);
      return;
    }
    if (!isEdit && !validateStep(2)) {
      setStep(2);
      return;
    }
    setIsSubmitting(true);
    try {
      if (isEdit && contract) {
        await updateContractRateGrid(contract.id, rateGridValue);
        toast({ title: "Saved", description: "Contract and rates updated" });
      } else {
        const created = await createContract({
          accountId,
          companyName: form.companyName.trim(),
          channel: form.channel,
          propertyIds: form.propertyIds,
          propertyCategories: form.propertyCategories,
          contactId: form.contactId || undefined,
          contactEmail: form.contactEmail || undefined,
        });
        await updateContractRateGrid(created.id, rateGridValue);
        toast({
          title: "Submitted",
          description: "Contract submitted for approval. Send to client after approval.",
        });
      }
      onOpenChange(false);
      onComplete();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save contract",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtitle = isEdit ? EDIT_SUBTITLES[step] : CREATE_SUBTITLES[step];
  const selectedSlabs = slabsFromCategories(form.propertyCategories, form.propertyIds);

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
        Cancel
      </Button>
      <div className="flex gap-2">
        {step > 1 && (
          <Button type="button" variant="outline" onClick={() => setStep((s) => s - 1)} disabled={isSubmitting}>
            Back
          </Button>
        )}
        {step < totalSteps ? (
          <Button type="button" onClick={handleContinue} disabled={isSubmitting}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving…
              </>
            ) : isEdit ? (
              "Save contract"
            ) : (
              "Submit for approval"
            )}
          </Button>
        )}
      </div>
    </>
  );

  const ratesStep = (
    <div className="space-y-3">
      {!isEdit && (
        <p className="text-sm text-text-muted px-1">
          Room categories and rate columns are populated for{" "}
          <span className="font-medium text-text">{selectedSlabs.join(", ")}</span> based on the
          category chosen per hotel.
        </p>
      )}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <RateGrid value={rateGridValue} onChange={setRateGridValue} embedded rateSlabs={selectedSlabs} />
      </div>
    </div>
  );

  return (
    <FormWizardShell
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit contract" : "New contract"}
      subtitle={subtitle}
      stepIndicator={<WizardStepIndicator steps={steps} currentStep={step} />}
      footer={footer}
      maxWidth="3xl"
      maxHeight="min(90vh,800px)"
    >
      {!isEdit && step === 1 && (
        <ContractStepBasics form={form} set={set} accountNameLocked={Boolean(accountName?.trim())} />
      )}
      {!isEdit && step === 2 && (
        <ContractStepParties
          form={form}
          set={set}
          contacts={contacts}
          propertyOptions={propertyOptions}
        />
      )}
      {isEdit && step === 1 && contract && (
        <ContractOverviewStep
          contract={contract}
          propertyMap={propertyMap}
          contactName={contactName}
        />
      )}
      {((!isEdit && step === 3) || (isEdit && step === 2)) && ratesStep}
      {!isEdit && step === 4 && (
        <div className="space-y-4">
          <ContractCreateReview form={form} propertyMap={propertyMap} contacts={contacts} />
          <p className="text-sm text-text-muted px-1">
            Submitting sends this contract for leader approval. Client email is available only after
            approval.
          </p>
        </div>
      )}
      {isEdit && step === 3 && contract && (
        <div className="space-y-4">
          <ContractOverviewStep contract={contract} propertyMap={propertyMap} contactName={contactName} />
          <p className="text-sm text-text-muted">Click save to update the rate grid on this contract.</p>
        </div>
      )}
    </FormWizardShell>
  );
}
