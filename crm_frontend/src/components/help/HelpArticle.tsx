import { Link } from "react-router-dom";
import type { HelpTopic } from "@/help/helpTypes";
import { getHelpTopic } from "@/help/helpContent";
import { helpArticleUrl } from "@/help/useHelpTopic";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

function FieldTable({ topic }: { topic: HelpTopic }) {
  const screens = topic.screens ?? [];
  if (!screens.length) return null;

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Field reference
      </p>
      <Accordion type="multiple" className="w-full">
        {screens.map((screen) => (
          <AccordionItem key={screen.id} value={screen.id}>
            <AccordionTrigger className="text-sm font-medium py-3">
              {screen.title}
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                ({screen.fields.length} fields)
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 pb-2">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">What: </span>
                  {screen.what}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">How: </span>
                  {screen.how}
                </p>
              </div>
              <div className="overflow-x-auto rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Field</TableHead>
                      <TableHead>What</TableHead>
                      <TableHead>How to use</TableHead>
                      <TableHead className="w-[72px]">Required</TableHead>
                      <TableHead className="w-[120px]">Example</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {screen.fields.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium text-sm align-top">{f.label}</TableCell>
                        <TableCell className="text-xs text-muted-foreground align-top">{f.what}</TableCell>
                        <TableCell className="text-xs text-muted-foreground align-top">{f.how}</TableCell>
                        <TableCell className="text-xs align-top">{f.required ? "Yes" : "—"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground align-top">{f.example ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
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

      {(topic.featureWhat || topic.featureHow) && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-sm">
          {topic.featureWhat && (
            <div>
              <p className="text-xs font-semibold uppercase text-foreground/80">What is this?</p>
              <p className="text-muted-foreground leading-relaxed">{topic.featureWhat}</p>
            </div>
          )}
          {topic.featureHow && (
            <div>
              <p className="text-xs font-semibold uppercase text-foreground/80">How to use it</p>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{topic.featureHow}</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-1">{renderBody(topic.body)}</div>
      <FieldTable topic={topic} />

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
