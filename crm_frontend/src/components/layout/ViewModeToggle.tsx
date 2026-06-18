import { LayoutGrid, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/lib/responsive";

interface ViewModeToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  return (
    <div className={cn("inline-flex rounded-md border border-border p-0.5", className)}>
      <Button
        type="button"
        variant={value === "cards" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-2.5"
        onClick={() => onChange("cards")}
        aria-label="Card view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant={value === "table" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-2.5"
        onClick={() => onChange("table")}
        aria-label="Table view"
      >
        <Table2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
