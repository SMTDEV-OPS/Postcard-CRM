/** Canonical organization types offered in the Add Account wizard. */
export const ORGANISATION_TYPES = [
    { value: "CORPORATE", label: "Corporate" },
    { value: "GOVERNMENT_INSTITUTIONS", label: "Government and Institutions" },
    { value: "TRAVEL_AGENT", label: "Travel Trade" },
    { value: "LIFESTYLE_HIGH_NET_WORTH", label: "Lifestyle & High-Net-Worth" },
    { value: "OTHER", label: "Other" },
] as const;

export const ORGANIZATION_TYPES = ORGANISATION_TYPES;

export type CanonicalOrganizationType = (typeof ORGANISATION_TYPES)[number]["value"];

/** Legacy organizationType values that still exist on older account records. */
const LEGACY_ORGANIZATION_TYPE_LABELS: Record<string, string> = {
    EVENT_ORGANISER: "Event Organiser",
    EVENT_PLANNER: "Event Planner",
    PROFESSIONAL_CONFERENCE_ORGANISER: "Professional Conference Organiser (PCO)",
    PCO: "Professional Conference Organiser (PCO)",
    WEDDING_PLANNER: "Wedding Planner",
    AIRLINE: "Airline",
    GOVERNMENT: "Government and Institutions",
    GOVERNMENT_BODIES: "Government and Institutions",
    EMBASSY_CONSULATE: "Government and Institutions",
    EMBASSIES_AND_CONSULATES: "Government and Institutions",
    PSU: "Government and Institutions",
    PUBLIC_SECTOR_UNIT: "Government and Institutions",
    CUSTOM: "Other",
};

const GOVERNMENT_LEGACY_VALUES = new Set([
    "GOVERNMENT",
    "GOVERNMENT_BODIES",
    "EMBASSY_CONSULATE",
    "EMBASSIES_AND_CONSULATES",
    "PSU",
    "PUBLIC_SECTOR_UNIT",
    "GOVERNMENT_INSTITUTIONS",
]);

export function formatOrganizationTypeLabel(type?: string | null): string {
    if (!type) return "—";
    const canonical = ORGANISATION_TYPES.find((o) => o.value === type);
    if (canonical) return canonical.label;
    if (LEGACY_ORGANIZATION_TYPE_LABELS[type]) return LEGACY_ORGANIZATION_TYPE_LABELS[type];
    return type
        .split("_")
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(" ");
}

/** Normalize a stored organizationType into a wizard-selectable canonical value. */
export function toCanonicalOrganizationType(type?: string | null): CanonicalOrganizationType {
    if (!type) return "CORPORATE";
    if (ORGANISATION_TYPES.some((o) => o.value === type)) {
        return type as CanonicalOrganizationType;
    }
    if (GOVERNMENT_LEGACY_VALUES.has(type)) return "GOVERNMENT_INSTITUTIONS";
    if (type === "TRAVEL_AGENT") return "TRAVEL_AGENT";
    if (type === "CORPORATE") return "CORPORATE";
    return "OTHER";
}

export const ACCOUNT_LEVELS = [
    { value: "MASTER", label: "Master Account / Conglomerate" },
    { value: "PARENT", label: "Parent Account" },
    { value: "BRANCH", label: "Branch Account" },
    { value: "SUBSIDIARY", label: "Subsidiary Account" },
];

