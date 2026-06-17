import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { listConglomerates, Conglomerate } from "@/services/conglomerates";
import { Account, createAccount, updateAccount, listAccounts } from "@/services/accounts";
import { listProperties, Property } from "@/services/properties";
import { AddAccountStepIndicator } from "@/components/accounts/AddAccountStepIndicator";
import { emptyAccountForm, AccountFormData, defaultContractingPeriod } from "@/components/accounts/accountFormTypes";
import {
  AccountStepOrganization,
  AccountStepClassification,
  AccountStepHierarchy,
  AccountStepLocation,
  AccountStepCompliance,
  AccountReviewSummary,
  StepContext,
} from "@/components/accounts/AccountCreationSteps";
import {
  buildAccountWizardSteps,
  isTravelTrade,
  validateWizardStep,
  type AccountWizardStepId,
} from "@/components/accounts/travelTradeStepPlan";
import {
  TravelTradeInboundStep,
  TravelTradeLuxuryStep,
  TravelTradeSeriesStep,
  TravelTradeDomesticStep,
  TravelTradeGroupsStep,
} from "@/components/accounts/TravelTradeSteps";
import { normalizeTravelTradeProfile } from "@/types/travelTradeProfile";

export interface AccountWizardSuccessPayload {
  account: Account;
  isNew: boolean;
  openContacts?: boolean;
}

interface AccountCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  editingAccount?: Account | null;
  onSuccess: () => void | Promise<void>;
  /** Called after create (not edit) with the new account for navigation */
  onCreated?: (payload: AccountWizardSuccessPayload) => void;
}

