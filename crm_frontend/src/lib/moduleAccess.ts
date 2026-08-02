import { CRM_PATHS } from "@/navigation/crmPaths";

/** True if user has any of the listed permission strings (or is admin). */
export function hasAnyPermission(
  permissions: string[] | undefined,
  isAdmin: boolean | undefined,
  keys: string[]
): boolean {
  if (isAdmin) return true;
  if (!permissions?.length || !keys.length) return false;
  return keys.some((k) => permissions.includes(k));
}

/** Module view/manage from Profile (AccessControlService emits module.read / .manage). */
export function canAccessModule(
  module: string,
  permissions: string[] | undefined,
  isAdmin?: boolean
): boolean {
  if (isAdmin) return true;
  if (!permissions?.length) return false;
  return (
    permissions.includes(`${module}.read`) ||
    permissions.includes(`${module}.manage`) ||
    permissions.includes(`${module}.view`) ||
    permissions.includes(`${module}.access`)
  );
}

/** Setup tile / admin area access */
export function canAccessSetup(
  permissions: string[] | undefined,
  isAdmin?: boolean
): boolean {
  return hasAnyPermission(permissions, isAdmin, [
    "settings.manage",
    "users.manage",
    "roles.manage",
    "groups.manage",
    "workflows.manage",
    "templates.manage",
    "reports.manage",
  ]);
}

/**
 * Map CRM nav path → allowed if Profile grants the underlying module(s).
 * Aligns Profile `*.read` with sidebar / route guards.
 */
export function canAccessPath(
  path: string,
  permissions: string[] | undefined,
  isAdmin?: boolean
): boolean {
  if (isAdmin) return true;
  const perms = permissions || [];

  switch (path) {
    case CRM_PATHS.dashboard:
      return (
        canAccessModule("leads", perms, false) ||
        canAccessModule("accounts", perms, false) ||
        canAccessModule("tasks", perms, false) ||
        canAccessModule("reports", perms, false) ||
        canAccessModule("tickets", perms, false) ||
        hasAnyPermission(perms, false, ["callcenter.access"])
      );
    case CRM_PATHS.calls:
      return (
        hasAnyPermission(perms, false, ["callcenter.access"]) ||
        canAccessModule("communications", perms, false) ||
        canAccessModule("leads", perms, false)
      );
    case CRM_PATHS.leads:
      return (
        canAccessModule("leads", perms, false) ||
        hasAnyPermission(perms, false, [
          "leads.view.own",
          "leads.view.team",
          "leads.view.all",
          "leads.manage",
        ])
      );
    case CRM_PATHS.accounts:
    case CRM_PATHS.accountsDashboard:
      return (
        canAccessModule("accounts", perms, false) ||
        hasAnyPermission(perms, false, ["accounts.access", "accounts.manage"])
      );
    case CRM_PATHS.followUps:
      return (
        canAccessModule("tasks", perms, false) ||
        canAccessModule("accounts", perms, false) ||
        canAccessModule("leads", perms, false)
      );
    case CRM_PATHS.activities:
      return (
        canAccessModule("accounts", perms, false) ||
        canAccessModule("contacts", perms, false) ||
        hasAnyPermission(perms, false, [
          "accounts.manage_activities",
          "contacts.read_all",
          "contacts.read_own",
        ])
      );
    case CRM_PATHS.calendar:
    case CRM_PATHS.weekPlanner:
      return (
        canAccessModule("tasks", perms, false) ||
        canAccessModule("accounts", perms, false) ||
        canAccessModule("leads", perms, false)
      );
    case CRM_PATHS.reports:
      return (
        canAccessModule("reports", perms, false) ||
        hasAnyPermission(perms, false, ["reports.view", "reports.manage"])
      );
    case CRM_PATHS.buddy:
      return (
        canAccessModule("buddies", perms, false) ||
        hasAnyPermission(perms, false, [
          "buddies.assign",
          "buddies.view.history",
          "buddies.view.reports",
          "buddies.manage",
        ])
      );
    case CRM_PATHS.tickets:
      return (
        canAccessModule("tickets", perms, false) ||
        hasAnyPermission(perms, false, [
          "tickets.view.own",
          "tickets.view.team",
          "tickets.view.all",
          "tickets.manage",
        ])
      );
    case CRM_PATHS.knowledge:
      return canAccessModule("knowledge-base", perms, false);
    case CRM_PATHS.email:
    case CRM_PATHS.emailSettings:
    case CRM_PATHS.emailHealth:
      return canAccessModule("email", perms, false);
    case CRM_PATHS.notifications:
      return (
        canAccessModule("notifications", perms, false) ||
        // Allow notifications hub if user has any CRM access
        canAccessPath(CRM_PATHS.dashboard, perms, false)
      );
    case CRM_PATHS.settings:
    case CRM_PATHS.help:
      return canAccessSetup(perms, false) || isAdmin === true;
    default:
      if (path.startsWith("/setup") || path.startsWith("/security")) {
        return canAccessSetup(perms, false);
      }
      return false;
  }
}

