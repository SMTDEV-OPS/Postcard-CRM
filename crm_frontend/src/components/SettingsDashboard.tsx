import {
  Shield,
  User,
  Users2,
  Share2,
  Settings,
  UserCog,
  Building2,
  Hotel,
  Blocks,
  GitBranch,
  Star,
  Zap,
  Shuffle,
  Clock,
  Workflow,
  MessageSquare,
  Mail,
  Plug,
  Code,
  FileText,
  FileCheck,
  Calendar,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { HelpPageHeader } from "@/components/help/HelpPageHeader";
import { HelpInfoButton } from "@/components/help/HelpInfoButton";
import { SETUP_PATH_TO_HELP_ID } from "@/help/helpContent";
import { useNavigate } from "react-router-dom";
import { viewToPath } from "@/navigation/crmPaths";

interface SettingsItem {
  name: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

interface SettingsCategory {
  title: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  items: SettingsItem[];
}

interface SettingsDashboardProps {
  onViewChange: (view: string) => void;
  isAdmin: boolean;
  permissions: string[];
  userRole: string;
}

function helpIdForPath(path: string): string | undefined {
  return SETUP_PATH_TO_HELP_ID[path] ?? SETUP_PATH_TO_HELP_ID[path.replace(/^\//, "")];
}

export function SettingsDashboard({
  onViewChange,
  isAdmin,
  permissions,
  userRole,
}: SettingsDashboardProps) {
  const navigate = useNavigate();
  const isAdminLike = isAdmin || userRole === "admin";
  const canManageUsers = isAdminLike || permissions.includes("users.manage");
  const canManageAccounts = isAdminLike || permissions.includes("accounts.manage");
  const canManageProperties = isAdminLike || permissions.includes("properties.manage");
  const canManageLeads =
    isAdminLike || permissions.includes("leads.manage") || permissions.includes("leads.view.all");
  const canManageWorkflows = isAdminLike || permissions.includes("workflows.manage");
  const canManageTemplates = isAdminLike || permissions.includes("templates.manage");

  const categories: SettingsCategory[] = [
    {
      title: "Security Control",
      icon: Shield,
      items: [
        { name: "Roles", description: "Define your company hierarchy.", path: "setup/roles", icon: Shield },
        { name: "Profiles", description: "Control what users can do.", path: "setup/profiles", icon: User },
        { name: "Groups", description: "Manage collaborative teams.", path: "setup/groups", icon: Users2 },
        {
          name: "Data Sharing",
          description: "Control data visibility across roles.",
          path: "setup/data-sharing",
          icon: Share2,
        },
      ].filter(() => canManageUsers),
    },
    {
      title: "General Administration",
      icon: Settings,
      items: [
        { name: "Users", description: "Create and manage CRM users.", path: "setup/users", icon: UserCog },
        { name: "Account Mgmt", description: "Manage B2B and agent accounts.", path: "setup/accounts", icon: Building2 },
        { name: "Property Mgmt", description: "Manage hotel properties.", path: "/properties", icon: Hotel },
        {
          name: "Field Builder",
          description: "Define custom fields for leads and contacts.",
          path: "setup/fields",
          icon: Blocks,
        },
        {
          name: "Pipeline Mgmt",
          description: "Configure sales pipelines and stages.",
          path: "setup/pipelines",
          icon: GitBranch,
        },
        {
          name: "Scoring Rules",
          description: "Automate lead quality scoring.",
          path: "setup/scoring",
          icon: Star,
        },
      ].filter((item) => {
        if (["setup/users", "setup/fields", "setup/pipelines", "setup/scoring"].includes(item.path))
          return isAdminLike;
        if (item.path === "setup/accounts") return canManageAccounts;
        if (item.path === "/properties") return canManageProperties;
        return true;
      }),
    },
    {
      title: "Automation",
      icon: Zap,
      items: [
        {
          name: "Assignment Rules",
          description: "Configure how leads are assigned to agents.",
          path: "setup/allocation",
          icon: Shuffle,
        },
        {
          name: "Follow-up Rules",
          description: "Auto-schedule follow-ups by lead quality.",
          path: "setup/followup-rules",
          icon: Clock,
        },
        {
          name: "Workflow Builder",
          description: "Automate lead actions with event-driven workflows.",
          path: "setup/workflows",
          icon: Workflow,
        },
        {
          name: "Contract Approval Rules",
          description: "Configure who approves contracts and in what order.",
          path: "setup/contract-approval-rules",
          icon: FileCheck,
        },
      ].filter(() => canManageLeads || canManageWorkflows || isAdminLike),
    },
    {
      title: "Accounts & Sales",
      icon: BarChart3,
      items: [
        {
          name: "Sales Targets",
          description: "Monthly org-wide targets for the accounts dashboard.",
          path: "setup/sales-targets",
          icon: BarChart3,
        },
        {
          name: "Holidays & Seasons",
          description: "Public holidays and peak seasons on the accounts calendar.",
          path: "setup/holidays",
          icon: Calendar,
        },
        {
          name: "FY & Sales Settings",
          description: "Financial year start and achievement metric.",
          path: "setup/sales-settings",
          icon: Settings,
        },
      ].filter(() => canManageLeads || isAdminLike),
    },
    {
      title: "Knowledge Base",
      icon: BookOpen,
      items: [
        {
          name: "Edit property guide",
          description: "Section-by-section editor for hotel guides, gallery, and sharing.",
          path: "setup/property-guide",
          icon: BookOpen,
        },
      ].filter(() => isAdminLike || permissions.includes("knowledge-base.manage")),
    },
    {
      title: "Channels & Communication",
      icon: MessageSquare,
      items: [
        {
          name: "Message Templates",
          description: "Email, SMS, and WhatsApp templates.",
          path: "setup/templates",
          icon: MessageSquare,
        },
        {
          name: "Email Provider",
          description: "SMTP and IMAP settings for outbound email.",
          path: "setup/email-provider",
          icon: Mail,
        },
        {
          name: "Call Quality",
          description: "Score call center agents on quality dimensions.",
          path: "setup/call-quality",
          icon: Star,
        },
      ].filter(() => canManageTemplates || isAdminLike),
    },
    {
      title: "Integrations",
      icon: Plug,
      items: [
        {
          name: "Integration Hub",
          description: "Connect external calendars and CRM sync.",
          path: "setup/integrations",
          icon: Plug,
        },
        {
          name: "API & Webhooks",
          description: "Configure webhooks and external APIs.",
          path: "setup/webhooks",
          icon: Code,
        },
        {
          name: "Audit Log",
          description: "Track all changes and actions in your CRM.",
          path: "setup/audit-log",
          icon: FileText,
        },
      ].filter(() => isAdminLike || canManageUsers),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <HelpPageHeader
        helpId="settings.overview"
        title="Setup"
        subtitle="Manage your CRM settings, automations, and more."
      />
      <div
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        style={{ gap: 24 }}
      >
        {categories.map((cat) => {
          if (cat.items.length === 0) return null;
          const SectionIcon = cat.icon;
          return (
            <div
              key={cat.title}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <SectionIcon size={18} style={{ color: "var(--primary)" }} />
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--text)",
                  }}
                >
                  {cat.title}
                </span>
              </div>
              <div>
                {cat.items.map((item, idx) => {
                  const ItemIcon = item.icon;
                  const isLast = idx === cat.items.length - 1;
                  const helpId = helpIdForPath(item.path);
                  return (
                    <div
                      key={item.path}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (item.path.startsWith("/")) navigate(item.path);
                        else navigate(viewToPath(item.path));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (item.path.startsWith("/")) navigate(item.path);
                          else navigate(viewToPath(item.path));
                        }
                      }}
                      style={{
                        width: "100%",
                        minHeight: 44,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        borderBottom: isLast ? "none" : "1px solid var(--border-light)",
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        padding: "4px 0",
                      }}
                      className="hover:bg-[var(--hover)] group/row"
                    >
                      <ItemIcon size={14} className="shrink-0" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.description}</div>
                      </div>
                      {helpId && (
                        <HelpInfoButton
                          helpId={helpId}
                          className="shrink-0 opacity-70 group-hover/row:opacity-100"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
