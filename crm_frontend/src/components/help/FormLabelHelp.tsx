import { Label } from "@/components/ui/label";
import { FormLabel } from "@/components/ui/form";
import { HelpFieldHint } from "./HelpFieldHint";
import { cn } from "@/lib/utils";
import { getFieldHelp } from "@/help/helpRegistry";

interface FormLabelHelpProps {
  helpId: string;
  children: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

function warnMissing(helpId: string) {
  if (import.meta.env.DEV && !getFieldHelp(helpId)) {
    console.warn(`[help] Missing field guide: ${helpId}`);
  }
}

export function FormLabelHelp({
  helpId,
  children,
  required,
  htmlFor,
  className,
}: FormLabelHelpProps) {
  warnMissing(helpId);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Label htmlFor={htmlFor} className="mb-0">
        {children}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <HelpFieldHint helpId={helpId} />
    </div>
  );
}

interface FormFieldLabelHelpProps {
  helpId: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

/** Label + (i) hint for react-hook-form FormItem fields */
export function FormFieldLabelHelp({
  helpId,
  children,
  required,
  className,
}: FormFieldLabelHelpProps) {
  warnMissing(helpId);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <FormLabel className="mb-0">
        {children}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </FormLabel>
      <HelpFieldHint helpId={helpId} />
    </div>
  );
}
