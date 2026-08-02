import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormWizardShell } from "@/components/forms/FormWizardShell";
import { listConglomerates, Conglomerate } from "@/services/conglomerates";
import { Account, createAccount, updateAccount, listAccounts } from "@/services/accounts";
import { seedInboundMarketPotentials } from "@/utils/seedInboundPotentials";
import { normalizeTravelTradeProfile } from "@/types/travelTradeProfile";
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
import { toCanonicalOrganizationType } from "@/constants/accountData";

/** Map wizard organizationType → legacy Account.type enum. */
function mapOrganizationTypeToLegacyType(organizationType: string): string {
  switch (organizationType) {
    case "CORPORATE":
      return "CORPORATE";
    case "TRAVEL_AGENT":
      return "TRAVEL_AGENT";
    case "GOVERNMENT_INSTITUTIONS":
    case "GOVERNMENT":
    case "GOVERNMENT_BODIES":
    case "EMBASSY_CONSULATE":
    case "EMBASSIES_AND_CONSULATES":
    case "PSU":
    case "PUBLIC_SECTOR_UNIT":
      return "GOVERNMENT";
    case "EVENT_PLANNER":
    case "EVENT_ORGANISER":
    case "PCO":
    case "PROFESSIONAL_CONFERENCE_ORGANISER":
    case "WEDDING_PLANNER":
      return "EVENT_PLANNER";
    case "AIRLINE":
      return "AIRLINES";
    case "LIFESTYLE_HIGH_NET_WORTH":
    case "OTHER":
    case "CUSTOM":
    default:
      return "OTHER";
  }
}

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
      const industry =
        (editingAccount as Account & { industryCategory?: string }).industry ||
        (editingAccount as Account & { industryCategory?: string }).industryCategory ||
        "";
      const industrySize =
        editingAccount.industryStatus ||
        (editingAccount as Account & { industrySize?: string }).industrySize ||
        "MEDIUM";
      setFormData({
        ...emptyAccountForm,
        ...(editingAccount as AccountFormData),
        organizationType: toCanonicalOrganizationType(editingAccount.organizationType),
        conglomerateId: (editingAccount as Account & { conglomerateId?: string }).conglomerateId || null,
        parentAccountId: editingAccount.parentAccountId || null,
        isHeadquarter: editingAccount.isHeadquarter ?? false,
        industryCategory: industry,
        industrySubCategory: editingAccount.industrySubCategory || "",
        industrySize,
        accountTypeOverride: false,
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

    // Map wizard field names to API field names
    if (formData.industryCategory) {
      sanitized.industry = formData.industryCategory;
    }
    if (formData.industrySubCategory) {
      sanitized.industrySubCategory = formData.industrySubCategory;
    }
    if (formData.industrySize) {
      sanitized.industryStatus = formData.industrySize;
    }
    delete sanitized.industryCategory;
    delete sanitized.industrySize;
    // Persist zone; clear unused location fields when blank on submit
    if (!sanitized.locality) delete sanitized.locality;
    if (!sanitized.zip) delete sanitized.zip;
    if (!sanitized.state) delete sanitized.state;

    const legacyMap: Record<string, string> = {
      CORPORATE: "CORPORATE",
      TRAVEL_AGENT: "TRAVEL_AGENT",
      EVENT_PLANNER: "EVENT_PLANNER",
      PCO: "EVENT_PLANNER",
      AIRLINE: "AIRLINES",
      GOVERNMENT: "GOVERNMENT",
      GOVERNMENT_INSTITUTIONS: "GOVERNMENT",
      EMBASSY_CONSULATE: "GOVERNMENT",
      PSU: "GOVERNMENT",
      LIFESTYLE_HIGH_NET_WORTH: "OTHER",
      CUSTOM: "OTHER",
      OTHER: "OTHER",
    };
    sanitized.type = legacyMap[formData.organizationType] || mapOrganizationTypeToLegacyType(formData.organizationType);
    sanitized.accountTypeOverride = false;
    if (!sanitized.conglomerateId) delete sanitized.conglomerateId;
    if (!sanitized.parentAccountId) delete sanitized.parentAccountId;

    const pam = formData.primaryAccountManager;
    if (!pam?.userId?.trim()) {
      // Omit PAM without userId — backend assigns creator as PAM
      delete sanitized.primaryAccountManager;
    } else {
      sanitized.primaryAccountManager = {
        userId: pam.userId.trim(),
        name: pam.name,
        city: pam.city,
      };
    }

    if (formData.secondaryAccountManagers?.length) {
      const sams = formData.secondaryAccountManagers
        .filter((m) => m.userId?.trim())
        .map((m) => ({
          userId: m.userId!.trim(),
          name: m.name,
          city: m.city,
        }));
      if (sams.length) {
        sanitized.secondaryAccountManagers = sams;
      } else {
        delete sanitized.secondaryAccountManagers;
      }
    } else {
      delete sanitized.secondaryAccountManagers;
    }

    if (typeof sanitized.website === "string" && sanitized.website.trim()) {
      const website = sanitized.website.trim();
      if (!/^https?:\/\//i.test(website)) {
        sanitized.website = `https://${website}`;
      }
    }

    delete sanitized.profileStatus;
    sanitized.isHeadquarter = formData.isHeadquarter ?? false;
    if (!isTravelTrade(formData)) {
      delete sanitized.travelTradeProfile;
    } else if (sanitized.travelTradeProfile) {
      const profile = sanitized.travelTradeProfile as Record<string, unknown>;
      const operatorTypes = (profile.operatorTypes as string[]) ?? [];
      for (const key of ["inbound", "luxury", "series", "domestic", "groupsIncentives"] as const) {
        const stepMap: Record<string, string> = {
          inbound: "INBOUND",
          luxury: "LUXURY",
          series: "SERIES",
          domestic: "DOMESTIC_AGENT",
          groupsIncentives: "GROUPS_INCENTIVES",
        };
        if (!operatorTypes.includes(stepMap[key])) {
          delete profile[key];
        }
      }
    }
    // Keep type for API persistence (backend also remaps); do not strip industry.
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
        if (isTravelTrade(formData)) {
          await seedInboundMarketPotentials(
            editingAccount.id,
            normalizeTravelTradeProfile(formData.travelTradeProfile)
          );
        }
        toast({ title: "Success", description: "Account updated" });
        await onSuccess();
        onClose();
      } else {
        const created = await createAccount(sanitized as Parameters<typeof createAccount>[0]);
        if (isTravelTrade(formData) && created?.id) {
          await seedInboundMarketPotentials(
            created.id,
            normalizeTravelTradeProfile(formData.travelTradeProfile)
          );
        }
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
        return <TravelTradeInboundStep formData={formData} set={set} properties={properties} />;
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

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto">
        Cancel
      </Button>
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        {!isEdit && stepIndex > 0 && (
          <Button type="button" variant="outline" onClick={handleBack} disabled={isSubmitting} className="flex-1 sm:flex-none">
            Back
          </Button>
        )}
        {isEdit ? (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 sm:flex-none">
            {isSubmitting ? "Saving…" : "Save changes"}
          </Button>
        ) : !isLastStep ? (
          <Button type="button" onClick={handleContinue} disabled={isSubmitting} className="flex-1 sm:flex-none">
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 sm:flex-none">
            {isSubmitting ? "Creating…" : "Create account"}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <FormWizardShell
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title={isEdit ? "Edit account" : "New account"}
      subtitle={currentStep?.subtitle ?? (isEdit ? "Update account details" : undefined)}
      stepIndicator={
        !isEdit ? <AddAccountStepIndicator steps={steps} currentStepIndex={stepIndex} /> : undefined
      }
      footer={footer}
      maxWidth="2xl"
    >
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
    </FormWizardShell>
  );
};
