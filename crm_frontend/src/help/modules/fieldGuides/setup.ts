import { field } from "../_utils";

export const SETUP_HOTELS_FIELDS = [
  field("setup.hotels.name", "Hotel name", "Official Postcard property name.", "Use full brand name as guests know it.", { required: true, example: "The Postcard Saligao" }),
  field("setup.hotels.city", "City", "City where the hotel operates.", { example: "Saligao" }),
  field("setup.hotels.state", "State", "State or region.", { example: "Goa" }),
  field("setup.hotels.country", "Country", "Country of the property.", { example: "India" }),
  field("setup.hotels.status", "Status", "Active hotels appear in dropdowns; Inactive hides them.", "Deactivate instead of delete when retiring a property."),
];

export const SETUP_HOLIDAYS_FIELDS = [
  field("setup.holidays.name", "Name", "Holiday or season label.", "Shown on accounts calendar.", { required: true, example: "Diwali peak" }),
  field("setup.holidays.startDate", "Start date", "First day of the period.", { required: true }),
  field("setup.holidays.endDate", "End date", "Last day of the period.", { required: true }),
  field("setup.holidays.type", "Type", "Public holiday or season.", "Seasons for peak pricing periods.", { required: true }),
  field("setup.holidays.region", "Region", "Optional geographic scope.", { example: "North India" }),
];

export const SETUP_USERS_FIELDS = [
  field("setup.users.email", "Email", "Login email for the user.", "Must be unique in the system.", { required: true }),
  field("setup.users.name", "Name", "Display name in CRM.", { required: true }),
  field("setup.users.phone", "Phone", "Contact phone number.", { example: "+91 98765 43210" }),
  field("setup.users.password", "Password", "Login password.", "Minimum 6 characters for new users."),
  field("setup.users.role", "Role", "Organizational role assignment.", "Controls hierarchy and reporting.", { required: true }),
  field("setup.users.profile", "Profile", "Permission profile.", "Defines which modules user can access.", { required: true }),
  field("setup.users.reportsTo", "Reports to", "Manager in org hierarchy.", "Optional for top-level users."),
];

export const SETUP_FIELDS_BUILDER_FIELDS = [
  field("setup.fields.entity", "Entity", "Module to attach custom field to.", "Lead, Contact, or Deal.", { required: true }),
  field("setup.fields.label", "Field label", "Name shown on forms.", { required: true }),
  field("setup.fields.apiKey", "API key", "Internal field identifier.", "Lowercase with underscores; immutable after create."),
  field("setup.fields.type", "Field type", "Text, number, dropdown, date, etc.", "Cannot change type after creation easily.", { required: true }),
  field("setup.fields.options", "Options", "Dropdown choices.", "Comma-separated values."),
  field("setup.fields.required", "Required", "Whether field must be filled.", "Can be stage-specific in pipelines."),
  field("setup.fields.isActive", "Active", "Hidden fields are not shown on forms.", "Toggle to show or hide."),
  field("setup.fields.custom-field", "Custom field", "Admin-defined field on lead/contact forms.", "Description from field builder appears in help when configured."),
];

export const SETUP_PIPELINES_FIELDS = [
  field("setup.pipelines.name", "Pipeline name", "Sales process name.", { required: true, example: "Reservation pipeline" }),
  field("setup.pipelines.pipeline", "Pipeline", "Which sales pipeline to edit.", "Select when multiple pipelines exist."),
  field("setup.pipelines.stageName", "Stage name", "Step in the pipeline.", { required: true, example: "Qualified" }),
  field("setup.pipelines.stageOrder", "Stage order", "Sequence left to right.", "Drag to reorder stages."),
  field("setup.pipelines.isTerminal", "Is terminal", "Terminal stages end the pipeline.", "Won or Lost outcomes."),
  field("setup.pipelines.terminalType", "Terminal type", "Won or Lost outcome.", { required: true }),
  field("setup.pipelines.requiredFields", "Required fields", "Fields mandatory at this stage.", "Enforces data quality before advance."),
  field("setup.pipelines.color", "Color", "Stage color on kanban.", "Pick a distinct color per stage."),
];

