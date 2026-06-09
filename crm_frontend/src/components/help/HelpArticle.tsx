import { Link } from "react-router-dom";
import type { HelpTopic } from "@/help/helpTypes";
import { getHelpTopic } from "@/help/helpContent";
import { helpArticleUrl } from "@/help/useHelpTopic";

function renderBody(body: string) {
  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length) {
      elements.push(
        <ul key={key} className="my-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {listItems.map((item, i) => (
            <li key={i}>{item.replace(/^\d+\.\s*/, "")}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`list-${i}`);
      return;
    }
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      flushList(`list-${i}`);
      elements.push(
        <p key={i} className="mt-3 text-sm font-semibold text-foreground">
          {trimmed.replace(/\*\*/g, "")}
        </p>
      );
      return;
    }
    if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed);
      return;
    }
    flushList(`list-${i}`);
    elements.push(
      <p key={i} className="text-sm text-muted-foreground leading-relaxed">
        {trimmed}
      </p>
    );
  });
  flushList("list-end");
  return elements;
}

interface HelpArticleProps {
  topic: HelpTopic;
  showRelated?: boolean;
}

export function HelpArticle({ topic, showRelated = true }: HelpArticleProps) {
  return (
    <article id={topic.id} className="scroll-mt-6 space-y-3">
      <div className="flex items-start gap-2">
        <h2 className="text-lg font-semibold text-foreground">{topic.title}</h2>
        {topic.audience === "admin" && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
            Admin
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{topic.summary}</p>
      <div className="space-y-1">{renderBody(topic.body)}</div>
      {showRelated && topic.relatedIds && topic.relatedIds.length > 0 && (
        <div className="border-t border-border pt-4 mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
            Related
          </p>
          <ul className="space-y-1">
            {topic.relatedIds.map((id) => {
              const related = getHelpTopic(id);
              if (!related) return null;
              return (
                <li key={id}>
                  <Link
                    to={helpArticleUrl(id)}
                    className="text-sm text-primary hover:underline"
                  >
                    {related.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
}
