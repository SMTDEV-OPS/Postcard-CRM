import type { HelpTopic } from "./helpTypes";

function topic(t: HelpTopic): HelpTopic {
  return t;
}

export const HELP_TOPICS: HelpTopic[] = [
  topic({
    id: "getting-started.overview",
    category: "getting-started",
    title: "Using Postcard CRM",
    summary:
      "Navigate from the sidebar, use the command palette (⌘K), and open Training & Help anytime for guides on every module.",
    body: `Postcard CRM helps hospitality sales and reservations teams manage leads, accounts, follow-ups, and property knowledge in one place.

**Navigation**
1. Use the left sidebar for Dashboard, Leads, Accounts, Follow-ups, Knowledge, Email, and Setup (admins).
2. Press ⌘K (Mac) or Ctrl+K (Windows) to open the command palette and jump to any screen.
3. Click **Training & Help** in the sidebar for the full guide library.

**Your access**
What you see depends on your role and profile permissions. If a menu item is missing, ask your admin to update your profile.

**Related:** Notifications, Permissions overview`,
    tags: ["navigation", "intro", "training"],
    relatedIds: ["getting-started.permissions", "getting-started.notifications"],
  }),
  topic({
    id: "getting-started.permissions",
    category: "getting-started",
    title: "Roles & permissions",
    summary:
      "Admins assign roles and profiles that control which screens and actions you can use.",
    audience: "admin",
    body: `Access is controlled by **Roles**, **Profiles**, and **Groups** (Setup → Security Control).

1. **Roles** — organizational hierarchy (e.g. Sales Executive, Manager).
2. **Profiles** — feature permissions (leads.manage, accounts.manage, knowledge-base.manage, etc.).
3. **Data sharing** — whether users see only their records, team records, or all records.

Users need both a role assignment and the right profile permissions. Use Setup → Users to assign roles.`,
    tags: ["permissions", "roles", "profiles", "admin"],
    relatedIds: ["setup.roles", "setup.profiles", "setup.data-sharing"],
  }),
  topic({
    id: "getting-started.notifications",
    category: "getting-started",
    title: "Notifications",
    summary: "Bell icon shows system alerts, follow-up reminders, and important events.",
    body: `Click the bell in the sidebar header to open Notifications.

You receive alerts for follow-up due dates, assignments, and system messages. Unread count appears as a badge on the bell icon.`,
    tags: ["notifications", "alerts"],
    relatedIds: ["followups.today"],
  }),
  topic({
    id: "dashboard.main",
    category: "dashboard",
    title: "Dashboard",
    summary:
      "View lead overview, statistics, hot leads, and recent activity. Filter by your leads, team, or all leads.",
    body: `The Dashboard is your home screen for daily priorities.

**What you see**
- Lead counts by heat (Hot / Warm / Cold) and pipeline stage
- Recent activity and pending actions
- Quick filters for My leads, Team, or All (based on permissions)

**Typical workflow**
1. Open Dashboard at start of day.
2. Review hot leads and overdue follow-ups.
3. Click through to Leads or Follow-ups for action.`,
    tags: ["dashboard", "kpi", "overview"],
    relatedIds: ["leads.list", "followups.today"],
  }),
  topic({
    id: "leads.list",
    category: "leads",
    title: "Leads",
    summary:
      "Manage all leads: view, create, edit, assign, and track status, heat levels, and follow-ups.",
    body: `The Leads screen is the main workspace for guest inquiries and sales opportunities.

**Workflow**
1. Use filters (status, heat, owner, source, property) to find leads.
2. Click a row to open the lead detail page.
3. Create new leads with **Add lead** or from Call Center.
4. Assign owners and schedule follow-ups from the detail view.

**Heat & scoring**
Leads are bucketed Hot/Warm/Cold based on scoring rules configured in Setup → Scoring Rules.

**Permissions**
Requires leads.view.own, leads.view.team, leads.view.all, or leads.manage.`,
    tags: ["leads", "pipeline", "heat"],
    relatedIds: ["leads.detail", "leads.field-sales", "setup.scoring"],
  }),
  topic({
    id: "leads.detail",
    category: "leads",
    title: "Lead detail",
    summary: "Full lead record: contact info, stay details, activities, quotations, and follow-ups.",
    body: `Open any lead from the list to see the complete record.

**Sections**
- Guest and stay information
- Pipeline stage and heat
- Activity timeline (calls, emails, notes)
- Quotations and payment links
- Scheduled follow-ups

**Actions**
Update stage, log activities, send email/WhatsApp, create quotations, and assign buddies for coverage.`,
    tags: ["lead", "detail", "activities"],
    relatedIds: ["leads.list", "followups.today"],
  }),
  topic({
    id: "leads.field-sales",
    category: "leads",
    title: "Field sales lead form",
    summary:
      "Multi-step wizard to capture on-site sales leads linked to a B2B account with pricing lines.",
    body: `Use the field sales wizard when creating leads from account visits or partner meetings.

**Steps**
1. **Account** — select or confirm the B2B/agent account.
2. **Guest** — guest name, contact, and preferences.
3. **Stay** — dates, property, room type.
4. **Pricing** — add rate lines and packages.
5. **Review** — confirm and submit.

Open from an account's Leads tab via **Add field sales lead**.`,
    tags: ["field sales", "wizard", "account"],
    relatedIds: ["accounts.list", "leads.list"],
  }),
  topic({
    id: "leads.field-sales.contact",
    category: "leads",
    title: "Field sales — contact",
    summary: "Primary POC name, phone, and email for the lead.",
    body: `Enter the point of contact at the travel agent or corporate account. Phone and email are used for duplicate detection when saving.`,
    tags: ["field sales", "contact"],
    relatedIds: ["leads.field-sales"],
  }),
  topic({
    id: "leads.field-sales.account",
    category: "leads",
    title: "Field sales — source & account",
    summary: "Lead source, temperature, and linked B2B account.",
    body: `Select the lead source (e.g. TA visit, corporate). Hot/Warm/Cold sets initial priority. Link to an account when the source requires it.`,
    tags: ["field sales", "account"],
    relatedIds: ["leads.field-sales", "accounts.list"],
  }),
  topic({
    id: "leads.field-sales.stay",
    category: "leads",
    title: "Field sales — stay details",
    summary: "Hotel, check-in/out dates, rooms, and occasion.",
    body: `Capture the proposed stay: property, dates, room count, and occasion. Hotel is optional if not yet decided.`,
    tags: ["field sales", "stay"],
    relatedIds: ["leads.field-sales"],
  }),
  topic({
    id: "leads.field-sales.pricing",
    category: "leads",
    title: "Field sales — rate offer",
    summary: "Room categories, meal plans, and per-night rates.",
    body: `Add one or more pricing lines with room category, meal plan (CP/MAP/AP), rate per night, and inclusions. Estimated booking value is calculated automatically.`,
    tags: ["field sales", "pricing"],
    relatedIds: ["leads.field-sales"],
  }),
  topic({
    id: "leads.field-sales.followup",
    category: "leads",
    title: "Field sales — follow-up",
    summary: "Schedule a manual follow-up date and notes before submitting.",
    body: `Set when to follow up on this offer. Add notes for context. Review all sections, then submit — duplicate leads are flagged before save.`,
    tags: ["field sales", "follow-up"],
    relatedIds: ["leads.field-sales", "followups.today"],
  }),
  topic({
    id: "accounts.list",
    category: "accounts",
    title: "Accounts",
    summary: "Manage travel agent and corporate B2B accounts, contacts, and relationships.",
    body: `Accounts represent agencies, corporates, and partners you sell through.

**Workflow**
1. Browse or search accounts by name, type, or city.
2. Open an account to see profile, contacts, contracts, documents, and leads.
3. Admins create accounts in Setup → Account Mgmt or from this screen if permitted.

**Account profile includes**
Contacts, contracts, rate agreements, potentials, guests, notes, and field-sales leads.`,
    tags: ["accounts", "b2b", "agents"],
    relatedIds: ["accounts.dashboard", "leads.field-sales"],
  }),
  topic({
    id: "accounts.dashboard",
    category: "accounts",
    title: "Accounts dashboard",
    summary:
      "Org-wide sales view: targets vs achievement, calendar with holidays/seasons, and account performance.",
    body: `The Accounts Dashboard gives leadership a monthly view of sales performance.

**Features**
- Monthly targets vs booked leads or revenue (configured in Setup → Sales Targets)
- Calendar highlights for holidays and peak seasons (Setup → Holidays)
- Financial year settings (Setup → FY & Sales Settings)

Use filters to focus on specific periods or teams.`,
    tags: ["accounts", "dashboard", "targets"],
    relatedIds: ["setup.sales-targets", "setup.holidays"],
  }),
  topic({
    id: "followups.today",
    category: "followups",
    title: "Today's follow-ups",
    summary: "View and complete all follow-up tasks scheduled for today.",
    body: `Follow-ups are tasks linked to leads that remind you to call, email, or take action.

1. Open **Follow Ups** from the sidebar.
2. Complete tasks by logging the outcome on the linked lead.
3. Overdue items are highlighted; badge count shows on the nav item.

Follow-up timing is driven by Setup → Follow-up Rules based on lead heat.`,
    tags: ["follow-ups", "tasks"],
    relatedIds: ["followups.calendar", "setup.followup-rules"],
  }),
  topic({
    id: "followups.calendar",
    category: "followups",
    title: "Calendar & week planner",
    summary: "Personal calendar and week planner for scheduled follow-ups and meetings.",
    body: `**My Calendar** shows your scheduled follow-ups and tasks by day.

**Week Planner** gives a weekly grid view for planning outreach.

Both sync from follow-up tasks created on leads or by automation rules.`,
    tags: ["calendar", "planner"],
    relatedIds: ["followups.today"],
  }),
  topic({
    id: "calls.center",
    category: "calls",
    title: "Call center",
    summary: "Handle incoming calls, view caller context, and create or update leads in real time.",
    body: `Call Center is for reservation and sales agents handling phone inquiries.

1. When a call arrives, view guest context if matched.
2. Create a new lead or open an existing one.
3. Log call notes and schedule follow-ups before ending the call.

Requires callcenter.access permission.`,
    tags: ["calls", "phone"],
    relatedIds: ["leads.list"],
  }),
  topic({
    id: "tickets.main",
    category: "tickets",
    title: "Tickets",
    summary: "Create and manage support tickets; assign, track status, and resolve issues.",
    body: `Tickets track customer issues separate from sales leads.

1. Create a ticket with subject, description, and priority.
2. Assign to a team member.
3. Update status until resolved.

Permissions: tickets.view.own / team / all or tickets.manage.`,
    tags: ["tickets", "support"],
  }),
  topic({
    id: "knowledge.hub",
    category: "knowledge",
    title: "Knowledge Base",
    summary:
      "Browse property guides with search, thumbnails, and per-hotel factsheets for sales conversations.",
    body: `Knowledge Base is your hotel factsheet library.

**Landing page**
- Search hotels by name, city, or in-guide content (amenities, rates, policies)
- Property grid with photo thumbnails
- Click a card to open the **Property Guide**

**Property Guide sections**
Contact, rooms & rates, amenities, experiences, selling story, photos, policies. Share via PDF, email, WhatsApp, or public link.`,
    tags: ["knowledge", "property", "guide"],
    relatedIds: ["knowledge.editor", "knowledge.share"],
  }),
  topic({
    id: "knowledge.editor",
    category: "knowledge",
    title: "Property guide editor",
    summary: "Admin editor for contact, rates, amenities, gallery photos, policies, and public sharing per hotel.",
    audience: "admin",
    body: `Setup → Knowledge → **Edit property guide**

1. Select a property.
2. Edit sections: Contact, Rooms & rates, Amenities, Experiences, Selling story, Policies, Photo gallery.
3. Upload gallery images (first image = hub thumbnail and guide cover).
4. Enable **public sharing** and regenerate share token if needed.
5. Save guide.

Requires knowledge-base.manage permission.`,
    tags: ["knowledge", "admin", "editor"],
    relatedIds: ["knowledge.hub", "knowledge.share"],
  }),
  topic({
    id: "knowledge.share",
    category: "knowledge",
    title: "Sharing property guides",
    summary: "Download PDF, email, WhatsApp, or copy a public read-only link for a property guide.",
    body: `From a Property Guide, use the share bar under the hero image:

- **PDF** — downloads a snapshot of the guide
- **Email** — opens your mail app with a pre-filled message
- **WhatsApp** — shares the public URL
- **Copy link** — public URL (requires share enabled in editor)

Public links open at /share/knowledge/:token without CRM login.`,
    tags: ["knowledge", "share", "pdf"],
    relatedIds: ["knowledge.editor"],
  }),
  topic({
    id: "email.client",
    category: "email",
    title: "Email client",
    summary: "Send and receive emails from the CRM; view history linked to leads.",
    body: `Email Client integrates inbox and compose with lead records.

Connect your provider in Setup → Email Provider (SMTP/IMAP). Personal settings under Email Settings.`,
    tags: ["email"],
    relatedIds: ["email.settings", "setup.email-provider"],
  }),
  topic({
    id: "email.settings",
    category: "email",
    title: "Email settings",
    summary: "Configure personal signatures and email preferences.",
    body: `Set your signature, default sender, and display preferences for the integrated email client.`,
    tags: ["email", "settings"],
  }),
  topic({
    id: "email.health",
    category: "email",
    title: "Email health",
    summary: "Monitor delivery metrics, bounces, and email system performance.",
    audience: "admin",
    body: `Email Health dashboard shows delivery status and issues for configured email providers.`,
    tags: ["email", "health", "admin"],
  }),
  topic({
    id: "buddy.main",
    category: "buddy",
    title: "Buddy management",
    summary: "Assign backup coverage for leads when owners are away; view history and reports.",
    body: `Buddy assignments ensure leads are covered when the primary owner is unavailable.

1. Assign a buddy to a user or lead.
2. View assignment history.
3. Run buddy coverage reports.

Requires buddies.assign, buddies.view.history, or buddies.view.reports.`,
    tags: ["buddy", "coverage"],
  }),
  topic({
    id: "reports.main",
    category: "reports",
    title: "Reports",
    summary: "Conversion rates, response times, lead sources, and team performance analytics.",
    body: `Reports provides analytics across leads, sources, and team performance.

Filter by date range and export where available. Requires reports.view permission.`,
    tags: ["reports", "analytics"],
  }),
  topic({
    id: "settings.overview",
    category: "settings",
    title: "Setup & settings",
    summary: "Central hub for security, automation, integrations, and CRM configuration.",
    audience: "admin",
    body: `Open **Setup** from the sidebar to configure the CRM.

Categories: Security Control, General Administration, Automation, Accounts & Sales, Knowledge Base, Channels & Communication, Integrations.

Each card has an (i) button with a quick setup guide. Full articles are in Training & Help.`,
    tags: ["settings", "setup", "admin"],
    relatedIds: ["getting-started.permissions"],
  }),
  topic({
    id: "support.contact",
    category: "support",
    title: "Support & troubleshooting",
    summary: "Common issues: login failures, session expired, API connection errors.",
    body: `**Cannot log in**
- Verify email and password with your admin.
- Ensure backend is running and VITE_API_BASE_URL points to the API (default http://localhost:4002).

**Session expired**
- You will be redirected to login. Sign in again.

**Blank data or errors**
- Check browser console for failed API calls.
- Confirm MongoDB is running for local development.

**Need help?**
Contact your CRM administrator or Svayammeraki Technologies support.`,
    tags: ["support", "help", "errors", "login"],
  }),
  // Setup topics (admin)
  topic({
    id: "setup.roles",
    category: "security",
    title: "Roles setup",
    summary: "Create roles (e.g. Sales, Support) to match your team structure.",
    audience: "admin",
    body: `Setup → Security → **Roles**

Create roles (e.g. Sales, Support) to match your team structure. Assign users to roles to control access and reporting.`,
    tags: ["setup", "roles"],
  }),
  topic({
    id: "setup.profiles",
    category: "security",
    title: "Profiles setup",
    summary: "Profiles define permissions: what screens and actions each role can access.",
    audience: "admin",
    body: `Setup → Security → **Profiles**

Profiles define permissions: what screens and actions each role can access. Map profiles to roles after creating them.`,
    tags: ["setup", "profiles"],
  }),
  topic({
    id: "setup.groups",
    category: "security",
    title: "Groups setup",
    summary: "Create groups for teams that work together.",
    audience: "admin",
    body: `Setup → Security → **Groups**

Create groups for teams that work together. Add users to groups to enable shared visibility and collaboration.`,
    tags: ["setup", "groups"],
  }),
  topic({
    id: "setup.data-sharing",
    category: "security",
    title: "Data sharing",
    summary: "Configure which records each role can see: own, team, or all.",
    audience: "admin",
    body: `Setup → Security → **Data Sharing**

Configure which records (leads, contacts) each role can see: only own, team, or all. Set sharing rules per object.`,
    tags: ["setup", "sharing"],
  }),
  topic({
    id: "setup.users",
    category: "settings",
    title: "Users",
    summary: "Add users with email and assign a role.",
    audience: "admin",
    body: `Setup → **Users**

Add users with email and assign a role. Each user gets login credentials and access based on their role's profile.`,
    tags: ["setup", "users"],
  }),
  topic({
    id: "setup.accounts",
    category: "settings",
    title: "Account management setup",
    summary: "Create B2B and agent accounts for external partners.",
    audience: "admin",
    body: `Setup → **Account Mgmt**

Create B2B and agent accounts for external partners. Link accounts to properties or pipelines as needed.`,
    tags: ["setup", "accounts"],
  }),
  topic({
    id: "setup.properties",
    category: "settings",
    title: "Property management",
    summary: "Add hotel properties linked to leads and knowledge guides.",
    audience: "admin",
    body: `Setup → **Property Mgmt** (or /properties)

Add your hotel properties with details. Properties link to leads, pipelines, and knowledge guides.`,
    tags: ["setup", "properties"],
  }),
  topic({
    id: "setup.fields",
    category: "settings",
    title: "Field builder",
    summary: "Add custom fields for leads, contacts, and deals.",
    audience: "admin",
    body: `Setup → **Field Builder**

Add custom fields (text, number, dropdown, etc.) for leads, contacts, and deals. Set field types and make some mandatory at pipeline stages.`,
    tags: ["setup", "fields"],
  }),
  topic({
    id: "setup.pipelines",
    category: "settings",
    title: "Pipeline management",
    summary: "Create stages and required fields per stage.",
    audience: "admin",
    body: `Setup → **Pipeline Mgmt**

Create stages (e.g. New, Contacted, Qualified) and order them. Mark which fields are required at each stage.`,
    tags: ["setup", "pipelines"],
  }),
  topic({
    id: "setup.scoring",
    category: "settings",
    title: "Scoring rules",
    summary: "Define Hot/Warm/Cold thresholds and call quality dimensions.",
    audience: "admin",
    body: `Setup → **Scoring Rules**

Define score thresholds (e.g. Hot/Warm/Cold) and call quality dimensions. Leads are scored and bucketed automatically.`,
    tags: ["setup", "scoring"],
  }),
  topic({
    id: "setup.allocation",
    category: "settings",
    title: "Assignment rules",
    summary: "Round-robin or workload-based lead assignment.",
    audience: "admin",
    body: `Setup → **Assignment Rules**

Choose assignment mode (round-robin or workload-based). Configure capacity and which leads are eligible for auto-assignment.`,
    tags: ["setup", "allocation"],
  }),
  topic({
    id: "setup.followup-rules",
    category: "settings",
    title: "Follow-up rules",
    summary: "Auto-schedule follow-ups by lead heat bucket.",
    audience: "admin",
    body: `Setup → **Follow-up Rules**

Create buckets (e.g. Hot, Warm) and set follow-up delays per bucket. Leads get tasks auto-scheduled based on their score.`,
    tags: ["setup", "followups"],
  }),
  topic({
    id: "setup.workflows",
    category: "settings",
    title: "Workflow builder",
    summary: "Event-driven automations with triggers, conditions, and actions.",
    audience: "admin",
    body: `Setup → **Workflow Builder**

Build workflows with triggers (e.g. lead created, stage changed), conditions, and actions. Test with dry run before activating.`,
    tags: ["setup", "workflows"],
  }),
  topic({
    id: "setup.contract-approval",
    category: "settings",
    title: "Contract approval rules",
    summary: "Multi-step contract approval routing.",
    audience: "admin",
    body: `Setup → **Contract Approval Rules**

Define contract approval routing with multi-step approvers by user, role, or submitter manager.`,
    tags: ["setup", "contracts"],
  }),
  topic({
    id: "setup.sales-targets",
    category: "settings",
    title: "Sales targets",
    summary: "Monthly org-wide targets for the accounts dashboard.",
    audience: "admin",
    body: `Setup → **Sales Targets**

Enter booked-lead or revenue targets per month. Achievement is calculated automatically from CRM data.`,
    tags: ["setup", "targets"],
  }),
  topic({
    id: "setup.holidays",
    category: "settings",
    title: "Holidays & seasons",
    summary: "Public holidays and peak seasons on the accounts calendar.",
    audience: "admin",
    body: `Setup → **Holidays & Seasons**

Add date ranges for public holidays and seasons. They appear as highlights on the accounts dashboard calendar.`,
    tags: ["setup", "holidays"],
  }),
  topic({
    id: "setup.sales-settings",
    category: "settings",
    title: "FY & sales settings",
    summary: "Financial year start and achievement metric (leads vs revenue).",
    audience: "admin",
    body: `Setup → **FY & Sales Settings**

Set when your financial year starts and whether targets measure booked leads or revenue.`,
    tags: ["setup", "fy"],
  }),
  topic({
    id: "setup.templates",
    category: "settings",
    title: "Message templates",
    summary: "Reusable email, SMS, and WhatsApp templates with placeholders.",
    audience: "admin",
    body: `Setup → **Message Templates**

Create templates with placeholders (e.g. {{lead.name}}) for personalization. Use in emails, SMS, and WhatsApp messages.`,
    tags: ["setup", "templates"],
  }),
  topic({
    id: "setup.email-provider",
    category: "settings",
    title: "Email provider",
    summary: "SMTP/IMAP configuration for sending and receiving email.",
    audience: "admin",
    body: `Setup → **Email Provider**

Enter your SMTP host, port, and credentials to send emails from the CRM. Add IMAP for inbox sync if supported.`,
    tags: ["setup", "email"],
  }),
  topic({
    id: "setup.call-quality",
    category: "settings",
    title: "Call quality dimensions",
    summary: "Score agent calls on clarity, empathy, and other dimensions.",
    audience: "admin",
    body: `Setup → **Call Quality**

Define dimensions (e.g. Clarity, Empathy) and weights. Agents are scored on calls using these dimensions.`,
    tags: ["setup", "calls"],
  }),
  topic({
    id: "setup.integrations",
    category: "settings",
    title: "Integration hub",
    summary: "Connect external services via OAuth or API keys.",
    audience: "admin",
    body: `Setup → **Integration Hub**

Connect providers (e.g. calendar, CRM sync). OAuth or API keys may be required. Map fields for data sync.`,
    tags: ["setup", "integrations"],
  }),
  topic({
    id: "setup.webhooks",
    category: "settings",
    title: "API & webhooks",
    summary: "Webhook URLs and API keys for external lead capture.",
    audience: "admin",
    body: `Setup → **API & Webhooks**

Add webhook URLs to receive lead/contact events. Configure API keys and rate limits for external integrations.`,
    tags: ["setup", "webhooks", "api"],
  }),
  topic({
    id: "setup.audit-log",
    category: "settings",
    title: "Audit log",
    summary: "Who changed what and when — for compliance and debugging.",
    audience: "admin",
    body: `Setup → **Audit Log**

View a log of who changed what and when. Filter by user, entity, or action. Use for compliance and debugging.`,
    tags: ["setup", "audit"],
  }),
];