export const SETUP_SCORING_FIELDS = [
  field("setup.scoring.hotThreshold", "Hot threshold", "Minimum score for Hot bucket.", "Leads at or above are urgent."),
  field("setup.scoring.warmThreshold", "Warm threshold", "Minimum score for Warm bucket.", "Between warm and hot thresholds."),
  field("setup.scoring.dimension", "Scoring dimension", "Call quality or lead attribute weight.", "Adjust weights to sum to 100%."),
  field("setup.scoring.ruleName", "Rule name", "Label for this scoring rule.", { required: true, example: "IVR source bonus" }),
  field("setup.scoring.points", "Points", "Score added when conditions match.", "Negative values deduct points."),
  field("setup.scoring.conditions", "Conditions", "When to award these points.", "Combine with AND or OR logic."),
  field("setup.scoring.priority", "Priority", "Lower numbers run first.", "Higher priority rules override overlaps."),
  field("setup.scoring.active", "Active", "Inactive rules are skipped.", "Toggle off to test without deleting."),
  field("setup.scoring.thresholdLabel", "Label", "Display name for score band.", { required: true, example: "Hot" }),
  field("setup.scoring.minScore", "Min score", "Lower bound of this band.", { required: true }),
  field("setup.scoring.maxScore", "Max score", "Upper bound of this band.", { required: true }),
  field("setup.scoring.color", "Color", "Badge color for this band."),
  field("setup.scoring.inactiveHoursWarning", "Inactive hours warning", "Hours idle before warning.", "Optional alert threshold."),
  field("setup.scoring.inactiveHoursCritical", "Inactive hours critical", "Hours idle before critical alert.", "Optional escalation threshold."),
  field("setup.scoring.autoAction", "Auto action", "Automated response at this band.", "Notify TL or auto-mark lost."),
  field("setup.scoring.dimensionName", "Name", "Dimension label.", { required: true }),
  field("setup.scoring.dimensionDescription", "Description", "What this dimension measures.", "Optional context for admins."),
  field("setup.scoring.weightPercent", "Weight %", "Share of total score.", "Active dimensions must sum to 100%."),
  field("setup.scoring.isActive", "Is active", "Inactive dimensions are excluded.", "Toggle off to pause weighting."),
];

export const SETUP_ALLOCATION_FIELDS = [
  field("setup.allocation.mode", "Assignment mode", "Round-robin or workload-based.", "Controls how new leads are distributed.", { required: true }),
  field("setup.allocation.capacity", "User capacity", "Max active leads per agent.", "Workload mode respects this cap."),
  field("setup.allocation.dailyLeadCap", "Daily lead cap", "Max new leads per agent per day.", { example: "30" }),
  field("setup.allocation.allocationWindow", "Allocation window", "Hours after login when agent is eligible.", { example: "8" }),
  field("setup.allocation.overflowMode", "Overflow mode", "What happens when cap is reached.", "Queue or smart queue."),
  field("setup.allocation.alertThreshold", "Alert threshold", "Percent of cap before alert.", { example: "90" }),
  field("setup.allocation.rules", "Eligibility rules", "Which leads auto-assign.", "Filter by source, property, or heat."),
];

export const SETUP_FOLLOWUP_FIELDS = [
  field("setup.followups.bucket", "Heat bucket", "Hot, Warm, or Cold.", "Each bucket can have different delays.", { required: true }),
  field("setup.followups.followupNumber", "Follow-up #", "Sequence number in the bucket.", "1 = first auto follow-up."),
  field("setup.followups.offset", "Offset", "Time after trigger to schedule.", "Use hours or days, not both."),
  field("setup.followups.delayHours", "Delay (hours)", "Hours after trigger to schedule follow-up.", { required: true, example: "24" }),
  field("setup.followups.offsetDays", "Days", "Days after trigger to schedule.", "Mutually exclusive with hours."),
  field("setup.followups.description", "Description", "Internal note for this rule.", "Optional admin context."),
  field("setup.followups.template", "Template", "Message template to use.", "Optional linked template."),
  field("setup.followups.isActive", "Is active", "Inactive rules are skipped.", "Toggle off to pause scheduling."),
];

export const SETUP_WORKFLOWS_FIELDS = [
  field("setup.workflows.name", "Name", "Workflow label.", { required: true }),
  field("setup.workflows.description", "Description", "What this workflow does.", "Optional admin context."),
  field("setup.workflows.isActive", "Is active", "Inactive workflows do not run.", "Toggle off to pause."),
  field("setup.workflows.trigger", "Trigger", "Event that starts workflow.", "e.g. Lead created, stage changed.", { required: true }),
  field("setup.workflows.idleMinutes", "Idle for (minutes)", "Minutes unattended before trigger.", { example: "15" }),
  field("setup.workflows.cronExpression", "Cron expression", "Schedule for timed runs.", { example: "0 9 * * *" }),
  field("setup.workflows.missedFollowups", "After N missed follow-ups", "Count of missed tasks to trigger.", { example: "1" }),
  field("setup.workflows.condition", "Condition", "Optional filter on trigger.", "Narrow to specific sources or properties."),
  field("setup.workflows.action", "Action", "What happens when triggered.", "Assign owner, send email, create task.", { required: true }),
];