/** Map ProfessionalCRM activeView ids to path-based checks */
export function canAccessView(
  view: string,
  permissions: string[] | undefined,
  isAdmin?: boolean
): boolean {
  if (isAdmin) return true;
  if (view === "lead-detail") return canAccessPath(CRM_PATHS.leads, permissions, false);
  if (view === "my-calendar") return canAccessPath(CRM_PATHS.calendar, permissions, false);
  if (view === "week-planner") return canAccessPath(CRM_PATHS.weekPlanner, permissions, false);
  if (view === "accounts-dashboard") {
    return canAccessPath(CRM_PATHS.accountsDashboard, permissions, false);
  }
  if (view.startsWith("setup/") || view.startsWith("security/")) {
    return canAccessSetup(permissions, false);
  }
  if (view === "settings" || view === "admin-api" || view === "admin-leads") {
    return canAccessSetup(permissions, false);
  }
  if (view === "help") return true;
  if (view === "notifications") {
    return canAccessPath(CRM_PATHS.notifications, permissions, false);
  }
  if (view === "email" || view === "email-settings" || view === "email-health") {
    return canAccessPath(CRM_PATHS.email, permissions, false);
  }
  if (view === "knowledge") return canAccessPath(CRM_PATHS.knowledge, permissions, false);
  if (view === "buddy") return canAccessPath(CRM_PATHS.buddy, permissions, false);
  if (view === "tickets" || view === "ticket-crm") {
    return canAccessPath(CRM_PATHS.tickets, permissions, false);
  }
  if (view === "reports") return canAccessPath(CRM_PATHS.reports, permissions, false);
  if (view === "follow-ups") return canAccessPath(CRM_PATHS.followUps, permissions, false);
  if (view === "activities") return canAccessPath(CRM_PATHS.activities, permissions, false);
  if (view === "calls" || view === "call-center") {
    return canAccessPath(CRM_PATHS.calls, permissions, false);
  }
  if (view === "leads") return canAccessPath(CRM_PATHS.leads, permissions, false);
  if (view === "accounts") return canAccessPath(CRM_PATHS.accounts, permissions, false);
  if (view === "dashboard") return canAccessPath(CRM_PATHS.dashboard, permissions, false);
  return canAccessSetup(permissions, false);
}

/** First allowed home path for a user with a restricted profile */
export function firstAllowedPath(
  permissions: string[] | undefined,
  isAdmin?: boolean
): string {
  const order = [
    CRM_PATHS.dashboard,
    CRM_PATHS.leads,
    CRM_PATHS.accounts,
    CRM_PATHS.calls,
    CRM_PATHS.followUps,
    CRM_PATHS.calendar,
    CRM_PATHS.activities,
    CRM_PATHS.tickets,
    CRM_PATHS.reports,
    CRM_PATHS.email,
    CRM_PATHS.knowledge,
    CRM_PATHS.settings,
  ];
  for (const p of order) {
    if (canAccessPath(p, permissions, isAdmin)) return p;
  }
  return CRM_PATHS.help;
}
