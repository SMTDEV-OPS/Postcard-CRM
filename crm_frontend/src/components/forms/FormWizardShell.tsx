import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface FormWizardShellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  stepIndicator?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  maxHeight?: string;
}

const maxWidthClass: Record<NonNullable<FormWizardShellProps["maxWidth"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
};

export function FormWizardShell({
  open,
  onOpenChange,
  title,
  subtitle,
  stepIndicator,
  children,
  footer,
  maxWidth = "2xl",
  maxHeight = "min(90vh,720px)",
}: FormWizardShellProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          maxWidthClass[maxWidth],
          "flex flex-col gap-0 p-0 overflow-hidden max-w-[calc(100vw-1rem)]",
          maxWidth === "3xl" && "sm:max-w-3xl",
          maxWidth === "4xl" && "sm:max-w-4xl",
          maxHeight === "min(90vh,720px)" && "h-[min(90vh,720px)]",
          maxHeight === "min(90vh,800px)" && "h-[min(90vh,800px)]",
          maxHeight === "min(90vh,860px)" && "h-[min(90vh,860px)]"
        )}
      >
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0 sm:px-6 sm:pt-5">
          <DialogTitle className="text-base font-semibold">{title}</DialogTitle>
          {subtitle && <DialogDescription className="text-sm">{subtitle}</DialogDescription>}
          {stepIndicator && <div className="pt-3">{stepIndicator}</div>}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 min-h-0 sm:px-6">{children}</div>

        <div className="shrink-0 flex flex-col-reverse gap-2 px-4 py-3 border-t border-border bg-surface sm:flex-row sm:justify-between sm:px-6 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {footer}
        </div>
      </DialogContent>
    </Dialog>
  );
}