export const SETUP_SALES_TARGETS_FIELDS = [
  field("setup.sales-targets.month", "Month", "Target month.", { required: true }),
  field("setup.sales-targets.target", "Target value", "Booked leads or revenue goal.", { required: true, example: "150" }),
];

export const SETUP_SALES_SETTINGS_FIELDS = [
  field("setup.sales-settings.fyStartMonth", "FY start month", "First month of financial year.", { required: true, example: "April" }),
  field("setup.sales-settings.fyStartDay", "FY start day", "Day of month FY begins.", { required: true, example: "1" }),
  field("setup.sales-settings.metric", "Achievement metric", "Count booked leads or revenue.", { required: true }),
];

export const SETUP_INTEGRATIONS_FIELDS = [
  field("setup.integrations.provider", "Provider", "External system to connect.", { required: true }),
  field("setup.integrations.apiKey", "API key", "Authentication credential.", "Store securely; rotate periodically."),
  field("setup.integrations.oauth", "OAuth connect", "Authorize via provider login.", "Click Connect and complete browser flow."),
];

export const SETUP_WEBHOOKS_FIELDS = [
  field("setup.webhooks.url", "Webhook URL", "Endpoint to receive CRM events.", { required: true }),
  field("setup.webhooks.events", "Events", "Which events to send.", "Lead created, updated, etc."),
];

export const SETUP_TEMPLATES_FIELDS = [
  field("setup.templates.name", "Template name", "Internal label.", { required: true }),
  field("setup.templates.medium", "Channel", "Email, SMS, or WhatsApp.", { required: true }),
  field("setup.templates.body", "Body", "Message content with {{placeholders}}.", { required: true }),
];

export const SETUP_EMAIL_PROVIDER_FIELDS = [
  field("setup.email-provider.smtpHost", "SMTP host", "Outgoing mail server.", { required: true }),
  field("setup.email-provider.smtpPort", "SMTP port", "Usually 465 or 587.", { required: true }),
  field("setup.email-provider.username", "Username", "SMTP login.", { required: true }),
  field("setup.email-provider.password", "Password", "SMTP password or app password.", { required: true }),
];

export const SETUP_ROLES_FIELDS = [
  field("setup.roles.name", "Role name", "Organizational role title.", { required: true, example: "Sales Executive" }),
  field("setup.roles.parent", "Reports to", "Parent role in hierarchy.", "Optional for top-level roles."),
  field("setup.roles.shareDataWithPeers", "Share data with peers", "Peers in same role see each other's records.", "When default module access is private."),
  field("setup.roles.description", "Description", "Role responsibilities.", "Optional context for admins."),
];

export const SETUP_PROFILES_FIELDS = [
  field("setup.profiles.name", "Profile name", "Permission set name.", { required: true }),
  field("setup.profiles.description", "Description", "What this profile is for.", "Optional admin context."),
  field("setup.profiles.permissions", "Permissions", "Check modules and actions allowed.", "Grant minimum required access."),
];

export const SETUP_GROUPS_FIELDS = [
  field("setup.groups.name", "Group name", "Team or department name.", { required: true }),
  field("setup.groups.description", "Description", "What this group represents.", "Optional admin context."),
  field("setup.groups.members", "Members", "Users in this group.", "Used for team visibility rules."),
  field("setup.groups.addUsers", "Add users", "Individual users to include.", "Pick from active users."),
  field("setup.groups.addSubGroups", "Add sub-groups", "Nested groups to include.", "Members inherit visibility."),
  field("setup.groups.addRoles", "Add roles", "All users in a role to include.", "Expands when role membership changes."),
];

export const SETUP_DATA_SHARING_FIELDS = [
  field("setup.data-sharing.object", "Object", "Leads or Contacts.", { required: true }),
  field("setup.data-sharing.fromType", "Source type", "Role or group owning records.", { required: true }),
  field("setup.data-sharing.fromId", "Source", "Role or group to share from.", { required: true }),
  field("setup.data-sharing.toType", "Target type", "Role or group receiving access.", { required: true }),
  field("setup.data-sharing.toId", "Target", "Role or group to share to.", { required: true }),
  field("setup.data-sharing.access", "Default access", "Own, team, or all records.", { required: true }),
];

export const SETUP_AUDIT_FIELDS = [
  field("setup.audit.user", "User filter", "Filter log by who made changes."),
  field("setup.audit.entity", "Entity filter", "Filter by record type."),
  field("setup.audit.dateRange", "Date range", "Narrow audit window."),
];

