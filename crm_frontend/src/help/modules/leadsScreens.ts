import type { HelpFieldGuide, HelpScreenGuide } from "../helpTypes";
import {
  LEADS_ADD_STEP1_FIELDS,
  LEADS_ADD_STEP2_FIELDS,
  LEADS_ADD_STEP3_FIELDS,
  LEADS_ADD_STEP4_FIELDS,
  LEADS_LIST_FILTER_FIELDS,
  LEADS_FIELD_SALES_FIELDS,
  CALLS_CENTER_FIELDS,
} from "./fieldGuides/leads";

function screen(
  id: string,
  title: string,
  what: string,
  how: string,
  fields: HelpFieldGuide[]
): HelpScreenGuide {
  return { id, title, what, how, fields };
}

export const LEADS_TOPIC_SCREENS: Record<string, HelpScreenGuide[]> = {
  "leads.list": [
    screen("leads.list.filters", "List filters", "Narrow the lead list to what you need today.", "Open filter row; combine property, stage, source, and temperature.", LEADS_LIST_FILTER_FIELDS),
  ],
  "leads.add": [
    screen("leads.add.step1", "Step 1 — Guest", "Capture who is inquiring.", "Enter guest identity and contact details. All required fields must pass before Continue.", LEADS_ADD_STEP1_FIELDS),
    screen("leads.add.step2", "Step 2 — Stay", "Capture where and when they want to stay.", "Add one or more hotels with dates and room details.", LEADS_ADD_STEP2_FIELDS),
    screen("leads.add.step3", "Step 3 — Source & details", "Classify the lead and add business context.", "Set booking source, heat, and optional corporate fields.", LEADS_ADD_STEP3_FIELDS),
    screen("leads.add.step4", "Step 4 — Review", "Confirm before saving.", "Read summary and submit to create the lead.", LEADS_ADD_STEP4_FIELDS),
  ],
  "leads.field-sales": [
    screen("leads.field-sales.all", "Field sales wizard", "On-site B2B lead with pricing.", "Complete account, guest, stay, pricing, and follow-up sections.", LEADS_FIELD_SALES_FIELDS),
  ],
  "calls.center": [
    screen("calls.center.panel", "Call center panel", "Live call handling workspace.", "Lookup caller, review history, fill lead form, log status.", CALLS_CENTER_FIELDS),
  ],
};
