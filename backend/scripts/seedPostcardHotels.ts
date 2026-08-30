import "dotenv/config";
import mongoose from "mongoose";
import { config } from "../src/config/env";
import { PropertyModel } from "../src/models/property";
import {
  POSTCARD_HOTELS,
  POSTCARD_HOTEL_NAMES,
  makePropertyCode,
} from "../src/constants/postcardHotels";

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function seedPostcardHotels() {
  let upserted = 0;
  let created = 0;

  for (const hotel of POSTCARD_HOTELS) {
    const exactNameRegex = new RegExp(`^${escapeRegex(hotel.name)}$`, "i");
    const existing = await PropertyModel.findOne({ name: { $regex: exactNameRegex } })
      .select("_id")
      .lean();

    const code = makePropertyCode(hotel.name);

    await PropertyModel.findOneAndUpdate(
      { name: { $regex: exactNameRegex } },
      {
        $set: {
          name: hotel.name,
          code,
          location: hotel.location,
          roomTypes: hotel.roomTypes,
          status: "ACTIVE",
          pmsProvider: "NONE",
        },
      },
      { upsert: true, new: true }
    );

    upserted++;
    if (!existing) created++;
  }

  const deactivateResult = await PropertyModel.updateMany(
    {
      name: { $nin: POSTCARD_HOTEL_NAMES },
      status: "ACTIVE",
    },
    { $set: { status: "INACTIVE" } }
  );

  console.log(
    `Seeded ${POSTCARD_HOTELS.length} Postcard hotels, ${upserted} upserted, ${created} created`
  );
  console.log(
    `Deactivated ${deactivateResult.modifiedCount} properties not in the final hotel list`
  );
}

if (require.main === module) {
  mongoose
    .connect(config.mongoUri)
    .then(() => seedPostcardHotels())
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error("Failed to seed Postcard hotels:", error);
      await mongoose.disconnect().catch(() => undefined);
      process.exit(1);
    });
}
