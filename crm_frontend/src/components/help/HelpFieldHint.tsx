import { HelpInfoButton } from "./HelpInfoButton";
import { cn } from "@/lib/utils";

interface HelpFieldHintProps {
  helpId: string;
  className?: string;
}

export function HelpFieldHint({ helpId, className }: HelpFieldHintProps) {
  return <HelpInfoButton helpId={helpId} className={cn("h-4 w-4", className)} side="top" />;
}
