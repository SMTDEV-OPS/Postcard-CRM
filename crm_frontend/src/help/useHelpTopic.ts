import { useMemo } from "react";
import { getHelpTopic, searchHelpTopics } from "./helpContent";

export function useHelpTopic(helpId: string | undefined) {
  return useMemo(() => (helpId ? getHelpTopic(helpId) : undefined), [helpId]);
}

export function useHelpSearch(query: string, includeAdmin: boolean) {
  return useMemo(
    () => searchHelpTopics(query, { includeAdmin }),
    [query, includeAdmin]
  );
}

export function helpArticleUrl(helpId: string): string {
  return `/help#${helpId}`;
}
