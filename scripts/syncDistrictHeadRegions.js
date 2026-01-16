import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Import models
import DistrictHead from "../src/models/district-head.js";
import Region from "../src/models/region.js";

/**
 * Sync district head assignments with regions
 * This script updates the Region's districtHeadId field based on DistrictHead's regionId
 */
async function syncDistrictHeadRegions() {
  try {
    console.log("🔄 Connecting to database...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to database");

    // First, clear all existing districtHeadId references in regions
    console.log("\n🧹 Clearing existing region assignments...");
    await Region.updateMany({}, { districtHeadId: null });
    console.log("✅ Cleared all region assignments");

    // Get all active district heads
    console.log("\n📊 Fetching active district heads...");
    const districtHeads = await DistrictHead.find({ isActive: true }).select(
      "_id regionId name"
    );
    console.log(`✅ Found ${districtHeads.length} active district heads`);

    // Update regions with their assigned district heads
    console.log("\n🔗 Syncing region assignments...");
    let syncedCount = 0;
    let skippedCount = 0;

    for (const dh of districtHeads) {
      if (dh.regionId) {
        try {
          const result = await Region.findByIdAndUpdate(
            dh.regionId,
            { districtHeadId: dh._id },
            { new: true }
          );

          if (result) {
            console.log(
              `  ✓ Synced: ${dh.name} -> Region: ${result.name} (${result.code})`
            );
            syncedCount++;
          } else {
            console.log(
              `  ⚠ Region not found for district head: ${dh.name} (regionId: ${dh.regionId})`
            );
            skippedCount++;
          }
        } catch (error) {
          console.log(`  ✗ Error syncing ${dh.name}: ${error.message}`);
          skippedCount++;
        }
      } else {
        console.log(`  - Skipped: ${dh.name} (no region assigned)`);
        skippedCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📈 Sync Summary:");
    console.log(`   Total District Heads: ${districtHeads.length}`);
    console.log(`   Successfully Synced: ${syncedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log("=".repeat(60));

    // Verify sync
    console.log("\n🔍 Verifying sync...");
    const regionsWithDH = await Region.countDocuments({
      districtHeadId: { $ne: null },
    });
    const totalRegions = await Region.countDocuments({ isActive: true });
    const assignmentRate = ((regionsWithDH / totalRegions) * 100).toFixed(2);

    console.log(`   Regions with District Heads: ${regionsWithDH}`);
    console.log(`   Total Active Regions: ${totalRegions}`);
    console.log(`   Assignment Rate: ${assignmentRate}%`);

    console.log("\n✅ Sync completed successfully!");
  } catch (error) {
    console.error("\n❌ Error during sync:", error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log("\n🔌 Disconnected from database");
  }
}

// Run the sync
syncDistrictHeadRegions()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
