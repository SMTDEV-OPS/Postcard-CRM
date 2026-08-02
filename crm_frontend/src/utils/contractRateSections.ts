import { DEFAULT_RATE_SLABS } from "@/models/contract";
import type { RateGridRow } from "@/models/contract";

/** Ordered CAT slabs present in rows (or all defaults if empty) */
export function getOrderedSlabs(rows: RateGridRow[]): string[] {
  const fromData = [...new Set(rows.map((r) => r.rateSlab).filter(Boolean))];
  if (fromData.length === 0) return [...DEFAULT_RATE_SLABS];
  const ordered: string[] = [];
  for (const slab of DEFAULT_RATE_SLABS) {
    if (fromData.includes(slab)) ordered.push(slab);
  }
  for (const slab of fromData) {
    if (!ordered.includes(slab)) ordered.push(slab);
  }
  return ordered;
}

export function rowsForSlab(rows: RateGridRow[], slab: string): RateGridRow[] {
  return rows.filter((r) => r.rateSlab === slab);
}

export function uniqueRoomTypes(rows: RateGridRow[]): string[] {
  return [...new Set(rows.map((r) => r.roomType).filter(Boolean))];
}
