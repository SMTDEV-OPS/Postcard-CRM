/** MongoDB ObjectId-shaped strings (24 hex chars) — never show these as UI labels. */
export function looksLikeObjectId(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /^[a-fA-F0-9]{24}$/.test(value.trim());
}

/** Prefer a human label; never return a raw ObjectId. */
export function displayLabel(
  preferred: string | null | undefined,
  fallback = "—"
): string {
  const v = preferred?.trim();
  if (!v || looksLikeObjectId(v)) return fallback;
  return v;
}
