import { cn } from "@/lib/utils";

export const formGrid2 = "grid grid-cols-1 sm:grid-cols-2 gap-3";
export const formGrid3 = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3";
export const formGrid4 = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3";

export const pagePadding = "px-4 py-4 sm:px-6 sm:py-5 md:px-7 md:py-6";

export type ViewMode = "cards" | "table";

const VIEW_MODE_PREFIX = "crm.viewMode.";

export function getStoredViewMode(moduleId: string, fallback: ViewMode = "cards"): ViewMode {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(`${VIEW_MODE_PREFIX}${moduleId}`);
  return stored === "table" || stored === "cards" ? stored : fallback;
}

export function setStoredViewMode(moduleId: string, mode: ViewMode) {
  localStorage.setItem(`${VIEW_MODE_PREFIX}${moduleId}`, mode);
}

export function responsiveGridClass(cols: { default?: number; sm?: number; md?: number; lg?: number; xl?: number }) {
  const parts = ["grid gap-3"];
  if (cols.default) parts.push(`grid-cols-${cols.default}`);
  if (cols.sm) parts.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) parts.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) parts.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) parts.push(`xl:grid-cols-${cols.xl}`);
  return cn(...parts);
}
