import { field } from "../_utils";

const T = "leads.add";

export const LEADS_ADD_STEP1_FIELDS = [
  field(`${T}.firstName`, "First name", "Guest's given name as it should appear on the booking.", "Enter the name the guest uses officially. Required before continuing.", { required: true, example: "Priya" }),
  field(`${T}.middleName`, "Middle name", "Optional middle name or initial.", "Fill only if the guest provided it or it appears on ID documents.", { example: "R." }),
  field(`${T}.lastName`, "Last name", "Guest's family or surname.", "Required for identification and quotations.", { required: true, example: "Sharma" }),
  field(`${T}.guestContactNumber`, "Contact number", "Primary mobile number for calls and WhatsApp.", "Use 10-digit Indian mobile or full international format with country code.", { required: true, example: "9876543210" }),
  field(`${T}.guestEmail`, "Email", "Primary email for confirmations and quotations.", "Optional on first contact — many guests share email later. Used for duplicate detection when provided.", { example: "priya@email.com" }),
  field(`${T}.vipStatus`, "VIP / VVIP", "Guest importance tag.", "Mark VIP or VVIP when the guest requires elevated handling."),
  field(`${T}.alternateContact`, "Alternate contact", "Secondary phone if the guest has one.", "Optional backup number for reachability.", { example: "9123456780" }),
  field(`${T}.occupation`, "Occupation", "Guest's profession or role.", "Helps personalize communication; optional.", { example: "Marketing Director" }),
];

export const LEADS_ADD_STEP2_FIELDS = [
  field(`${T}.hotelName`, "Hotel", "Postcard property for the proposed stay.", "Select from the master hotel list. Add another hotel block for multi-property itineraries.", { example: "The Postcard Saligao" }),
  field(`${T}.checkInDate`, "Check-in date", "Arrival date for this hotel stay.", "Must be today or future. Check-out must be after check-in.", { required: true }),
  field(`${T}.checkOutDate`, "Check-out date", "Departure date for this hotel stay.", "Drives night count and rate calculations.", { required: true }),
  field(`${T}.roomCategory`, "Room category", "Room type requested (e.g. Deluxe, Suite).", "Required before continuing from Stay. Match hotel inventory categories when known.", { required: true, example: "Garden Villa" }),
  field(`${T}.roomPreference`, "Room preference", "Bed type, floor, or view preferences.", "Free text for ops to note on booking.", { example: "King bed, ground floor" }),
  field(`${T}.numberOfGuests`, "Guests per room", "Number of guests in this room.", "Required. Used for occupancy and meal planning.", { required: true, example: "2" }),
];

export const LEADS_ADD_STEP3_FIELDS = [
  field(`${T}.bookingSource`, "Booking source", "How the guest found you or initiated contact.", "Drives reporting and lead source analytics. Required.", { required: true, example: "Direct Call" }),
  field(`${T}.heatLevel`, "Lead temperature", "Priority bucket: Hot, Warm, or Cold.", "Hot = ready to book soon; Warm = interested; Cold = early inquiry. Affects follow-up rules.", { required: true }),
  field(`${T}.corporateBooking`, "Corporate booking", "Whether this is a company-paid stay.", "Select Yes to show company name and GSTIN fields.", { required: true }),
  field(`${T}.companyName`, "Company name", "Employer or billing entity for corporate stays.", "Required when corporate booking is Yes.", { example: "Acme Corp India" }),
  field(`${T}.gstin`, "GSTIN", "15-character GST registration for corporate billing.", "Optional unless finance requires it for invoicing.", { example: "27AABCU9603R1ZM" }),
  field(`${T}.leadType`, "Lead type", "Classification such as Stay, Event, or Group.", "Maps to pipeline and reporting segments if configured.", { example: "STAY" }),
  field(`${T}.guestSegment`, "Guest segment", "Guest profile segment for personalization.", "Select from configured segments such as Leisure or Corporate.", { example: "Leisure" }),
  field(`${T}.source`, "Channel", "Marketing or sales channel attribution.", "Optional finer grain than booking source.", { example: "BRAND_WEBSITE" }),
  field(`${T}.value`, "Estimated value", "Expected booking revenue in INR.", "Helps prioritization; can be updated later.", { example: "85000" }),
  field(`${T}.specialRequests`, "Special requests", "Guest notes: dietary, accessibility, celebrations.", "Visible to reservations and front office.", { example: "Anniversary setup, late checkout" }),
  field(`${T}.notes`, "Internal notes", "Team-only context not shared with guest.", "Use for handover between agents.", { example: "Caller mentioned competitor rate" }),
];

export const LEADS_ADD_STEP4_FIELDS = [
  field(`${T}.review`, "Review & submit", "Final check before creating the lead.", "Verify guest, dates, hotel, and source. Click Create lead to save.", { required: true }),
];

