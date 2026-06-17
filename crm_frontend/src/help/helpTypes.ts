export type HelpAudience = "all" | "admin";

export interface HelpFieldGuide {
  id: string;
  label: string;
  what: string;
  how: string;
  required?: boolean;
  example?: string;
  tips?: string;
  topicId?: string;
}

export interface HelpScreenGuide {
  id: string;
  title: string;
  what: string;
  how: string;
  fields: HelpFieldGuide[];
}

export interface HelpTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  audience?: HelpAudience;
  relatedIds?: string[];
  tags?: string[];
  featureWhat?: string;
  featureHow?: string;
  screens?: HelpScreenGuide[];
}

export interface HelpFieldSearchResult {
  field: HelpFieldGuide;
  topicId: string;
  topicTitle: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  topicIds: string[];
}

export const HELP_CATEGORIES: Array<{ id: string; label: string }> = [
  { id: "getting-started", label: "Getting started" },
  { id: "dashboard", label: "Dashboard" },
  { id: "leads", label: "Leads" },
  { id: "accounts", label: "Accounts" },
  { id: "followups", label: "Follow-ups & calendar" },
  { id: "calls", label: "Calls" },
  { id: "tickets", label: "Tickets" },
  { id: "knowledge", label: "Knowledge Base" },
  { id: "email", label: "Email" },
  { id: "buddy", label: "Buddy" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings & setup" },
  { id: "security", label: "Security" },
  { id: "support", label: "Support" },
];

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "call-center",
    title: "Call Center Agent",
    description: "Handle calls, create leads, and schedule follow-ups.",
    topicIds: ["getting-started.overview", "calls.center", "leads.add", "leads.list", "leads.detail", "followups.today", "knowledge.hub"],
  },
  {
    id: "sales",
    title: "Sales & Reservations",
    description: "Manage leads, quotations, and guest stays end to end.",
    topicIds: ["dashboard.main", "leads.list", "leads.add", "leads.detail", "followups.today", "followups.calendar", "knowledge.hub", "reports.main"],
  },
  {
    id: "account-manager",
    title: "Account Manager",
    description: "B2B accounts, contacts, contracts, and field sales.",
    topicIds: ["accounts.list", "accounts.wizard", "accounts.dashboard", "leads.field-sales", "contacts.wizard", "contracts.wizard"],
  },
  {
    id: "admin",
    title: "System Admin",
    description: "Security, automation, setup, and integrations.",
    topicIds: ["getting-started.permissions", "settings.overview", "setup.users", "setup.fields", "setup.pipelines", "setup.allocation", "setup.workflows", "setup.integrations"],
  },
];
