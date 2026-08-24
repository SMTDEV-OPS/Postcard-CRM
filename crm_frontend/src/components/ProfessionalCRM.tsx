import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/notifications";
import { getTaskSummary } from "@/services/tasks";
import { getAccountFollowUpSummary } from "@/services/accounts";
import { AppShell, Sidebar, CommandPalette, SetupLayout } from "@/components/layout";
import { MobileNavProvider } from "@/components/layout/MobileNavContext";
import { pathnameToView, viewToPath, CRM_PATHS } from "@/navigation/crmPaths";
import { canAccessView, firstAllowedPath } from "@/lib/moduleAccess";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import FollowUpReminder from "@/components/FollowUpReminder";

const CallCenterScreen = lazy(() =>
  import("@/components/CallCenterScreen").then((m) => ({ default: m.CallCenterScreen }))
);
const ProfessionalLeadManagement = lazy(() => import("@/components/ProfessionalLeadManagement"));
const ProfessionalTicketManagement = lazy(() =>
  import("@/components/ProfessionalTicketManagement").then((m) => ({
    default: m.ProfessionalTicketManagement,
  }))
);
const KnowledgeBaseMain = lazy(() =>
  import("@/components/knowledge/KnowledgeBaseMain").then((m) => ({ default: m.KnowledgeBaseMain }))
);
const Dashboard = lazy(() => import("@/components/Dashboard"));
const SalesExecutiveDashboard = lazy(() => import("@/components/SalesExecutiveDashboard"));
const Reports = lazy(() => import("@/components/Reports"));
const HandoverPage = lazy(() => import("@/components/HandoverPage"));
const BudgetPage = lazy(() => import("@/components/BudgetPage"));
const UserRoleManagement = lazy(() =>
  import("@/pages/admin/UserManagement").then((m) => ({ default: m.UserManagement }))
);
const RolesManager = lazy(() =>
  import("./settings/security/RolesManager").then((m) => ({ default: m.RolesManager }))
);
const ProfilesManager = lazy(() =>
  import("./settings/security/ProfilesManager").then((m) => ({ default: m.ProfilesManager }))
);
const GroupsManager = lazy(() =>
  import("./settings/security/GroupsManager").then((m) => ({ default: m.GroupsManager }))
);
const DataSharingManager = lazy(() =>
  import("./settings/security/DataSharingManager").then((m) => ({ default: m.DataSharingManager }))
);
const AccountManagement = lazy(() =>
  import("@/components/AccountManagement").then((m) => ({ default: m.AccountManagement }))
);
const AccountsDashboard = lazy(() =>
  import("@/components/accounts/AccountsDashboard").then((m) => ({ default: m.AccountsDashboard }))
);
const SalesTargetsSetup = lazy(() =>
  import("@/pages/setup/SalesTargetsSetup").then((m) => ({ default: m.SalesTargetsSetup }))
);
const HolidaysSetup = lazy(() =>
  import("@/pages/setup/HolidaysSetup").then((m) => ({ default: m.HolidaysSetup }))
);
const HotelsSetup = lazy(() =>
  import("@/pages/setup/HotelsSetup").then((m) => ({ default: m.HotelsSetup }))
);
const SalesSettingsSetup = lazy(() =>
  import("@/pages/setup/SalesSettingsSetup").then((m) => ({ default: m.SalesSettingsSetup }))
);
const PropertyGuideEditorSetup = lazy(() =>
  import("@/pages/setup/PropertyGuideEditorSetup").then((m) => ({
    default: m.PropertyGuideEditorSetup,
  }))
);
const HelpCenter = lazy(() => import("@/pages/HelpCenter"));
const AdminApiConsole = lazy(() =>
  import("@/components/AdminApiConsole").then((m) => ({ default: m.AdminApiConsole }))
);
const AdminLeads = lazy(() =>
  import("@/components/AdminLeads").then((m) => ({ default: m.AdminLeads }))
);
const WorkflowManagement = lazy(() =>
  import("@/components/WorkflowManagement").then((m) => ({ default: m.WorkflowManagement }))
);
const MessageTemplates = lazy(() =>
  import("@/components/MessageTemplates").then((m) => ({ default: m.MessageTemplates }))
);
const EmailSettings = lazy(() =>
  import("@/components/EmailSettings").then((m) => ({ default: m.EmailSettings }))
);
const EmailHealthDashboard = lazy(() =>
  import("@/components/EmailHealthDashboard").then((m) => ({ default: m.EmailHealthDashboard }))
);
const EmailClient = lazy(() =>
  import("@/components/EmailClient").then((m) => ({ default: m.EmailClient }))
);
const EmailProviderSettings = lazy(() =>
  import("@/components/EmailProviderSettings").then((m) => ({ default: m.EmailProviderSettings }))
);
const TodaysFollowUps = lazy(() =>
  import("@/components/TodaysFollowUps").then((m) => ({ default: m.TodaysFollowUps }))
);
const UserActivities = lazy(() =>
  import("@/components/UserActivities").then((m) => ({ default: m.UserActivities }))
);
const PersonalCalendar = lazy(() =>
  import("@/components/PersonalCalendar").then((m) => ({ default: m.PersonalCalendar }))
);
const WeekPlanner = lazy(() =>
  import("@/components/WeekPlanner").then((m) => ({ default: m.WeekPlanner }))
);
const LeadDetailPage = lazy(() =>
  import("@/components/LeadDetailPage").then((m) => ({ default: m.LeadDetailPage }))
);
const NotificationsPage = lazy(() => import("@/components/NotificationsPage"));
const BuddyManagement = lazy(() =>
  import("@/components/BuddyManagement").then((m) => ({ default: m.BuddyManagement }))
);
const TicketManagement = lazy(() =>
  import("@/components/TicketManagement").then((m) => ({ default: m.TicketManagement }))
);
const IntegrationSettings = lazy(() =>
  import("@/components/IntegrationSettings").then((m) => ({ default: m.IntegrationSettings }))
);
const SettingsDashboard = lazy(() =>
  import("@/components/SettingsDashboard").then((m) => ({ default: m.SettingsDashboard }))
);
const PipelineManagement = lazy(() =>
  import("@/components/PipelineManagement").then((m) => ({ default: m.PipelineManagement }))
);
const ModuleBuilder = lazy(() =>
  import("@/pages/settings/ModuleBuilder").then((m) => ({ default: m.ModuleBuilder }))
);
const ScoringRuleManagement = lazy(() =>
  import("@/components/ScoringRuleManagement").then((m) => ({ default: m.ScoringRuleManagement }))
);
const FieldBuilder = lazy(() =>
  import("@/pages/setup/FieldBuilder").then((m) => ({ default: m.FieldBuilder }))
);
const PipelineBuilder = lazy(() =>
  import("@/pages/setup/PipelineBuilder").then((m) => ({ default: m.PipelineBuilder }))
);
const ScoringEngine = lazy(() =>
  import("@/pages/setup/ScoringEngine").then((m) => ({ default: m.ScoringEngine }))
);
const FollowupRules = lazy(() =>
  import("@/pages/setup/FollowupRules").then((m) => ({ default: m.FollowupRules }))
);
const WorkflowBuilder = lazy(() =>
  import("@/pages/setup/WorkflowBuilder").then((m) => ({ default: m.WorkflowBuilder }))
);
const LeadAllocationPage = lazy(() =>
  import("@/pages/setup/LeadAllocationPage").then((m) => ({ default: m.LeadAllocationPage }))
);
const IntegrationHub = lazy(() =>
  import("@/pages/setup/IntegrationHub").then((m) => ({ default: m.IntegrationHub }))
);
const AuditLog = lazy(() =>
  import("@/pages/setup/AuditLog").then((m) => ({ default: m.AuditLog }))
);
const ContractApprovalRules = lazy(() =>
  import("@/pages/setup/ContractApprovalRules").then((m) => ({ default: m.ContractApprovalRules }))
);

