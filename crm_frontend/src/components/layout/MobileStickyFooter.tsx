import { cn } from "@/lib/utils";

interface MobileStickyFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileStickyFooter({ children, className }: MobileStickyFooterProps) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-4 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{children}</div>
    </div>
  );
}
