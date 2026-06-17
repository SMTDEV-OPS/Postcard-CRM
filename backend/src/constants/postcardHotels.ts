export interface PostcardHotelSeed {
  name: string;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

export const POSTCARD_HOTELS: PostcardHotelSeed[] = [
  { name: "The Postcard in the Himalayan Willows", location: { country: "India" } },
  { name: "The Postcard in the Durrung Tea Estate", location: { state: "Assam", country: "India" } },
  { name: "The Postcard on the Mandovi River, North Goa", location: { state: "Goa", country: "India" } },
  { name: "The Postcard Saligao", location: { city: "Saligao", state: "Goa", country: "India" } },
  { name: "The Postcard Ayurveda Retreat, Old Goa", location: { state: "Goa", country: "India" } },
  { name: "The Postcard Cuelim", location: { state: "Goa", country: "India" } },
  { name: "The Postcard Hideaway, Netravali", location: { state: "Goa", country: "India" } },
  { name: "The Postcard Gir Wildlife Sanctuary", location: { state: "Gujarat", country: "India" } },
  { name: "The Postcard Mandalay Hall", location: { country: "India" } },
  { name: "The Postcard on the Arabian Sea, Maravanthe Beach", location: { state: "Karnataka", country: "India" } },
  { name: "The Postcard Dewa, Thimphu", location: { city: "Thimphu", country: "Bhutan" } },
  { name: "The Postcard Galle", location: { city: "Galle", country: "Sri Lanka" } },
  { name: "The Postcard Chicalim, South Goa", location: { state: "Goa", country: "India" } },
  { name: "The Postcard on the Rapti River, Chitwan, Nepal", location: { city: "Chitwan", country: "Nepal" } },
  { name: "The Postcard Jawai Leopard Reserve, Rajasthan", location: { state: "Rajasthan", country: "India" } },
  { name: "The Postcard Kanha Tiger Reserve", location: { state: "Madhya Pradesh", country: "India" } },
  { name: "The Postcard Pench Tiger Reserve, Madhya Pradesh", location: { state: "Madhya Pradesh", country: "India" } },
  { name: "The Postcard, Tirupati", location: { city: "Tirupati", state: "Andhra Pradesh", country: "India" } },
  { name: "The Postcard on the Siang River, Pasighat", location: { city: "Pasighat", state: "Arunachal Pradesh", country: "India" } },
];

export function makePropertyCode(name: string): string {
  const base = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base || `PROPERTY_${Date.now()}`;
}
