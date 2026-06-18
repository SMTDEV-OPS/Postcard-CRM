import { responsiveGridClass } from "@/lib/responsive";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  cols?: { default?: number; sm?: number; md?: number; lg?: number; xl?: number };
  className?: string;
  children: React.ReactNode;
}

export function ResponsiveGrid({
  cols = { default: 1, sm: 2 },
  className,
  children,
}: ResponsiveGridProps) {
  return <div className={cn(responsiveGridClass(cols), className)}>{children}</div>;
}
