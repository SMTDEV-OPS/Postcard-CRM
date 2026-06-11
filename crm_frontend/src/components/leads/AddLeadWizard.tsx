import { useEffect, useState, cloneElement, isValidElement } from "react";
import { UseFormReturn, FieldArrayWithId } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Property } from "@/services/properties";
import { LeadCreationWizardForm } from "./LeadCreationWizardForm";
import type { LeadFormData } from "./useLeadForm";

export type { LeadFormData };

interface AddLeadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: React.ReactNode;
  form: UseFormReturn<LeadFormData>;
  hotelFields: FieldArrayWithId<LeadFormData, "hotels", "id">[];
  onAddHotel: () => void;
  onRemoveHotel: (index: number) => void;
  onAddRoom: (hotelIndex: number) => void;
  onRemoveRoom: (hotelIndex: number, roomIndex: number) => void;
  hotelOptions: Property[];
  customFields: Array<Record<string, unknown>>;
  customData: Record<string, unknown>;
  setCustomData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  onSubmit: (data: LeadFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function AddLeadWizard({
  open,
  onOpenChange,
  trigger,
  form,
  hotelFields,
  onAddHotel,
  onRemoveHotel,
  onAddRoom,
  onRemoveRoom,
  hotelOptions,
  customFields,
  customData,
  setCustomData,
  onSubmit,
  isSubmitting,
}: AddLeadWizardProps) {
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (!open) {
      setResetKey((k) => k + 1);
    }
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
  };

  const openTrigger =
    isValidElement(trigger) ?
      cloneElement(trigger as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
        type: "button",
        onClick: (e: React.MouseEvent) => {
          (trigger as React.ReactElement<{ onClick?: React.MouseEventHandler }>).props.onClick?.(e);
          handleOpenChange(true);
        },
      })
    : trigger;

  return (
    <>
      {openTrigger}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl h-[min(90vh,800px)] flex flex-col gap-0 p-0 overflow-hidden sm:max-w-3xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Create a new lead with comprehensive details for better tracking and conversion.
            </DialogDescription>
          </DialogHeader>

          <LeadCreationWizardForm
            variant="dialog"
            form={form}
            hotelFields={hotelFields}
            onAddHotel={onAddHotel}
            onRemoveHotel={onRemoveHotel}
            onAddRoom={onAddRoom}
            onRemoveRoom={onRemoveRoom}
            hotelOptions={hotelOptions}
            customFields={customFields}
            customData={customData}
            setCustomData={setCustomData}
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => handleOpenChange(false)}
            resetKey={resetKey}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