export const TICKETS_FIELDS = [
  field("tickets.title", "Title", "Short issue title.", "Required summary of the problem.", { required: true }),
  field("tickets.subject", "Subject", "Short issue title.", "Required summary of the problem.", { required: true }),
  field("tickets.description", "Description", "Full issue details.", "Include guest name, booking ref, and steps to reproduce.", { required: true }),
  field("tickets.category", "Category", "Issue type bucket.", "Routes to the right team.", { required: true }),
  field("tickets.priority", "Priority", "Low, Medium, High, or Urgent.", "Drives SLA and queue order.", { required: true }),
  field("tickets.assignee", "Assignee", "Team member responsible.", "Leave unassigned for triage queue."),
  field("tickets.assignment", "Assignment", "Assign now or leave for triage.", "Choose team or individual."),
  field("tickets.property", "Property", "Hotel related to the issue.", "Optional if not property-specific."),
  field("tickets.guestName", "Guest name", "Guest affected by the issue.", "Helps front office lookup."),
  field("tickets.guestPhone", "Guest phone", "Callback number.", "Include country code."),
  field("tickets.guestEmail", "Guest email", "Email for updates.", "Optional notification channel."),
  field("tickets.status", "Status", "Open, In progress, Resolved, Closed.", "Update as work progresses."),
];

export const FOLLOWUPS_FIELDS = [
  field("followups.contact", "Follow-up for", "Contact this follow-up relates to.", "Required when scheduling from account view.", { required: true }),
  field("followups.assignee", "Assign to", "Team member who owns this follow-up.", "Defaults to current user.", { required: true }),
  field("followups.quickSchedule", "Quick schedule", "Preset time shortcuts.", "Tap to set date/time in one click."),
  field("followups.dueDate", "Due date", "When the follow-up should happen.", "Overdue items highlight in red."),
  field("followups.note", "Note", "Context for the callback or email.", "Visible on lead timeline."),
  field("followups.outcome", "Outcome", "Result when completing task.", "Log reached, no answer, booked, etc."),
  field("followups.title", "Title", "Short label for the follow-up task.", "Shown on calendar and today list.", { required: true }),
  field("followups.type", "Follow-up type", "Call, email, meeting, or other.", "Helps agents prepare for the task."),
  field("followups.dueTime", "Due time", "Time of day for the follow-up.", "Optional; defaults to business hours."),
  field("followups.pauseWorkflow", "Pause workflow reminders", "Temporarily stop automated reminders.", "Use when guest asked for space."),
];

export const KNOWLEDGE_EDITOR_FIELDS = [
  field("knowledge.editor.title", "Title", "Article or guide title.", "Shown in knowledge hub search.", { required: true }),
  field("knowledge.editor.description", "Description", "Short summary of the article.", "Appears in list views."),
  field("knowledge.editor.content", "Content", "Rich text or JSON body.", "Main article content."),
  field("knowledge.editor.files", "Files", "Attachments for download.", "PDFs, images, rate sheets."),
  field("knowledge.editor.property", "Property", "Hotel to edit guide for.", "Select from master list.", { required: true }),
  field("knowledge.editor.contact", "Contact section", "Phones, emails, address.", "Shown to sales on property guide."),
  field("knowledge.editor.rates", "Rates", "Room categories and price bands.", "Keep updated each season."),
  field("knowledge.editor.amenities", "Amenities", "Facilities list.", "One per line or comma-separated."),
  field("knowledge.editor.gallery", "Photo gallery", "Property images.", "First image is hub thumbnail."),
  field("knowledge.editor.shareEnabled", "Public sharing", "Allow read-only public link.", "Regenerate token if link leaked."),
];

export const EMAIL_CLIENT_FIELDS = [
  field("email.compose.to", "To", "Recipient email addresses.", "Comma-separated for multiple."),
  field("email.compose.subject", "Subject", "Email subject line.", { required: true }),
  field("email.compose.body", "Body", "Message content.", "Link to lead for auto-logging."),
  field("email.settings.signature", "Signature", "Appended to outbound emails.", "Include name and phone."),
];

export const BUDDY_FIELDS = [
  field("buddy.assignee", "Buddy assignee", "User covering during absence.", { required: true }),
  field("buddy.startDate", "Start date", "Coverage begins.", { required: true }),
  field("buddy.endDate", "End date", "Coverage ends.", { required: true }),
  field("buddy.reason", "Reason", "Leave, training, etc.", { example: "Annual leave" }),
];
