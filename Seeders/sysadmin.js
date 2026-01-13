import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import connectDB from "../src/Configs/database/connection.js";
import User from "../src/models/user.js";
import SysAdmin from "../src/models/sys-admin.js";

const seedSysAdmin = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({ role: "SysAdmin" });
    if (existingUser) {
      console.log("⚠️  SysAdmin already exists!");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const user = await User.create({
      email: "admin@ams.com",
      password: hashedPassword,
      role: "SysAdmin",
      isActive: true,
    });

    console.log("✅ User created:", user.email);

    const sysAdmin = await SysAdmin.create({
      name: "System Administrator",
      contactNumber: "+92-300-1234567",
      email: "admin@ams.com",
      image: null,
      cnic: "12345-1234567-1",
      gender: "Male",
      userId: user._id,
      isActive: true,
    });

    console.log("✅ SysAdmin profile created:", sysAdmin.name);
    console.log("\n📧 Email: admin@ams.com");
    console.log("🔑 Password: admin123\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding SysAdmin:", error.message);
    process.exit(1);
  }
};

seedSysAdmin();
