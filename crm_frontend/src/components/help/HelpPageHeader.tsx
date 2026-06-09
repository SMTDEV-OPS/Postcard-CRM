import { PageHeader } from "@/components/shared/PageHeader";
import { HelpInfoButton } from "./HelpInfoButton";

interface HelpPageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  helpId?: string;
  actions?: React.ReactNode;
}

export function HelpPageHeader({ title, subtitle, helpId, actions }: HelpPageHeaderProps) {
  const helpBtn = helpId ? <HelpInfoButton helpId={helpId} /> : null;
  const mergedActions = (
    <>
      {actions}
      {helpBtn}
    </>
  );

  return (
    <PageHeader
      title={title}
      subtitle={
        subtitle ? (
          <span className="inline-flex items-center gap-2">
            {subtitle}
          </span>
        ) : undefined
      }
      actions={helpId || actions ? mergedActions : undefined}
    />
  );
}
