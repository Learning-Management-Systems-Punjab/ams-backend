import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.staging" });

/**
 * Migration Script: Fix Student Roll Number Index
 *
 * This script:
 * 1. Drops any old unique index on rollNumber alone
 * 2. Ensures the compound unique index (collegeId + rollNumber) exists
 *
 * Run with: node Migrations/fix-student-rollnumber-index.js
 */

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error(
    "❌ Error: MONGO_URI or MONGODB_URI not found in environment variables"
  );
  process.exit(1);
}

async function fixStudentRollNumberIndex() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const studentsCollection = db.collection("students");

    console.log("\n📊 Checking existing indexes...");
    const indexes = await studentsCollection.indexes();

    console.log("Current indexes:");
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Check if there's a unique index on rollNumber alone
    const rollNumberIndex = indexes.find(
      (idx) =>
        idx.key.rollNumber === 1 && !idx.key.collegeId && idx.unique === true
    );

    if (rollNumberIndex) {
      console.log(
        `\n⚠️  Found problematic unique index on rollNumber alone: ${rollNumberIndex.name}`
      );
      console.log("🗑️  Dropping index...");
      await studentsCollection.dropIndex(rollNumberIndex.name);
      console.log("✅ Index dropped successfully");
    } else {
      console.log("\n✅ No problematic unique index found on rollNumber alone");
    }

    // Check if compound index exists
    const compoundIndex = indexes.find(
      (idx) =>
        idx.key.collegeId === 1 &&
        idx.key.rollNumber === 1 &&
        idx.unique === true
    );

    if (compoundIndex) {
      console.log(
        `\n✅ Compound unique index already exists: ${compoundIndex.name}`
      );
    } else {
      console.log(
        "\n⚠️  Compound unique index (collegeId + rollNumber) not found"
      );
      console.log("📝 Creating compound unique index...");
      await studentsCollection.createIndex(
        { collegeId: 1, rollNumber: 1 },
        { unique: true, name: "collegeId_1_rollNumber_1" }
      );
      console.log("✅ Compound unique index created successfully");
    }

    console.log("\n📊 Final indexes:");
    const finalIndexes = await studentsCollection.indexes();
    finalIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
      if (index.unique) {
        console.log(`    (unique: true)`);
      }
    });

    console.log("\n✅ Migration completed successfully!");
    console.log(
      "\n📝 Summary: Roll number is now unique per college (composite key)"
    );
    console.log(
      "   - Two different colleges CAN have students with the same roll number ✅"
    );
    console.log("   - Within the same college, roll numbers MUST be unique ✅");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Disconnected from MongoDB");
  }
}

// Run migration
fixStudentRollNumberIndex();
