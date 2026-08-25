import type { HelpTopic } from "../helpTypes";

export function topic(t: HelpTopic): HelpTopic {
  return t;
}

type FieldOpts = {
  required?: boolean;
  example?: string;
  tips?: string;
  topicId?: string;
};

function isFieldOpts(value: unknown): value is FieldOpts {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    ("required" in value ||
      "example" in value ||
      "tips" in value ||
      "topicId" in value ||
      Object.keys(value as object).length === 0)
  );
}

/**
 * Field guide entry. `how` is optional — callers may pass opts as the 4th argument.
 * Supports both:
 *   field(id, label, what, how, opts?)
 *   field(id, label, what, opts?)
 */
export function field(
  id: string,
  label: string,
  what: string,
  howOrOpts?: string | FieldOpts,
  opts?: FieldOpts
) {
  let how = "";
  let options: FieldOpts | undefined;

  if (typeof howOrOpts === "string") {
    how = howOrOpts;
    options = opts;
  } else if (isFieldOpts(howOrOpts)) {
    how = "";
    options = howOrOpts;
  } else if (howOrOpts != null) {
    // Defensive: never store a non-string as how (prevents React #31)
    how = "";
    options = opts;
  } else {
    options = opts;
  }

  return { id, label, what, how, ...options };
}