/** Industry categories keyed by organization type (Step 2 depends on Step 1). */
export const INDUSTRY_CATEGORIES_BY_ORGANIZATION_TYPE: Record<CanonicalOrganizationType, string[]> = {
    CORPORATE: [
        "Banking & Financial Services",
        "Investment Management / Private Equity / Venture Capital",
        "Insurance",
        "FinTech",
        "Technology / Software / SaaS",
        "Artificial Intelligence & Data",
        "Telecommunications",
        "Media & Entertainment",
        "Advertising, Marketing & PR",
        "Consulting",
        "Legal Services",
        "Accounting & Audit",
        "Healthcare & Hospitals",
        "Pharmaceuticals & Biotechnology",
        "Medical Devices",
        "Manufacturing",
        "Automotive",
        "Aviation & Aerospace",
        "Shipping & Logistics",
        "Energy, Oil & Gas",
        "Renewable Energy",
        "Construction & Infrastructure",
        "Real Estate & Developers",
        "Architecture & Interior Design",
        "Retail & Consumer Goods",
        "Fashion & Luxury Goods",
        "E-commerce",
        "Food & Beverage",
        "Agriculture & Agribusiness",
        "Mining & Metals",
        "Education",
    ],
    GOVERNMENT_INSTITUTIONS: [
        "Government Department",
        "Embassy / Consulate",
        "Public Sector Undertaking (PSU)",
        "Defence & Armed Forces",
        "Education Institution",
        "Research Institution",
        "NGO / Non-Profit",
        "Trade Association / Chamber of Commerce",
    ],
    TRAVEL_AGENT: [
        "Travel Agency B2C",
        "Travel Agency B2B (Primary business)",
        "Foreign Tour operator",
        "Destination Management Company (DMC)",
        "Luxury Travel Advisor (Independent)",
        "MICE / Event Management",
        "Wedding Planner",
        "Concierge Service",
        "Travel Consortium",
    ],
    LIFESTYLE_HIGH_NET_WORTH: [
        "Family Office",
        "Private Members Club",
        "Yacht & Aviation Services",
        "Celebrity / Talent Management",
        "Art & Cultural Organisation",
        "Sports Organisation",
    ],
    OTHER: [
        "Individual / HNI",
        "Startup",
        "Co-working Space",
        "Other",
    ],
};

/** Flat list of all industry category labels (for legacy profile display / search). */
export const INDUSTRY_LIST = Object.entries(INDUSTRY_CATEGORIES_BY_ORGANIZATION_TYPE).flatMap(
    ([orgType, categories]) =>
        categories.map((category) => ({
            category,
            organizationType: orgType,
            subCategories: [] as string[],
        }))
);

/** @deprecated Prefer INDUSTRY_CATEGORIES_BY_ORGANIZATION_TYPE — kept for older imports. */
export const INDUSTRY_CATEGORIES: Record<string, string[]> = Object.fromEntries(
    Object.values(INDUSTRY_CATEGORIES_BY_ORGANIZATION_TYPE)
        .flat()
        .map((category) => [category, [] as string[]])
);

export function getIndustryCategoriesForOrganizationType(
    organizationType?: string | null
): string[] {
    const canonical = toCanonicalOrganizationType(organizationType);
    return INDUSTRY_CATEGORIES_BY_ORGANIZATION_TYPE[canonical] ?? [];
}

export const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export const MAJOR_INDIAN_CITIES = [
    "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna",
    "Vadodara", "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli",
    "Vasai-Virar", "Varanasi", "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad",
    "Ranchi", "Howrah", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati",
    "Chandigarh", "Solapur", "Hubballi-Dharwad", "Bareilly", "Moradabad", "Mysuru", "Gurgaon", "Aligarh",
    "Jalandhar", "Tiruchirappalli", "Bhubaneswar", "Salem", "Mira-Bhayandar", "Warangal", "Thiruvananthapuram",
    "Bhiwandi", "Saharanpur", "Guntur", "Amravati", "Bikaner", "Noida", "Jamshedpur", "Bhilai", "Cuttack",
    "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded",
    "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded",
    "Kolhapur", "Ajmer", "Gulbarga", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar",
    "Jammu", "Sangli-Miraj & Kupwad", "Belgaum", "Mangalore", "Ambattur", "Tirunelveli", "Malegaon",
    "Gaya", "Jalgaon", "Udaipur", "Maheshtala",
    "Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Calangute",
    "Shimla", "Dharamshala", "Manali", "Puducherry"
].sort();

