import type { HelpFieldGuide, HelpScreenGuide } from "../helpTypes";
import {
  ACCOUNTS_WIZARD_ORG_FIELDS,
  ACCOUNTS_WIZARD_CLASSIFICATION_FIELDS,
  ACCOUNTS_WIZARD_HIERARCHY_FIELDS,
  ACCOUNTS_WIZARD_LOCATION_FIELDS,
  ACCOUNTS_WIZARD_COMPLIANCE_FIELDS,
  ACCOUNTS_TRAVEL_TRADE_FIELDS,
  CONTACTS_WIZARD_FIELDS,
  CONTRACTS_WIZARD_FIELDS,
} from "./fieldGuides/accounts";

function screen(
  id: string,
  title: string,
  what: string,
  how: string,
  fields: HelpFieldGuide[]
): HelpScreenGuide {
  return { id, title, what, how, fields };
}

export const ACCOUNTS_TOPIC_SCREENS: Record<string, HelpScreenGuide[]> = {
  "accounts.wizard": [
    screen("accounts.wizard.organization", "Organization", "Who is this partner?", "Enter legal name, org type, and travel trade details if applicable.", ACCOUNTS_WIZARD_ORG_FIELDS),
    screen("accounts.wizard.classification", "Classification", "How we categorize the account.", "Set level, type, industry, and HQ flag.", ACCOUNTS_WIZARD_CLASSIFICATION_FIELDS),
    screen("accounts.wizard.travel", "Travel trade profiles", "Operator-type specific data.", "Complete each selected operator step (Inbound, Luxury, etc.).", ACCOUNTS_TRAVEL_TRADE_FIELDS),
    screen("accounts.wizard.hierarchy", "Hierarchy", "Where the account sits in the tree.", "Link conglomerate, parent, and properties.", ACCOUNTS_WIZARD_HIERARCHY_FIELDS),
    screen("accounts.wizard.location", "Location", "Physical and market location.", "City, zone, and address for territory reporting.", ACCOUNTS_WIZARD_LOCATION_FIELDS),
    screen("accounts.wizard.compliance", "Compliance & sales team", "Tax IDs and relationship owners.", "GSTIN, PAN, PAM/SAM, and contracting.", ACCOUNTS_WIZARD_COMPLIANCE_FIELDS),
  ],
  "contacts.wizard": [
    screen("contacts.wizard.all", "Contact form", "Add a person at an account.", "Fill identity, role, and primary contact flag.", CONTACTS_WIZARD_FIELDS),
  ],
  "contracts.wizard": [
    screen("contracts.wizard.all", "Contract wizard", "Create B2B rate agreement.", "Basics, parties, rate grid, then review.", CONTRACTS_WIZARD_FIELDS),
  ],
};
