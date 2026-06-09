import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getHelpTopic } from "@/help/helpContent";
import { helpArticleUrl } from "@/help/useHelpTopic";
import { cn } from "@/lib/utils";

interface HelpInfoButtonProps {
  helpId: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  showLearnMore?: boolean;
}

export function HelpInfoButton({
  helpId,
  className,
  side = "right",
  showLearnMore = true,
}: HelpInfoButtonProps) {
  const topic = getHelpTopic(helpId);
  if (!topic) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Help: ${topic.title}`}
          className={cn(
            "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 p-4 text-sm"
        side={side}
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="mb-2 text-sm font-semibold">{topic.title}</h4>
        <p className="text-muted-foreground leading-relaxed">{topic.summary}</p>
        {showLearnMore && (
          <Link
            to={helpArticleUrl(helpId)}
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Learn more →
          </Link>
        )}
      </PopoverContent>
    </Popover>
  );
}
