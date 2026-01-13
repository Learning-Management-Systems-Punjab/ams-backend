import dotenv from "dotenv";
dotenv.config();

import connectDB from "../src/Configs/database/connection.js";
import { importStudentsFromCSV } from "../src/utils/csvImporter.js";
import College from "../src/models/college.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const seedStudentsFromCSV = async () => {
  try {
    // Connect to database
    await connectDB();

    // Get college (you can change this to match your college)
    // For now, we'll assume you have a college with a specific code or name
    const college = await College.findOne({ isActive: true });

    if (!college) {
      console.error("❌ No college found. Please create a college first.");
      process.exit(1);
    }

    console.log(`✅ Found college: ${college.name}`);
    console.log(`📁 College ID: ${college._id}`);

    // Path to CSV file
    const csvPath = path.join(__dirname, "../Context/Student Data.csv");

    console.log(`\n📥 Importing students from: ${csvPath}`);
    console.log("⏳ Processing...\n");

    // Import students
    const results = await importStudentsFromCSV(csvPath, college._id);

    // Display results
    console.log("═══════════════════════════════════════");
    console.log("📊 IMPORT RESULTS");
    console.log("═══════════════════════════════════════");
    console.log(`✅ Total rows processed: ${results.total}`);
    console.log(`✅ Successfully imported: ${results.success}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log("═══════════════════════════════════════\n");

    if (results.errors.length > 0) {
      console.log("⚠️  ERRORS:");
      results.errors.forEach((error, index) => {
        console.log(`${index + 1}. Row ${error.row}: ${error.error}`);
        if (error.rollNumber) {
          console.log(`   Roll Number: ${error.rollNumber}`);
        }
      });
      console.log("");
    }

    console.log(`✅ Import completed successfully!`);
    console.log(`📚 Students imported: ${results.success}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error importing students:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
};

seedStudentsFromCSV();