export const AccountCreationWizard = ({
  isOpen,
  onClose,
  editingAccount,
  onSuccess,
  onCreated,
}: AccountCreationWizardProps) => {
  const { toast } = useToast();
  const [stepIndex, setStepIndex] = useState(0);
  const [conglomerates, setConglomerates] = useState<Conglomerate[]>([]);
  const [availableAccounts, setAvailableAccounts] = useState<Account[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<AccountFormData>({ ...emptyAccountForm });

  const set = (patch: Partial<AccountFormData>) => setFormData((prev) => ({ ...prev, ...patch }));
  const isEdit = !!editingAccount;

  const steps = useMemo(() => buildAccountWizardSteps(formData), [formData]);
  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(Math.max(0, steps.length - 1));
    }
  }, [stepIndex, steps.length]);

  useEffect(() => {
    if (!isOpen) {
      setStepIndex(0);
      return;
    }
    if (editingAccount) {
      setFormData({
        ...emptyAccountForm,
        ...(editingAccount as AccountFormData),
        conglomerateId: (editingAccount as Account & { conglomerateId?: string }).conglomerateId || null,
        parentAccountId: editingAccount.parentAccountId || null,
        isHeadquarter: editingAccount.isHeadquarter ?? false,
        primaryAccountManager: editingAccount.primaryAccountManager || { userId: "", name: "", city: "" },
        secondaryAccountManagers: editingAccount.secondaryAccountManagers || [],
        propertyIds: editingAccount.propertyIds || [],
        travelTradeProfile: normalizeTravelTradeProfile(editingAccount.travelTradeProfile),
      });
    } else {
      setFormData({ ...emptyAccountForm });
    }
  }, [editingAccount, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([listConglomerates(), listAccounts(), listProperties()])
      .then(([congs, accs, props]) => {
        setConglomerates(congs);
        setAvailableAccounts(accs);
        setProperties(props);
      })
      .catch((err) => console.error("Failed to fetch reference data:", err));
  }, [isOpen]);

  const addSam = () =>
    set({ secondaryAccountManagers: [...formData.secondaryAccountManagers, { userId: "", name: "", city: "" }] });

  const removeSam = (i: number) =>
    set({ secondaryAccountManagers: formData.secondaryAccountManagers.filter((_, idx) => idx !== i) });

  const updateSam = (i: number, patch: Record<string, string>) =>
    set({
      secondaryAccountManagers: formData.secondaryAccountManagers.map((m, idx) =>
        idx === i ? { ...m, ...patch } : m
      ),
    });

  const toggleContractingType = (type: string, checked: boolean) => {
    let types = [...formData.contractingTypes];
    if (checked) {
      types.push({ type, ...defaultContractingPeriod() });
    } else {
      types = types.filter((t) => t.type !== type);
    }
    set({ contractingTypes: types });
  };

  const updateContractingType = (type: string, patch: Record<string, number>) =>
    set({
      contractingTypes: formData.contractingTypes.map((t) => (t.type === type ? { ...t, ...patch } : t)),
    });

  const stepCtx: StepContext = {
    formData,
    set,
    conglomerates,
    availableAccounts,
    properties,
    editingAccount,
    addSam,
    removeSam,
    updateSam,
    toggleContractingType,
    updateContractingType,
  };

  const validateCurrentStep = (): boolean => {
    if (!currentStep) return false;
    const result = validateWizardStep(currentStep.id, formData);
    if (!result.valid) {
      toast({
        title: "Required",
        description: result.message ?? "Please complete required fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) return;
    setStepIndex((i) => Math.min(steps.length - 1, i + 1));
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const buildPayload = () => {
    const sanitized: Record<string, unknown> = { ...formData };
    const legacyMap: Record<string, string> = {
      CORPORATE: "CORPORATE",
      TRAVEL_AGENT: "TRAVEL_AGENT",
      EVENT_PLANNER: "EVENT_PLANNER",
      PCO: "EVENT_PLANNER",
      AIRLINE: "AIRLINES",
      GOVERNMENT: "GOVERNMENT",
      EMBASSY_CONSULATE: "GOVERNMENT",
      PSU: "GOVERNMENT",
      CUSTOM: "OTHER",
    };
    sanitized.type = legacyMap[formData.organizationType] || "OTHER";
    if (!sanitized.conglomerateId) delete sanitized.conglomerateId;
    if (!sanitized.parentAccountId) delete sanitized.parentAccountId;
    const pam = formData.primaryAccountManager;
    if (!pam?.name && !pam?.userId) {
      delete sanitized.primaryAccountManager;
    } else if (pam.userId === "") {
      sanitized.primaryAccountManager = { name: pam.name, city: pam.city };
    }
    if (formData.secondaryAccountManagers?.length) {
      sanitized.secondaryAccountManagers = formData.secondaryAccountManagers
        .filter((m) => m.name?.trim() || m.userId?.trim())
        .map((m) => {
          const s = { ...m };
          if (s.userId === "") delete (s as { userId?: string }).userId;
          return s;
        });
    }
    delete sanitized.profileStatus;
    sanitized.isHeadquarter = formData.isHeadquarter ?? false;
    if (!isTravelTrade(formData)) {
      delete sanitized.travelTradeProfile;
    }
    for (const key of Object.keys(sanitized)) {
      if (sanitized[key] === "") delete sanitized[key];
    }
    return sanitized;
  };

  const handleSubmit = async () => {
    const orgResult = validateWizardStep("organization", formData);
    if (!orgResult.valid) {
      toast({
        title: "Required",
        description: orgResult.message ?? "Account name is required",
        variant: "destructive",
      });
      setStepIndex(0);
      return;
    }
    if (isTravelTrade(formData)) {
      for (const step of steps) {
        if (step.id.startsWith("travel_")) {
          const result = validateWizardStep(step.id, formData);
          if (!result.valid) {
            toast({
              title: "Required",
              description: result.message,
              variant: "destructive",
            });
            const idx = steps.findIndex((s) => s.id === step.id);
            if (idx >= 0) setStepIndex(idx);
            return;
          }
        }
      }
    }
    try {
      setIsSubmitting(true);
      const sanitized = buildPayload();
      if (editingAccount) {
        await updateAccount(editingAccount.id, sanitized);
        toast({ title: "Success", description: "Account updated" });
        await onSuccess();
        onClose();
      } else {
        const created = await createAccount(sanitized as Parameters<typeof createAccount>[0]);
        toast({ title: "Success", description: "Account created" });
        await onSuccess();
        if (onCreated) {
          onCreated({ account: created, isNew: true, openContacts: true });
          onClose();
        } else {
          onClose();
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save account",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepBody = (stepId: AccountWizardStepId) => {
    switch (stepId) {
      case "organization":
        return <AccountStepOrganization {...stepCtx} />;
      case "classification":
        return <AccountStepClassification {...stepCtx} />;
      case "travel_inbound":
        return <TravelTradeInboundStep formData={formData} set={set} />;
      case "travel_luxury":
        return <TravelTradeLuxuryStep formData={formData} set={set} />;
      case "travel_series":
        return <TravelTradeSeriesStep formData={formData} set={set} />;
      case "travel_domestic":
        return <TravelTradeDomesticStep formData={formData} set={set} />;
      case "travel_groups":
        return <TravelTradeGroupsStep formData={formData} set={set} />;
      case "hierarchy":
        return <AccountStepHierarchy {...stepCtx} />;
      case "location":
        return <AccountStepLocation {...stepCtx} />;
      case "review":
        return (
          <div className="space-y-4">
            <AccountReviewSummary formData={formData} availableAccounts={availableAccounts} />
            <AccountStepCompliance ctx={stepCtx} />
          </div>
        );
      default:
        return null;
    }
  };

  const isLastStep = stepIndex >= steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl h-[min(90vh,720px)] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-base font-semibold">
            {isEdit ? "Edit account" : "New account"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {currentStep?.subtitle ?? ""}
          </DialogDescription>
          {!isEdit && (
            <div className="pt-3">
              <AddAccountStepIndicator steps={steps} currentStepIndex={stepIndex} />
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isEdit ? (
            <div className="space-y-4">
              <AccountStepOrganization {...stepCtx} />
              <AccountStepClassification {...stepCtx} />
              {isTravelTrade(formData) && (
                <>
                  {steps
                    .filter((s) => s.id.startsWith("travel_"))
                    .map((s) => (
                      <div key={s.id}>{renderStepBody(s.id)}</div>
                    ))}
                </>
              )}
              <AccountStepHierarchy {...stepCtx} />
              <AccountStepLocation {...stepCtx} />
              <AccountStepCompliance ctx={stepCtx} />
            </div>
          ) : (
            currentStep && renderStepBody(currentStep.id)
          )}
        </div>

        <div className="shrink-0 flex justify-between gap-2 px-6 py-4 border-t border-border bg-surface">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {!isEdit && stepIndex > 0 && (
              <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {isEdit ? (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
            ) : !isLastStep ? (
              <Button type="button" onClick={handleContinue} disabled={isSubmitting}>
                Continue
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create account"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
