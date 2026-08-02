import {
  saveAccountPotential,
  type LocationType,
  type SegmentType,
} from "@/services/accountPotentials";
import type { HotelSegment, InboundSegment, TravelTradeProfile } from "@/types/travelTradeProfile";

function mapHotelSegment(seg: HotelSegment | undefined): SegmentType {
  switch (seg) {
    case "LUXURY":
      return "LUXURY";
    case "MID_SEGMENT":
      return "MID_SEGMENT";
    case "BUDGET":
      return "BUDGET";
    case "ECONOMY":
      return "GUEST_HOUSE";
    default:
      return "UPSCALE";
  }
}

function emptyBucket() {
  return { roomNights: 0, roomRevenue: 0 };
}

/**
 * Seed AccountPotential rows from Travel Trade inbound hotel/city mappings
 * and per-segment room nights so inbound data is not siloed from Market Potential.
 */
export async function seedInboundMarketPotentials(
  accountId: string,
  profile?: TravelTradeProfile | null
): Promise<number> {
  const inbound = profile?.inbound;
  if (!inbound?.hotelMappings?.length) return 0;

  const year = new Date().getFullYear();
  const primaryHotelSeg = inbound.hotelSegments?.[0];
  const segment = mapHotelSegment(primaryHotelSeg);
  const location: LocationType = "CUSTOM";

  const fitRn = Number(inbound.segmentRoomNights?.FIT || 0) || 0;
  const luxuryRn = Number(inbound.segmentRoomNights?.LUXURY || 0) || 0;
  const groupRn =
    (Number(inbound.segmentRoomNights?.GROUPS || 0) || 0) +
    (Number(inbound.segmentRoomNights?.MICE || 0) || 0) +
    (Number(inbound.segmentRoomNights?.CHARTERS || 0) || 0);

  const remarksParts: string[] = [];
  for (const seg of inbound.segments as InboundSegment[]) {
    const markets = inbound.segmentMarkets?.[seg] ?? [];
    const rn = inbound.segmentRoomNights?.[seg];
    if (markets.length || rn) {
      remarksParts.push(
        `${seg}: ${markets.join(", ") || "—"}${rn != null ? ` (${rn} RN)` : ""}`
      );
    }
  }

  let seeded = 0;
  for (const mapping of inbound.hotelMappings) {
    const city = mapping.city?.trim();
    if (!city) continue;
    try {
      await saveAccountPotential(accountId, {
        accountId,
        city,
        location,
        customLocation: mapping.propertyName || mapping.propertyId,
        segment,
        fitPotential: { ...emptyBucket(), roomNights: fitRn + luxuryRn },
        groupPotential: { ...emptyBucket(), roomNights: groupRn },
        longStayPotential: emptyBucket(),
        banquetPotential: { events: 0, revenue: 0 },
        competitors: [],
        remarks: remarksParts.length
          ? `Seeded from Travel Trade inbound — ${remarksParts.join("; ")}`
          : "Seeded from Travel Trade inbound hotel mapping",
        year,
      });
      seeded += 1;
    } catch {
      // Non-blocking: account create should succeed even if potential seed fails
    }
  }
  return seeded;
}
