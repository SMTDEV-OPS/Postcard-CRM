import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  getStoredViewMode,
  setStoredViewMode,
  type ViewMode,
} from "@/lib/responsive";

export function useViewMode(moduleId: string) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    getStoredViewMode(moduleId, isMobile ? "cards" : "table")
  );

  useEffect(() => {
    setViewMode(getStoredViewMode(moduleId, isMobile ? "cards" : "table"));
  }, [moduleId, isMobile]);

  const setMode = (mode: ViewMode) => {
    setViewMode(mode);
    setStoredViewMode(moduleId, mode);
  };

  const showCards = viewMode === "cards";

  return { viewMode, setViewMode: setMode, showCards, isMobile };
}
