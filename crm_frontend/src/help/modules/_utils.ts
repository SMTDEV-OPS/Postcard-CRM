import type { HelpTopic } from "../helpTypes";

export function topic(t: HelpTopic): HelpTopic {
  return t;
}

export function field(
  id: string,
  label: string,
  what: string,
  how: string,
  opts?: { required?: boolean; example?: string; tips?: string; topicId?: string }
) {
  return { id, label, what, how, ...opts };
}
