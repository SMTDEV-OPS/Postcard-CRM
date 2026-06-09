export type HelpAudience = "all" | "admin";

export interface HelpTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  audience?: HelpAudience;
  relatedIds?: string[];
  tags?: string[];
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
