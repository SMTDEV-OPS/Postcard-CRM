import { field } from "../_utils";

const W = "accounts.wizard";

export const ACCOUNTS_WIZARD_ORG_FIELDS = [
  field(`${W}.organization.name`, "Account name", "Legal or trade name of the organization.", "Required. Use official entity name for contracts and GST.", { required: true, example: "Sunrise Travels Pvt Ltd" }),
  field(`${W}.organization.organizationType`, "Organization type", "Corporate, Government and Institutions, Travel Trade, Lifestyle & High-Net-Worth, or Other.", "Determines industry options and workflow (e.g. Travel Trade shows operator steps).", { required: true }),
  field(`${W}.organization.email`, "Email", "Primary business email.", "Used on account profile and communications.", { example: "sales@sunrise.com" }),
  field(`${W}.organization.website`, "Website", "Company website URL.", "Optional reference for research.", { example: "https://sunrise.com" }),
  field(`${W}.organization.travelOperatorName`, "Travel operator name", "Trade name for travel trade accounts.", "Required for Travel Trade org type.", { required: true }),
  field(`${W}.organization.operatorTypes`, "Operator types", "Inbound, Luxury, Series, etc.", "Select all that apply; each opens a wizard step.", { required: true }),
];

export const ACCOUNTS_WIZARD_CLASSIFICATION_FIELDS = [
  field(`${W}.classification.accountLevel`, "Account level", "Hierarchy tier: Master, Parent, Branch, Subsidiary.", "Defines reporting roll-up.", { required: true }),
  field(`${W}.classification.accountType`, "Account type", "Acquisition, Development, or Retention.", "Sales strategy classification.", { required: true }),
  field(`${W}.classification.isHeadquarter`, "Headquarter account", "Marks this entity as HQ for a group.", "HQ accounts appear prominently in hierarchy views."),
  field(`${W}.classification.industryCategory`, "Account classification", "Industry / segment for the selected organization type (Government, Travel Trade, Lifestyle, Other, etc.).", "Options depend on organization type chosen in Step 1."),
  field(`${W}.classification.industrySize`, "Industry size", "Small, Medium, or Large band.", "Optional firmographic data."),
];

export const ACCOUNTS_WIZARD_HIERARCHY_FIELDS = [
  field(`${W}.hierarchy.conglomerateId`, "Conglomerate", "Parent conglomerate if part of a larger group.", "Optional; links to conglomerate master."),
  field(`${W}.hierarchy.parentAccountId`, "Parent account", "Immediate parent in account tree.", "Leave root level if standalone."),
  field(`${W}.hierarchy.propertyIds`, "Assign properties", "Postcard hotels this account sells or books.", "Check hotels they work with; used in contracts and reporting."),
];

export const ACCOUNTS_WIZARD_LOCATION_FIELDS = [
  field(`${W}.location.city`, "City", "Primary city of operation.", "Used in list filters and territory views.", { example: "Mumbai" }),
  field(`${W}.location.country`, "Country", "Country of registration or operation.", { example: "India" }),
  field(`${W}.location.zone`, "Zone", "Sales zone: North, South, East, or West.", "Aligns with internal territory mapping."),
  field(`${W}.location.addressLine1`, "Address", "Street address line.", { example: "12 Marine Drive" }),
];

export const ACCOUNTS_WIZARD_COMPLIANCE_FIELDS = [
  field(`${W}.compliance.gstin`, "GSTIN", "15-character GST identification.", "Required for Indian B2B invoicing when applicable.", { example: "27AABCU9603R1ZM" }),
  field(`${W}.compliance.panNumber`, "PAN", "10-character PAN.", "Tax identity for corporate accounts.", { example: "AABCU9603R" }),
  field(`${W}.compliance.pmsProfileId`, "PMS profile ID", "External PMS company profile reference.", "Only if integrated; usually left blank."),
  field(`${W}.compliance.primaryAccountManager`, "Primary account manager (PAM)", "Main relationship owner.", "Name and city of sales contact."),
  field(`${W}.compliance.secondaryAccountManagers`, "Secondary managers (SAM)", "Additional account coverage.", "Add rows for co-owners or city splits."),
  field(`${W}.compliance.contractingTypes`, "Contracting types", "Depends on organization type: Travel Trade (Preferred/Special/Partner Inbound, Global RFP) or Corporate (Employee Holiday Programme, ADHOC Group/FIT, Global RFP).", "Enable types and set contract periods."),
];

