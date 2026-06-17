import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountWizardStep } from "./travelTradeStepPlan";

interface AddAccountStepIndicatorProps {
  steps: AccountWizardStep[];
  currentStepIndex: number;
}

export function AddAccountStepIndicator({ steps, currentStepIndex }: AddAccountStepIndicatorProps) {
  return (
    <nav
      aria-label="Account wizard progress"
      className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1"
    >
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = currentStepIndex > index;
        const isActive = currentStepIndex === index;

        return (
          <div key={step.id} className="flex items-center min-w-0 shrink-0" style={{ minWidth: "4.5rem" }}>
            <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors",
                  isCompleted && "bg-primary text-white",
                  isActive && "bg-primary text-white ring-2 ring-primary/20",
                  !isCompleted && !isActive && "border border-border bg-surface text-text-muted"
                )}
              >
                {isCompleted ? <Check className="h-3.5 w-3.5" /> : stepNum}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium truncate w-full text-center max-w-[5.5rem]",
                  isActive ? "text-text" : "text-text-muted"
                )}
                title={step.label}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-4 sm:w-6 mx-0.5 mb-4 shrink-0",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
