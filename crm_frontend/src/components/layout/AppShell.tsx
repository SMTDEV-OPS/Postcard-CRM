import { ReactNode } from "react";
import { TopBar } from "./TopBar";

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
  topBar?: ReactNode;
  onOpenCommandPalette?: () => void;
  onQuickCreateLead?: () => void;
  onQuickCreateAccount?: () => void;
}

export function AppShell({
  sidebar,
  children,
  topBar,
  onOpenCommandPalette,
  onQuickCreateLead,
  onQuickCreateAccount,
}: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {topBar ?? (
          <TopBar
            onOpenCommandPalette={onOpenCommandPalette}
            onQuickCreateLead={onQuickCreateLead}
            onQuickCreateAccount={onQuickCreateAccount}
          />
        )}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-[1440px] px-4 py-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-5 md:px-7 md:py-6 animate-panel-enter">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
