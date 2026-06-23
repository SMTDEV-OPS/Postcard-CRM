import "dotenv/config";
import mongoose from "mongoose";
import { config } from "../src/config/env";
import { logger } from "../src/config/logger";
import { UserModel } from "../src/models/user";
import { RoleModel } from "../src/models/role";
import { ProfileModel } from "../src/models/profile";

/**
 * Assigns profileId to active users who have a role but no profile.
 * Users with "Admin Role" receive the Admin profile; others receive Sales Executive when available.
 */
async function assignMissingUserProfiles() {
  await mongoose.connect(config.mongoUri);
  logger.info("Connected to MongoDB");

  const adminProfile = await ProfileModel.findOne({ name: "Admin" });
  const salesProfile = await ProfileModel.findOne({ name: "Sales Executive" });
  const reservationsProfile = await ProfileModel.findOne({ name: "Reservations" });

  if (!adminProfile) {
    throw new Error('Admin profile not found — run seed:admin or ensureDefaultProfiles first');
  }

  const users = await UserModel.find({
    status: "ACTIVE",
    $or: [{ profileId: null }, { profileId: { $exists: false } }],
  });

  logger.info(`Found ${users.length} active users missing profileId`);

  let updated = 0;
  for (const user of users) {
    let profileId = salesProfile?._id ?? reservationsProfile?._id ?? adminProfile._id;

    if (user.roleId) {
      const role = await RoleModel.findById(user.roleId).lean();
      if (role?.name?.toLowerCase() === "admin role") {
        profileId = adminProfile._id;
      }
    }

    user.profileId = profileId;
    await user.save();
    updated += 1;
    logger.info(`Assigned profile to ${user.email}`, {
      profileId: profileId.toString(),
    });
  }

  logger.info(`Done — updated ${updated} user(s)`);
  await mongoose.disconnect();
}

assignMissingUserProfiles().catch((err) => {
  logger.error("assignMissingUserProfiles failed", { err });
  process.exit(1);
});
