/** Canonical Postcard hotel properties (display order for seeded hotels) */
export const POSTCARD_PROPERTY_NAMES = [
  "The Postcard in the Himalayan Willows",
  "The Postcard in the Durrung Tea Estate",
  "The Postcard on the Mandovi River, North Goa",
  "The Postcard Saligao",
  "The Postcard Ayurveda Retreat, Old Goa",
  "The Postcard Cuelim",
  "The Postcard Hideaway, Netravali",
  "The Postcard Gir Wildlife Sanctuary",
  "The Postcard Mandalay Hall",
  "The Postcard on the Arabian Sea, Maravanthe Beach",
  "The Postcard Dewa, Thimphu",
  "The Postcard Galle",
  "The Postcard Chicalim, South Goa",
  "The Postcard on the Rapti River, Chitwan, Nepal",
  "The Postcard Jawai Leopard Reserve, Rajasthan",
  "The Postcard Kanha Tiger Reserve",
  "The Postcard Pench Tiger Reserve, Madhya Pradesh",
  "The Postcard, Tirupati",
  "The Postcard on the Siang River, Pasighat",
] as const;

export type PostcardPropertyOption = {
  id: string;
  name: string;
  selectable: boolean;
};

function normalizePropertyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function propertyNamesMatch(canonical: string, apiName: string): boolean {
  const a = normalizePropertyName(canonical);
  const b = normalizePropertyName(apiName);
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

export function buildPostcardPropertyOptions(
  apiProperties: Array<{ _id: string; name: string; status?: string }>
): PostcardPropertyOption[] {
  const active = apiProperties.filter((p) => p.status !== "INACTIVE");
  const usedIds = new Set<string>();
  const ordered: PostcardPropertyOption[] = [];

  for (const canonical of POSTCARD_PROPERTY_NAMES) {
    const match = active.find(
      (p) => !usedIds.has(p._id) && propertyNamesMatch(canonical, p.name)
    );
    if (match) {
      usedIds.add(match._id);
      ordered.push({ id: match._id, name: match.name, selectable: true });
    }
  }

  const extras = active
    .filter((p) => !usedIds.has(p._id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((p) => ({ id: p._id, name: p.name, selectable: true }));

  return [...ordered, ...extras];
}

export function propertyMapFromOptions(
  options: PostcardPropertyOption[],
  apiProperties: Array<{ _id: string; name: string }>
): Map<string, string> {
  const m = new Map<string, string>();
  for (const o of options) {
    if (o.id) m.set(o.id, o.name);
  }
  for (const p of apiProperties) {
    if (!m.has(p._id)) m.set(p._id, p.name);
  }
  return m;
}