const topicMap = new Map(HELP_TOPICS.map((t) => [t.id, t]));

export function getHelpTopic(id: string): HelpTopic | undefined {
  return topicMap.get(id);
}

export function searchHelpTopics(
  query: string,
  options?: { audience?: "all" | "admin"; includeAdmin?: boolean }
): HelpTopic[] {
  const q = query.trim().toLowerCase();
  let list = HELP_TOPICS;
  if (!options?.includeAdmin) {
    list = list.filter((t) => t.audience !== "admin");
  }
  if (!q) return list;
  return list.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.body.toLowerCase().includes(q) ||
      t.tags?.some((tag) => tag.includes(q))
  );
}

export function getTopicsByCategory(
  categoryId: string,
  includeAdmin = false
): HelpTopic[] {
  return HELP_TOPICS.filter(
    (t) =>
      t.category === categoryId && (includeAdmin || t.audience !== "admin")
  );
}

/** Map Settings dashboard paths to help topic ids */
export const SETUP_PATH_TO_HELP_ID: Record<string, string> = {
  "setup/roles": "setup.roles",
  "setup/profiles": "setup.profiles",
  "setup/groups": "setup.groups",
  "setup/data-sharing": "setup.data-sharing",
  "setup/users": "setup.users",
  "setup/accounts": "setup.accounts",
  "/properties": "setup.properties",
  "setup/fields": "setup.fields",
  "setup/pipelines": "setup.pipelines",
  "setup/scoring": "setup.scoring",
  "setup/allocation": "setup.allocation",
  "setup/followup-rules": "setup.followup-rules",
  "setup/workflows": "setup.workflows",
  "setup/contract-approval-rules": "setup.contract-approval",
  "setup/sales-targets": "setup.sales-targets",
  "setup/holidays": "setup.holidays",
  "setup/sales-settings": "setup.sales-settings",
  "setup/property-guide": "knowledge.editor",
  "setup/templates": "setup.templates",
  "setup/email-provider": "setup.email-provider",
  "setup/call-quality": "setup.call-quality",
  "setup/integrations": "setup.integrations",
  "setup/webhooks": "setup.webhooks",
  "setup/audit-log": "setup.audit-log",
};

/** Map sidebar paths to help topic ids */
export const NAV_PATH_TO_HELP_ID: Record<string, string> = {
  "/": "dashboard.main",
  "/dashboard": "dashboard.main",
  "/calls": "calls.center",
  "/leads": "leads.list",
  "/accounts": "accounts.list",
  "/accounts/dashboard": "accounts.dashboard",
  "/follow-ups": "followups.today",
  "/calendar": "followups.calendar",
  "/week-planner": "followups.calendar",
  "/reports": "reports.main",
  "/buddy": "buddy.main",
  "/tickets": "tickets.main",
  "/knowledge": "knowledge.hub",
  "/email": "email.client",
  "/email/settings": "email.settings",
  "/email/health": "email.health",
  "/settings": "settings.overview",
  "/help": "getting-started.overview",
  "/notifications": "getting-started.notifications",
};