/** State -> cities mapping for filtering city dropdown when state is selected */
export const CITIES_BY_STATE: Record<string, string[]> = {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Navi Mumbai", "Nashik", "Aurangabad", "Solapur", "Mira-Bhayandar", "Bhiwandi", "Nanded", "Kolhapur", "Jalgaon", "Ulhasnagar", "Sangli-Miraj & Kupwad", "Malegaon", "Maheshtala", "Vasai-Virar", "Kalyan-Dombivli"],
    "Delhi": ["Delhi"],
    "Karnataka": ["Bengaluru", "Hubballi-Dharwad", "Mysuru", "Belgaum", "Mangalore", "Gulbarga"],
    "Telangana": ["Hyderabad", "Warangal"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
    "Tamil Nadu": ["Chennai", "Madurai", "Coimbatore", "Tiruchirappalli", "Salem", "Tirunelveli", "Ambattur"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Allahabad", "Varanasi", "Ghaziabad", "Meerut", "Bareilly", "Moradabad", "Aligarh", "Firozabad", "Jhansi", "Loni"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Gwalior", "Jabalpur", "Ujjain"],
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore"],
    "Bihar": ["Patna", "Gaya"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar"],
    "Haryana": ["Faridabad", "Gurgaon"],
    "Jharkhand": ["Dhanbad", "Jamshedpur", "Ranchi"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
    "Chhattisgarh": ["Raipur", "Bhilai"],
    "Assam": ["Guwahati"],
    "Kerala": ["Thiruvananthapuram", "Kochi"],
    "Uttarakhand": ["Dehradun"],
    "Jammu and Kashmir": ["Srinagar", "Jammu"],
    "Chandigarh": ["Chandigarh"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Calangute", "Candolim", "Anjuna", "Baga", "Canacona"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Kullu", "Solan", "Mandi", "Hamirpur"],
    "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Pasighat"],
    "Manipur": ["Imphal"],
    "Meghalaya": ["Shillong"],
    "Mizoram": ["Aizawl"],
    "Nagaland": ["Kohima", "Dimapur"],
    "Sikkim": ["Gangtok"],
    "Tripura": ["Agartala"],
    "Andaman and Nicobar Islands": ["Port Blair"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Daman", "Diu", "Silvassa"],
    "Ladakh": ["Leh", "Kargil"],
    "Lakshadweep": ["Kavaratti"],
};

/** City -> state(s) for Location step (inverse of CITIES_BY_STATE) */
export const STATE_BY_CITY: Record<string, string[]> = (() => {
    const map: Record<string, string[]> = {};
    for (const [state, cities] of Object.entries(CITIES_BY_STATE)) {
        for (const city of cities) {
            if (!map[city]) map[city] = [];
            if (!map[city].includes(state)) map[city].push(state);
        }
    }
    map["Delhi"] = ["Delhi"];
    map["Chandigarh"] = ["Chandigarh"];
    return map;
})();

export function getStatesForCity(city: string): string[] {
    if (!city) return [...INDIAN_STATES];
    const states = STATE_BY_CITY[city];
    if (states?.length) return states;
    return [...INDIAN_STATES];
}

/** Zone → states for Account Location cascade (standard India regions). */
export const STATES_BY_ZONE: Record<string, string[]> = {
    NORTH: [
        "Delhi",
        "Haryana",
        "Punjab",
        "Uttar Pradesh",
        "Uttarakhand",
        "Himachal Pradesh",
        "Jammu and Kashmir",
        "Ladakh",
        "Chandigarh",
        "Rajasthan",
    ],
    SOUTH: [
        "Karnataka",
        "Tamil Nadu",
        "Kerala",
        "Andhra Pradesh",
        "Telangana",
        "Puducherry",
        "Goa",
        "Andaman and Nicobar Islands",
        "Lakshadweep",
    ],
    EAST: [
        "West Bengal",
        "Bihar",
        "Jharkhand",
        "Odisha",
        "Assam",
        "Arunachal Pradesh",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Sikkim",
        "Tripura",
    ],
    WEST: [
        "Maharashtra",
        "Gujarat",
        "Madhya Pradesh",
        "Chhattisgarh",
        "Goa",
        "Dadra and Nagar Haveli and Daman and Diu",
    ],
};

export function getStatesForZone(zone: string): string[] {
    if (!zone) return Object.keys(CITIES_BY_STATE).sort();
    return STATES_BY_ZONE[zone] || Object.keys(CITIES_BY_STATE).sort();
}

export function getCitiesForState(state: string): string[] {
    if (!state) return [];
    return CITIES_BY_STATE[state] || [];
}

export const POTENTIAL_LOCATIONS = [
    { value: "CBD", label: "Commercial Business District" },
    { value: "MICRO_MARKET", label: "Micro Market" },
    { value: "INDUSTRIAL_BELT", label: "Industrial Belt" },
    { value: "NORTH_GEO", label: "North Geo" },
    { value: "SOUTH_GEO", label: "South Geo" },
    { value: "CUSTOM", label: "Any other" },
];

export const POTENTIAL_SEGMENTS = [
    { value: "LUXURY", label: "Luxury" },
    { value: "UPPER_UPSCALE", label: "Upper Upscale" },
    { value: "UPSCALE", label: "Upscale" },
    { value: "MID_SEGMENT", label: "Mid-Segment" },
    { value: "BUDGET", label: "Budget" },
    { value: "GUEST_HOUSE", label: "Guest House" },
];

export const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];
