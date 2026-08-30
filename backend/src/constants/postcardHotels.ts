export interface PostcardHotelRoomType {
  name: string;
  inventoryCount: number;
}

export interface PostcardHotelSeed {
  name: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  roomTypes: PostcardHotelRoomType[];
}

/** Final master list of Postcard hotels and room types (inventory). */
export const POSTCARD_HOTELS: PostcardHotelSeed[] = [
  {
    name: "The Postcard on the Arabian Sea, Karnataka",
    location: { state: "Karnataka", country: "India" },
    roomTypes: [
      { name: "Ocean Front Luxury Room (450 sq ft)", inventoryCount: 1 },
      { name: "Ocean View Premier Room (550 sqft)", inventoryCount: 2 },
      { name: "Ocean Front Premier Room (55 sqft)", inventoryCount: 5 },
      {
        name: "Duplex Suite (550 sqft spread on 3 floors with stairs in room)",
        inventoryCount: 1,
      },
    ],
  },
  {
    name: "The Postcard Cuelim, South Goa",
    location: { state: "Goa", country: "India" },
    roomTypes: [
      { name: "1 TB Cunha Suite (1st Floor) 900 Sqft", inventoryCount: 1 },
      { name: "Cuelim Suite (1st Floor) 800 Sqft", inventoryCount: 1 },
      { name: "Premier Room with Private Patio (gr.Floor) 750 sqft", inventoryCount: 2 },
      { name: "Luxury Room with Private Patio (gr floor): 550 sqft", inventoryCount: 2 },
    ],
  },
  {
    name: "The Postcard Dewa Bhutan",
    location: { country: "Bhutan" },
    roomTypes: [
      {
        name: "Luxury Room: 885 sqft with private terrace with Bathtubs (downstairs from lobby 3rd floor)",
        inventoryCount: 4,
      },
      {
        name: "Premier Room: 995 sq. ft with private terrace with bath tubs (Downstairs from lobby 3rd and 2nd floor)",
        inventoryCount: 9,
      },
      {
        name: "Premier Suite: 2100 sq ft with private terrace with bath tubs (Downstairs from lobby 2nd floor)",
        inventoryCount: 1,
      },
      {
        name: "Dewa Suite: 2200 sq ft with private terrace with bath tubs (Downstairs from Lobby 1st floor)",
        inventoryCount: 1,
      },
    ],
  },
  {
    name: "The Postcard in the Durrung Tea Estate, Assam",
    location: { state: "Assam", country: "India" },
    roomTypes: [
      {
        name: "Bungalow Room: Main Bungalow Gr. Floor 550 sqft (with bathtub)",
        inventoryCount: 1,
      },
      {
        name: "Bungalow Suite: Main Bungalow 1 room on Gr Floor and 2 on 1st floor; 1100 sq ft (with Bathtub)",
        inventoryCount: 3,
      },
      {
        name: "Luxury Chalet: located in Tea estate Gr. Floor access 800 sqft (with Bathtub)",
        inventoryCount: 8,
      },
    ],
  },
  {
    name: "The Postcard Galle, Sri Lanka",
    location: { city: "Galle", country: "Sri Lanka" },
    roomTypes: [
      {
        name: "Luxury Room: 550 sqft; 2 adjacent on Gr. Floor and 2 adjacent on 1st floor",
        inventoryCount: 4,
      },
      { name: "Attic Suite: 850 sqft; 2 adjacent on 1st floor", inventoryCount: 2 },
      { name: "Premier Room: 950 sqft; Gr. Floor in Spa Block", inventoryCount: 1 },
      {
        name: "Premier Suite with Jacuzzi: 950-1000 sqft; 1st floor, 1 room in Spa block and 1 in Main block",
        inventoryCount: 2,
      },
      {
        name: "Premier Suite with Plunge Pool: 1050 sqft; Gr. floor in main block",
        inventoryCount: 1,
      },
    ],
  },
  {
    name: "The Postcard Gir Wildlife Sanctuary, Gujarat",
    location: { state: "Gujarat", country: "India" },
    roomTypes: [
      { name: "Luxury Room: 650 sq ft (standing shower)", inventoryCount: 3 },
      { name: "Premier Room: 750 sqft (standing shower)", inventoryCount: 12 },
    ],
  },
  {
    name: "The Postcard in the Himalayan Willows, Stok, Leh",
    location: { city: "Stok", state: "Ladakh", country: "India" },
    roomTypes: [
      {
        name: "Willow Suite: 1000 sqft Suite rooms with retractable walls between Sitting room and bed room, standing shower, heated floors",
        inventoryCount: 5,
      },
    ],
  },
  {
    name: "The Postcard Mandalay Hall Kochi",
    location: { city: "Kochi", state: "Kerala", country: "India" },
    roomTypes: [
      { name: "Gallery 1: 1st floor 750 sqft (With Bathtub)", inventoryCount: 1 },
      { name: "Gallery 2: 1st Floor 750 sqft (With Bathtub)", inventoryCount: 1 },
      {
        name: "Gallery 3: 1st floor 800 sqft (With Bathtub) and bed can be converted to twin bed",
        inventoryCount: 1,
      },
      { name: "Gallery 4: Gr. Floor 500 sqft (standing Shower)", inventoryCount: 1 },
      { name: "Gallery 5: 1st Floor 500 sq ft (standing Shower)", inventoryCount: 1 },
    ],
  },
  {
    name: "The Postcard on the Mandovi River, North Goa",
    location: { state: "Goa", country: "India" },
    roomTypes: [
      { name: "Luxury Room: 700 sq ft (all with standing shower)", inventoryCount: 7 },
      { name: "Premier Room: 1000 sq ft (with bath tub)", inventoryCount: 8 },
      { name: "Mangrove Suite: 1600 sq ft (with bath tub)", inventoryCount: 1 },
      {
        name: "Mandovi Suite (2BDR): 3200 sq ft two bed room suite (with bathtub)",
        inventoryCount: 1,
      },
    ],
  },
  {
    name: "The Postcard Hideaway, Netravali, South Goa (Western Ghats)",
    location: { state: "Goa", country: "India" },
    roomTypes: [
      {
        name: "Luxury Room with private Patio (550 sqft) 2 out of 10 Luxury Rooms have bath Tub",
        inventoryCount: 10,
      },
      {
        name: "Premier Room with private patio (650 sqft) all standing shower",
        inventoryCount: 10,
      },
    ],
  },
  {
    name: "The Postcard Saligao, North Goa",
    location: { city: "Saligao", state: "Goa", country: "India" },
    roomTypes: [
      { name: "Luxury Room (Gr. Floor 500sqft standing shower)", inventoryCount: 2 },
      {
        name: "Premier Room (1st Floor, 650 sqft with Bathtub and private balcony)",
        inventoryCount: 1,
      },
      {
        name: "Premier Suite (1st floor, 850 sqft adjacent rooms with bathtub)",
        inventoryCount: 2,
      },
    ],
  },
  {
    name: "The Postcard Ayurveda Retreat A SITARAM AYURVEDA EXPERIENCE, Old Goa",
    location: { state: "Goa", country: "India" },
    roomTypes: [
      {
        name: "Banyan Villa Rooms: 550 sqft rooms 1 on Gr. Floor + 2 on 1st floor",
        inventoryCount: 3,
      },
      {
        name: "Mandovi Villa Rooms: 650 sqft rooms 1 on Gr. Floor + 2 on 1st floor",
        inventoryCount: 3,
      },
    ],
  },
];

export const POSTCARD_HOTEL_NAMES = POSTCARD_HOTELS.map((h) => h.name);

export function makePropertyCode(name: string): string {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || `PROPERTY_${Date.now()}`;
}
