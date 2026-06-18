import { ReactNode } from "react";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
  mobileTitle?: string;
}

export function FilterBar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
  className,
  mobileTitle = "Filters",
}: FilterBarProps) {
  const searchBlock = onSearchChange ? (
    <div className="relative min-w-0 flex-1 md:min-w-[200px] md:max-w-md">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-faint"
        strokeWidth={1.5}
      />
      <Input
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="h-10 border-border bg-bg pl-9 text-base sm:text-sm"
      />
    </div>
  ) : null;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex gap-2 md:hidden">
        {searchBlock}
        {children && (
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                {mobileTitle}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
              <SheetHeader>
                <SheetTitle>{mobileTitle}</SheetTitle>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-3">{children}</div>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <div
        className={cn(
          "hidden flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-3 md:flex"
        )}
      >
        {searchBlock}
        {children}
      </div>
    </div>
  );
}
