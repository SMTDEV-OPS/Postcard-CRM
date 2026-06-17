import { HelpInfoButton } from "./HelpInfoButton";
import { getFieldHelp } from "@/help/helpRegistry";
import { getHelpTopic } from "@/help/helpContent";
import { cn } from "@/lib/utils";

interface HelpFieldHintProps {
  helpId: string;
  className?: string;
}

export function HelpFieldHint({ helpId, className }: HelpFieldHintProps) {
  const hasField = !!getFieldHelp(helpId);
  const hasTopic = !!getHelpTopic(helpId);
  if (!hasField && !hasTopic) {
    if (import.meta.env.DEV) {
      console.warn(`[help] Missing guide for: ${helpId}`);
    }
    return null;
  }
  return <HelpInfoButton helpId={helpId} className={cn("h-4 w-4", className)} side="top" />;
}