export const LEADS_LIST_FILTER_FIELDS = [
  field("leads.list.filter.property", "Property filter", "Filter leads by hotel/property name.", "Choose a hotel from the list or All Properties to clear the filter."),
  field("leads.list.filter.stage", "Stage filter", "Filter by pipeline stage.", "Select a stage from your active pipeline or All."),
  field("leads.list.filter.source", "Source filter", "Filter by lead acquisition source.", "Useful for campaign performance review."),
  field("leads.list.filter.temperature", "Temperature filter", "Show only Hot, Warm, or Cold leads.", "Combine with owner filter for daily prioritization."),
];

export const LEADS_FIELD_SALES_FIELDS = [
  field("leads.field-sales.contact", "Contact section", "POC and reachability for this field visit.", "Capture who you met and how to reach them."),
  field("leads.field-sales.stay", "Stay section", "Proposed hotel stay details.", "Hotel, dates, rooms, and occasion."),
  field("leads.field-sales.pricing", "Pricing section", "Quoted rates and inclusions.", "Line items feed estimated booking value."),
  field("leads.field-sales.followup", "Follow-up section", "When to reconnect with the account.", "Creates a task on your calendar."),
  field("leads.field-sales.accountId", "Account", "B2B or travel trade account this lead belongs to.", "Search and select the partner account visited.", { required: true }),
  field("leads.field-sales.pocName", "Lead POC name", "Point of contact at the partner account.", "Name of person you spoke with on the visit.", { required: true }),
  field("leads.field-sales.alternateContact", "Alternate contact", "Secondary phone for the POC.", "Optional backup number."),
  field("leads.field-sales.leadSource", "Lead source", "How this opportunity originated.", "Field visit, referral, or event.", { required: true }),
  field("leads.field-sales.heatLevel", "Lead temperature", "Hot, Warm, or Cold priority.", "Affects follow-up scheduling.", { required: true }),
  field("leads.field-sales.companyName", "Company name", "Snapshot of account name on the lead.", "Auto-filled from account when selected."),
  field("leads.field-sales.totalRooms", "Total rooms", "Number of rooms requested.", "Used for value estimation."),
  field("leads.field-sales.occasion", "Occasion", "Purpose of stay.", "Wedding, MICE, leisure, etc."),
  field("leads.field-sales.otherInclusions", "Other inclusions", "Extras beyond meal plan.", "Transfers, spa, activities."),
  field("leads.field-sales.followUpTime", "Follow-up time", "Preferred time of day to call back.", "Optional; pairs with follow-up date."),
  field("leads.field-sales.firstName", "Guest first name", "End guest's first name.", "Required for the stay record.", { required: true }),
  field("leads.field-sales.lastName", "Guest last name", "End guest's surname.", "Required for the stay record.", { required: true }),
  field("leads.field-sales.phone", "Phone", "Guest contact number.", "Used for duplicate checks.", { required: true }),
  field("leads.field-sales.email", "Email", "Guest email address.", "Optional but recommended for quotations.", { example: "guest@email.com" }),
  field("leads.field-sales.checkInDate", "Check-in", "Proposed arrival date.", "Must be valid stay window.", { required: true }),
  field("leads.field-sales.checkOutDate", "Check-out", "Proposed departure date.", "Must be after check-in.", { required: true }),
  field("leads.field-sales.hotelId", "Hotel", "Target Postcard property.", "Select from active hotels in master list."),
  field("leads.field-sales.roomCategory", "Room category", "Room type offered.", "Match contract or BAR category.", { example: "Luxury Pool Villa" }),
  field("leads.field-sales.mealPlan", "Meal plan", "CP, MAP, AP, or EP.", "Affects rate and inclusions.", { example: "MAP" }),
  field("leads.field-sales.ratePerNight", "Rate per night", "Quoted nightly rate in INR.", "Feeds estimated booking value.", { example: "12500" }),
  field("leads.field-sales.followUpDate", "Follow-up date", "When to reconnect with the account.", "Creates a task on your follow-up list.", { required: true }),
  field("leads.field-sales.notes", "Notes", "Context for the offer or visit.", "Visible on lead detail timeline."),
];

export const CALLS_CENTER_FIELDS = [
  field("calls.center.phoneLookup", "Phone lookup", "Search guest or lead by phone number.", "Enter caller ID; system may pre-fill PMS/CRM history if matched."),
  field("calls.center.callStatus", "Call status", "Outcome of the current call.", "Log before ending call for reporting."),
  field("calls.center.leadForm", "Lead form", "Inline lead capture during the call.", "Same fields as Add Lead wizard; saves without leaving call screen."),
];