interface ProfessionalCRMProps {
  userRole: string;
  userName: string;
  onLogout: () => void;
  isAdmin?: boolean;
  permissions?: string[];
  backendUserId?: string;
}

const viewFallback = (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
    Loading...
  </div>
);

export const ProfessionalCRM = ({
  userRole,
  userName,
  onLogout,
  isAdmin,
  permissions,
  backendUserId,
}: ProfessionalCRMProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { view: activeView, leadId: selectedLeadId } = pathnameToView(location.pathname);
  const previousView =
    (location.state as { from?: string } | null)?.from ?? "admin-leads";
  const [commandOpen, setCommandOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const setActiveView = useCallback(
    (view: string) => {
      navigate(viewToPath(view, selectedLeadId ?? undefined));
    },
    [navigate, selectedLeadId]
  );

  const navigateToLead = useCallback(
    (leadId: string, fromView: string) => {
      if (!leadId) return;
      navigate(viewToPath("lead-detail", leadId), { state: { from: fromView } });
    },
    [navigate]
  );
  const { data: taskSummary } = useQuery({
    queryKey: ["task-summary"],
    queryFn: getTaskSummary,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const { data: accountFollowUpSummary } = useQuery({
    queryKey: ["accounts-followup-badge"],
    queryFn: getAccountFollowUpSummary,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const followupsBadgeCount =
    (taskSummary?.overdue ?? 0) +
    (taskSummary?.dueToday ?? 0) +
    (accountFollowUpSummary?.overdue ?? 0) +
    (accountFollowUpSummary?.dueToday ?? 0);
  const hasOverdueFollowups =
    (taskSummary?.overdue ?? 0) + (accountFollowUpSummary?.overdue ?? 0) > 0;

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch {
        setUnreadCount(0);
      }
    };
    void loadUnreadCount();
    const interval = setInterval(() => void loadUnreadCount(), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleNavigateAccount = () => {
      navigate(CRM_PATHS.accounts);
    };
    window.addEventListener("crm:navigate-account", handleNavigateAccount);
    return () => window.removeEventListener("crm:navigate-account", handleNavigateAccount);
  }, [navigate]);

  useEffect(() => {
    // Only enforce when Profile permissions were loaded (non-empty).
    if (!permissions?.length) return;
    if (isAdmin) return;
    if (canAccessView(activeView, permissions, isAdmin)) return;
    navigate(firstAllowedPath(permissions, isAdmin), { replace: true });
    toast({
      title: "You do not have access to that module",
      variant: "destructive",
    });
  }, [permissions, isAdmin, activeView, navigate, toast]);

  const canManageUsers = !!isAdmin || permissions?.includes("users.manage");
  const canManageAccounts =
    !!isAdmin ||
    permissions?.includes("accounts.read") ||
    permissions?.includes("accounts.manage");
  const canViewReports =
    !!isAdmin ||
    permissions?.includes("reports.view") ||
    permissions?.includes("reports.read");
  const canManageLeads =
    !!isAdmin ||
    permissions?.includes("leads.manage") ||
    permissions?.includes("leads.view.all");
  const canManageWorkflows = !!isAdmin || permissions?.includes("workflows.manage");
  const canManageTemplates = !!isAdmin || permissions?.includes("templates.manage");
  const canAssignBuddy = !!isAdmin || permissions?.includes("buddies.assign");
  const canViewBuddyHistory = !!isAdmin || permissions?.includes("buddies.view.history");
  const canViewBuddyReports = !!isAdmin || permissions?.includes("buddies.view.reports");
  const canAccessBuddy =
    canAssignBuddy ||
    canViewBuddyHistory ||
    canViewBuddyReports ||
    !!permissions?.includes("buddies.read") ||
    !!permissions?.includes("buddies.manage");
  const openSharedAddLeadForm = () => {
    sessionStorage.setItem("crm:pending-add-lead", "1");
    navigate(CRM_PATHS.leads);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("crm:open-add-lead"));
    }, 150);
  };

  const openSharedAddAccountForm = () => {
    sessionStorage.setItem("crm:pending-add-account", "1");
    navigate(CRM_PATHS.accounts);
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent("crm:open-add-account"));
    }, 150);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        // Use the new unified Dashboard component for all users
        return (
          <Dashboard
            onViewLead={(leadId) => navigateToLead(leadId, "dashboard")}
            onViewAllLeads={() => navigate(CRM_PATHS.leads)}
            onViewAccount={(accountId) => navigate(CRM_PATHS.accounts, { state: { accountId } })}
            onNavigateFollowUps={() => navigate(CRM_PATHS.followUps)}
            onNavigateAccounts={() => navigate(CRM_PATHS.accounts)}
            onNavigateCalls={() => navigate(CRM_PATHS.calls)}
          />
        );
      case 'calls':
        return (
          <CallCenterScreen
            agentName={userName}
          />
        );
      case 'leads':
        return (
          <ProfessionalLeadManagement
            userRole={userRole}
            userName={userName}
            backendUserId={backendUserId}
            permissions={permissions}
          />
        );
      case 'followups':
        return <SalesExecutiveDashboard userName={userName} defaultTab="follow-ups" />;
      case 'todays-followups':
        return (
          <TodaysFollowUps
            userName={userName}
            backendUserId={backendUserId}
            onViewLead={(leadId) => leadId && navigateToLead(leadId, "todays-followups")}
            onViewAccount={(accountId) =>
              navigate(CRM_PATHS.accounts, { state: { accountId } })
            }
          />
        );
      case "activities":
        return (
          <UserActivities
            onViewAccount={(accountId) =>
              navigate(CRM_PATHS.accounts, { state: { accountId } })
            }
            onViewLead={(leadId) => navigateToLead(leadId, "activities")}
          />
        );
      case 'my-calendar':
        return (
          <PersonalCalendar
            userName={userName}
            backendUserId={backendUserId}
            isAdmin={isAdmin}
            permissions={permissions}
            onViewLead={(leadId) => leadId && navigateToLead(leadId, "my-calendar")}
            onViewAccount={(accountId) =>
              navigate(CRM_PATHS.accounts, { state: { accountId } })
            }
          />
        );
      case "week-planner":
        return <WeekPlanner />;
      case 'tickets':
        return <ProfessionalTicketManagement userRole={userRole} agentName={userName} />;
      case 'ticket-management': {
        // Ticket CRM – available to any backend user with ticket view/control permissions.
        const canManageTickets =
          !!isAdmin ||
          permissions?.includes("tickets.manage") ||
          permissions?.includes("tickets.view.all");
        const canViewTickets =
          canManageTickets ||
          permissions?.includes("tickets.view.own") ||
          permissions?.includes("tickets.view.team");
        if (!canViewTickets) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to access the Ticket Management module.
            </div>
          );
        }
        return <TicketManagement permissions={permissions} isAdmin={isAdmin} />;
      }
      case 'reports':
        // Show comprehensive reports dashboard only when the user has reporting permission
        if (canViewReports || userRole === 'management' || userRole === 'admin') {
          return <Reports userName={userName} />;
        }
        return (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            You do not have permission to view reports.
          </div>
        );
      case 'handover':
        if (
          isAdmin ||
          permissions?.includes("leads.manage") ||
          permissions?.includes("accounts.assign_managers") ||
          permissions?.includes("accounts.manage") ||
          permissions?.includes("users.manage")
        ) {
          return <HandoverPage />;
        }
        return (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            You do not have permission to manage handover.
          </div>
        );
      case 'budget':
        if (
          canViewReports ||
          userRole === "management" ||
          userRole === "admin" ||
          userRole === "saleshead" ||
          permissions?.includes("leads.manage")
        ) {
          return <BudgetPage isAdmin={!!isAdmin} />;
        }
        return (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            You do not have permission to view budget.
          </div>
        );
      case 'knowledge':
      case 'knowledge-properties':
      case 'knowledge-factsheets':
      case 'knowledge-templates':
      case 'knowledge-resources':
        return (
          <KnowledgeBaseMain
            isAdmin={!!isAdmin}
            permissions={permissions || []}
          />
        );
      case "help":
        return <HelpCenter isAdmin={!!isAdmin} />;
      case 'settings':
        return (
          <SettingsDashboard
            onViewChange={(view) => navigate(viewToPath(view))}
            isAdmin={!!isAdmin}
            permissions={permissions || []}
            userRole={userRole}
          />
        );
      case 'security/roles':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage roles.
            </div>
          );
        }
        return <RolesManager />;
      case 'user-management':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage users.
            </div>
          );
        }
        return <UserRoleManagement />;
      case 'security/profiles':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage profiles.
            </div>
          );
        }
        return <ProfilesManager />;
      case 'security/groups':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage groups.
            </div>
          );
        }
        return <GroupsManager />;
      case 'security/data-sharing':
      case 'setup/data-sharing':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage data sharing.
            </div>
          );
        }
        return <DataSharingManager />;
      case 'setup/roles':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage roles.
            </div>
          );
        }
        return <RolesManager />;
      case 'setup/profiles':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage profiles.
            </div>
          );
        }
        return <ProfilesManager />;
      case 'setup/groups':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage groups.
            </div>
          );
        }
        return <GroupsManager />;
      case 'setup/users':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage users.
            </div>
          );
        }
        return <UserRoleManagement />;
      case 'setup/accounts':
        if (!canManageAccounts) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage accounts.
            </div>
          );
        }
        return (
          <AccountManagement
            isAdmin={isAdmin}
            isSystemAdmin={isAdmin}
            permissions={permissions}
          />
        );
      case 'setup/fields':
        if (!isAdmin) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage fields.
            </div>
          );
        }
        return <FieldBuilder />;
      case 'setup/pipelines':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage pipelines.
            </div>
          );
        }
        return <PipelineBuilder />;
      case 'setup/scoring':
      case 'setup/call-quality':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage scoring.
            </div>
          );
        }
        return <ScoringEngine />;
      case 'setup/allocation':
        if (!canManageLeads && !isAdmin) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage allocation.
            </div>
          );
        }
        return <LeadAllocationPage />;
      case 'setup/contract-approval-rules':
        if (!canManageAccounts && !isAdmin) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage contract approval rules.
            </div>
          );
        }
        return <ContractApprovalRules />;
      case 'setup/followup-rules':
        if (!canManageLeads && !canManageWorkflows) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage follow-up rules.
            </div>
          );
        }
        return <FollowupRules />;
      case 'setup/workflows':
        if (!canManageWorkflows) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage workflows.
            </div>
          );
        }
        return <WorkflowBuilder />;
      case 'setup/templates':
        if (!canManageTemplates) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage templates.
            </div>
          );
        }
        return <MessageTemplates />;
      case 'setup/email-provider':
        if (!canManageLeads) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage email provider.
            </div>
          );
        }
        return <EmailProviderSettings />;
      case 'setup/integrations':
        if (!isAdmin && !canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage integrations.
            </div>
          );
        }
        return <IntegrationHub />;
      case 'setup/webhooks':
        return <IntegrationSettings />;
      case 'setup/audit-log':
        if (!isAdmin && !canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to view audit log.
            </div>
          );
        }
        return <AuditLog />;
      case 'accounts-dashboard':
        if (!canManageAccounts) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to view the accounts dashboard.
            </div>
          );
        }
        return <AccountsDashboard />;
      case 'account-management':
        if (!canManageAccounts) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage accounts.
            </div>
          );
        }
        return (
          <AccountManagement
            isAdmin={isAdmin}
            isSystemAdmin={isAdmin}
            permissions={permissions}
          />
        );
      case 'setup/sales-targets':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage sales targets.
            </div>
          );
        }
        return <SalesTargetsSetup />;
      case 'setup/holidays':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage holidays.
            </div>
          );
        }
        return <HolidaysSetup />;
      case 'setup/hotels':
        if (!isAdmin && !permissions?.includes("properties.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage hotels.
            </div>
          );
        }
        return <HotelsSetup />;
      case 'setup/sales-settings':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage sales settings.
            </div>
          );
        }
        return <SalesSettingsSetup />;
      case 'setup/knowledge-import':
      case 'setup/property-guide':
        if (
          !isAdmin &&
          !permissions?.includes("knowledge-base.manage") &&
          !permissions?.includes("knowledgebase.manage")
        ) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to edit property guides.
            </div>
          );
        }
        return <PropertyGuideEditorSetup />;
      case 'admin-console':
        if (!canManageUsers) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to access the admin console.
            </div>
          );
        }
        return <AdminApiConsole />;
      case 'integration-settings':
        return <IntegrationSettings />;
      case 'pipeline-management':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage pipelines.
            </div>
          );
        }
        return <PipelineManagement />;
      case 'module-builder':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage modules.
            </div>
          );
        }
        return <ModuleBuilder />;
      case 'scoring-rules':
        if (!isAdmin && !permissions?.includes("leads.manage")) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage scoring rules.
            </div>
          );
        }
        return <ScoringRuleManagement />;
      case 'admin-leads':
        // Lead CRM – available to any backend user with lead view/control permissions.
        if (
          !(
            canManageLeads ||
            permissions?.includes("leads.view.own") ||
            permissions?.includes("leads.view.team")
          )
        ) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to access the Lead CRM module.
            </div>
          );
        }
        return (
          <AdminLeads
            canManageUsers={canManageUsers}
            permissions={permissions}
            isAdmin={!!isAdmin}
            onViewLead={(leadId) => navigateToLead(leadId, "admin-leads")}
          />
        );
      case 'lead-detail':
        if (!selectedLeadId) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No lead selected. Please go back and select a lead.
            </div>
          );
        }
        return (
          <LeadDetailPage
            leadId={selectedLeadId}
            onBack={() => navigate(viewToPath(previousView))}
            permissions={permissions}
            isAdmin={!!isAdmin}
          />
        );
      case 'assignment-rules':
        if (!canManageLeads) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage assignment rules.
            </div>
          );
        }
        return <LeadAllocationPage />;
      case 'workflow-management':
        if (!canManageWorkflows) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage workflows.
            </div>
          );
        }
        return <WorkflowManagement />;
      case 'message-templates':
        if (!canManageTemplates) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage message templates.
            </div>
          );
        }
        return <MessageTemplates />;
      case 'email-settings':
        return <EmailSettings />;
      case 'email-health':
        return <EmailHealthDashboard />;
      case 'email-provider-settings':
        if (!canManageLeads) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to manage email provider settings.
            </div>
          );
        }
        return <EmailProviderSettings />;
      case 'buddy-management':
        if (!canAccessBuddy) {
          return (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              You do not have permission to access buddy management.
            </div>
          );
        }
        return <BuddyManagement
          canAssignBuddy={canAssignBuddy}
          canViewHistory={canViewBuddyHistory}
          canViewReports={canViewBuddyReports}
          backendUserId={backendUserId}
        />;
      case 'email-client':
        return <EmailClient />;
      case 'notifications':
        return (
          <NotificationsPage
            onViewLead={(leadId) => navigateToLead(leadId, "notifications")}
          />
        );
      default:
        return (
          <Dashboard
            onViewLead={(leadId) => navigateToLead(leadId, "dashboard")}
            onViewAllLeads={() => navigate(CRM_PATHS.leads)}
            onViewAccount={(accountId) => navigate(CRM_PATHS.accounts, { state: { accountId } })}
            onNavigateFollowUps={() => navigate(CRM_PATHS.followUps)}
            onNavigateAccounts={() => navigate(CRM_PATHS.accounts)}
            onNavigateCalls={() => navigate(CRM_PATHS.calls)}
          />
        );
    }
  };

  const isSettingsView = [
    'security/roles', 'security/profiles', 'security/groups', 'security/data-sharing',
    'user-management',
    'assignment-rules', 'workflow-management', 'message-templates',
    'email-provider-settings', 'integration-settings', 'pipeline-management', 'module-builder', 'scoring-rules',
    'setup/roles', 'setup/profiles', 'setup/groups', 'setup/data-sharing',
    'setup/users', 'setup/accounts', 'setup/fields', 'setup/pipelines',
    'setup/scoring', 'setup/allocation', 'setup/contract-approval-rules', 'setup/followup-rules', 'setup/workflows',
    'setup/templates', 'setup/email-provider', 'setup/call-quality', 'setup/integrations',
    'setup/webhooks', 'setup/audit-log',
    'setup/sales-targets', 'setup/holidays', 'setup/hotels', 'setup/sales-settings', 'setup/knowledge-import', 'setup/property-guide',
  ].includes(activeView);

  const isSetupRoute = activeView.startsWith("setup/");

  return (
    <>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
      <MobileNavProvider>
      <AppShell
        onOpenCommandPalette={() => setCommandOpen(true)}
        onQuickCreateLead={openSharedAddLeadForm}
        onQuickCreateAccount={openSharedAddAccountForm}
        sidebar={
          <Sidebar
            userName={userName}
            userRole={userRole}
            roleDisplay={userRole === "callcenter" ? "Call Center" : userRole}
            onLogout={onLogout}
            unreadCount={unreadCount}
            isAdmin={!!isAdmin}
            permissions={permissions || []}
            followupsBadgeCount={followupsBadgeCount}
            hasOverdueFollowups={hasOverdueFollowups}
          />
        }
      >
        <div className="mb-4 flex justify-end">
          <FollowUpReminder
            onNavigateToFollowUps={() => navigate(CRM_PATHS.followUps)}
            onViewLead={(leadId) => leadId && navigateToLead(leadId, activeView)}
          />
        </div>
        {isSettingsView && !isSetupRoute && (
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(CRM_PATHS.settings)}
              className="text-text-muted hover:text-text"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Settings
            </Button>
          </div>
        )}
        {isSetupRoute ? (
          <SetupLayout>
            <Suspense fallback={viewFallback}>{renderContent()}</Suspense>
          </SetupLayout>
        ) : (
          <Suspense fallback={viewFallback}>{renderContent()}</Suspense>
        )}
      </AppShell>
      </MobileNavProvider>
    </>
  );
};
