import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getHelpTopic } from "@/help/helpContent";
import { getFieldHelp } from "@/help/helpRegistry";
import { helpArticleUrl } from "@/help/useHelpTopic";
import { cn } from "@/lib/utils";

interface HelpInfoButtonProps {
  helpId: string;
  className?: string;
  side?: "top" | "right" | "bottom" | "left";
  showLearnMore?: boolean;
  topicId?: string;
}

export function HelpInfoButton({
  helpId,
  className,
  side = "right",
  showLearnMore = true,
  topicId,
}: HelpInfoButtonProps) {
  const field = getFieldHelp(helpId);
  const topic = getHelpTopic(helpId);
  const articleId = topicId ?? (topic?.id && !field ? topic.id : field ? helpId.split(".").slice(0, 2).join(".") : helpId);

  if (!field && !topic) return null;

  const title = field?.label ?? topic!.title;
  const learnMoreId = topic?.id ?? topicId ?? articleId;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Help: ${title}`}
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
        className="w-80 max-h-[min(70vh,420px)] overflow-y-auto p-4 text-sm"
        side={side}
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <h4 className="mb-2 text-sm font-semibold">{title}</h4>
        {field ? (
          <div className="space-y-2 text-muted-foreground leading-relaxed">
            <div>
              <p className="text-xs font-medium uppercase text-foreground/70">What is this?</p>
              <p>{field.what}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-foreground/70">How to use</p>
              <p>{field.how}</p>
            </div>
            {field.example && (
              <p className="text-xs">
                <span className="font-medium text-foreground/70">Example: </span>
                {field.example}
              </p>
            )}
            {field.tips && <p className="text-xs italic">{field.tips}</p>}
          </div>
        ) : (
          <>
            {topic!.featureWhat && (
              <p className="text-xs text-muted-foreground mb-2">{topic!.featureWhat}</p>
            )}
            <p className="text-muted-foreground leading-relaxed">{topic!.summary}</p>
          </>
        )}
        {showLearnMore && learnMoreId && (
          <Link
            to={helpArticleUrl(learnMoreId)}
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {field ? "Full guide →" : topic?.screens?.length ? "View field reference →" : "Learn more →"}
          </Link>
        )}
      </PopoverContent>
    </Popover>
  );
}
