import type { HelpFieldGuide, HelpFieldSearchResult, HelpScreenGuide, HelpTopic } from "./helpTypes";
import { ALL_FIELD_GUIDES } from "./modules/fieldGuides";
import { LEADS_TOPIC_SCREENS } from "./modules/leadsScreens";
import { ACCOUNTS_TOPIC_SCREENS } from "./modules/accountsScreens";
import { SETUP_TOPIC_SCREENS } from "./modules/setupScreens";

const SCREEN_MAP: Record<string, HelpScreenGuide[]> = {
  ...LEADS_TOPIC_SCREENS,
  ...ACCOUNTS_TOPIC_SCREENS,
  ...SETUP_TOPIC_SCREENS,
};

const fieldMap = new Map<string, HelpFieldGuide>();
const fieldToTopicMap = new Map<string, { topicId: string; topicTitle: string }>();

export function registerTopics(topics: HelpTopic[]) {
  fieldMap.clear();
  fieldToTopicMap.clear();
  for (const f of ALL_FIELD_GUIDES) {
    fieldMap.set(f.id, f);
  }
  for (const t of topics) {
    for (const s of t.screens ?? []) {
      for (const f of s.fields) {
        fieldMap.set(f.id, f);
        fieldToTopicMap.set(f.id, { topicId: t.id, topicTitle: t.title });
      }
    }
  }
}

export function enrichTopic(topic: HelpTopic): HelpTopic {
  const screens = SCREEN_MAP[topic.id] ?? topic.screens;
  const featureWhat = topic.featureWhat ?? topic.summary;
  let featureHow = topic.featureHow;
  if (!featureHow && topic.body) {
    const workflow = topic.body.match(/\*\*Workflow\*\*([\s\S]*?)(?=\n\*\*|$)/);
    featureHow = workflow ? workflow[1].trim() : topic.body.split("\n\n")[0]?.slice(0, 400);
  }
  return { ...topic, screens, featureWhat, featureHow };
}

export function getFieldHelp(id: string): HelpFieldGuide | undefined {
  return fieldMap.get(id);
}

export function getScreensForTopic(topicId: string): HelpScreenGuide[] {
  return SCREEN_MAP[topicId] ?? [];
}

export function countFieldsForTopic(topicId: string): number {
  return (SCREEN_MAP[topicId] ?? []).reduce((n, s) => n + s.fields.length, 0);
}

export function countFieldsForCategory(
  categoryId: string,
  topics: HelpTopic[]
): number {
  return topics
    .filter((t) => t.category === categoryId)
    .reduce((n, t) => n + (t.screens?.reduce((sn, s) => sn + s.fields.length, 0) ?? 0), 0);
}

export function searchFieldGuides(
  query: string,
  topics: HelpTopic[],
  options?: { includeAdmin?: boolean }
): HelpFieldSearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const results: HelpFieldSearchResult[] = [];
  const seen = new Set<string>();

  for (const t of topics) {
    if (!options?.includeAdmin && t.audience === "admin") continue;
    for (const s of t.screens ?? []) {
      for (const f of s.fields) {
        if (seen.has(f.id)) continue;
        const hay = `${f.label} ${f.what} ${f.how} ${f.example ?? ""}`.toLowerCase();
        if (hay.includes(q)) {
          seen.add(f.id);
          results.push({ field: f, topicId: t.id, topicTitle: t.title });
        }
      }
    }
  }
  return results;
}

export function isFieldHelpId(id: string): boolean {
  return fieldMap.has(id);
}

if (import.meta.env?.DEV) {
  (window as unknown as { __helpFieldIds?: Set<string> }).__helpFieldIds = new Set(
    ALL_FIELD_GUIDES.map((f) => f.id)
  );
}
