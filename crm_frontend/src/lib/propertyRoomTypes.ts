import type { Property } from "@/services/properties";

/** Room type names for a hotel selected by name or property id. */
export function getRoomTypesForProperty(
  properties: Property[] | undefined | null,
  hotelNameOrId?: string | null
): string[] {
  if (!properties?.length || !hotelNameOrId?.trim()) return [];
  const key = hotelNameOrId.trim();
  const property =
    properties.find((p) => p._id === key) ||
    properties.find((p) => p.name === key) ||
    properties.find((p) => p.name.toLowerCase() === key.toLowerCase());
  if (!property?.roomTypes?.length) return [];
  return property.roomTypes
    .map((r) => r.name?.trim())
    .filter((name): name is string => !!name);
}