export const ACCOUNTS_TRAVEL_TRADE_FIELDS = [
  field(`${W}.travel.inbound.segments`, "Inbound segments", "FIT, Groups, MICE, etc.", "Select segments this operator handles.", { required: true }),
  field(`${W}.travel.inbound.segmentMarkets`, "Market / country per segment", "Country/market per segment.", "Required for each selected segment.", { required: true }),
  field(`${W}.travel.inbound.hotelSegments`, "Hotel segment", "Luxury, Mid, Budget, Economy.", "At least one required for inbound operators.", { required: true }),
  field(`${W}.travel.luxury.countryMarket`, "Country / market", "Primary luxury source market.", { required: true }),
  field(`${W}.travel.luxury.operatorKind`, "Type of operator", "Luxury tour operator or DMC.", { required: true }),
  field(`${W}.travel.luxury.annualRoomNights`, "Estimated annual room nights", "Expected yearly volume from this operator.", "Helps prioritize contracting.", { example: "1200" }),
  field(`${W}.travel.series.market`, "Market", "Target market for series program.", { required: true }),
  field(`${W}.travel.series.programName`, "Series or program name", "Series or program title.", { required: true }),
  field(`${W}.travel.series.startMonth`, "Start month", "Month the series program begins.", { required: true }),
  field(`${W}.travel.series.endMonth`, "End month", "Month the series program ends.", { required: true }),
  field(`${W}.travel.series.frequency`, "Frequency", "How often departures run.", { example: "Weekly" }),
  field(`${W}.travel.series.pattern`, "Pattern", "Departure pattern or routing.", { example: "Fixed departures" }),
  field(`${W}.travel.series.roomsPerDeparture`, "Rooms per departure", "Typical room block per departure.", { example: "20" }),
  field(`${W}.travel.series.totalRoomNights`, "Estimated total room nights", "Annual room nights from series.", { example: "800" }),
  field(`${W}.travel.series.blackoutDates`, "Blackout dates", "Dates when series cannot operate.", "Comma-separated or free text."),
  field(`${W}.travel.domestic.city`, "City", "Base city for domestic agent.", { required: true }),
  field(`${W}.travel.domestic.segment`, "Segment", "Domestic market segment.", { required: true }),
  field(`${W}.travel.domestic.agentType`, "Agent type", "Type of domestic travel agent.", { required: true }),
  field(`${W}.travel.groups.market`, "Market", "Source market for groups/incentives.", { required: true }),
  field(`${W}.travel.groups.type`, "Type", "Group or incentive category.", { required: true }),
  field(`${W}.travel.groups.groupSize`, "Group size", "Typical group size in rooms or pax.", { example: "40 rooms" }),
  field(`${W}.travel.groups.preferredTravelMonths`, "Preferred travel months", "Months when groups typically travel.", "Select at least one.", { required: true }),
];

export const CONTACTS_WIZARD_FIELDS = [
  field("contacts.wizard.fullName", "Full name", "Contact person's complete name with title.", "Required for directory and communications.", { required: true }),
  field("contacts.wizard.firstName", "First name", "Contact person's given name.", "Required for all contacts.", { required: true }),
  field("contacts.wizard.lastName", "Last name", "Contact surname.", "Required for directory and email salutation.", { required: true }),
  field("contacts.wizard.email", "Email", "Work email address.", "Primary channel for quotations.", { example: "raj@partner.com" }),
  field("contacts.wizard.phone", "Phone", "Mobile or desk number.", "Include country code for international.", { example: "+91 98765 43210" }),
  field("contacts.wizard.mobileNumber1", "Mobile number 1", "Primary mobile contact.", "Include country code.", { example: "+91 98765 43210" }),
  field("contacts.wizard.mobileNumber2", "Mobile number 2", "Secondary mobile number.", "Optional backup contact."),
  field("contacts.wizard.boardNumber", "Board number", "Main switchboard or board line.", "For reaching reception."),
  field("contacts.wizard.officeNumber", "Office number", "Direct office line.", "Desk phone if different from mobile."),
  field("contacts.wizard.designation", "Designation", "Job title at the account.", { example: "Head of Contracting" }),
  field("contacts.wizard.department", "Department", "Team or function.", { example: "Sales" }),
  field("contacts.wizard.contactType", "Contact type", "Role category (Decision maker, Finance, etc.).", "Helps route communications."),
  field("contacts.wizard.isPrimary", "Primary contact", "Main POC for this account.", "Only one primary recommended per account."),
  field("contacts.wizard.isKeyPersonnel", "Key personnel", "Marks this contact as a decision maker.", "Enables organization role selection."),
  field("contacts.wizard.keyPersonnelRole", "Role in organization", "Free-text decision-maker role at the account.", "Required when key personnel is checked. Type any role title.", { required: true, example: "Head of Contracting" }),
  field("contacts.wizard.clientStatus", "Client status", "Relationship status with this contact.", "Active, inactive, or prospect."),
  field("contacts.wizard.loyaltyNumber", "Loyalty membership number", "Guest loyalty program ID.", "Required when loyalty member is checked."),
  field("contacts.wizard.loyaltyProgramName", "Program name", "Name of loyalty program.", { example: "Postcard Privilege" }),
  field("contacts.wizard.dateOfBirth", "Birthday", "Contact date of birth.", "Used for personalized outreach."),
  field("contacts.wizard.weddingAnniversary", "Wedding anniversary", "Anniversary date for relationship marketing.", "Optional CRM touchpoint."),
];

export const CONTRACTS_WIZARD_FIELDS = [
  field("contracts.wizard.companyName", "Company name", "Legal name on the contract.", "Must match account legal entity.", { required: true }),
  field("contracts.wizard.channel", "Channel", "B2B or B2C sales channel.", "Determines rate grid columns.", { required: true }),
  field("contracts.wizard.propertyIds", "Properties", "Hotels covered by this contract.", "Select all applicable Postcard properties.", { required: true }),
  field("contracts.wizard.contactId", "Contact", "Signatory or primary contact.", "Links contract to account contact."),
  field("contracts.wizard.contactEmail", "Contact email", "Email for contract correspondence.", { example: "legal@partner.com" }),
  field("contracts.wizard.rateGrid", "Rate grid", "B2B/B2C rates by room and season.", "Fill cells; use bulk edit where available."),
];
