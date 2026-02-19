const bcrypt = require("bcryptjs");
const { User } = require("../models");

const seedAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("ℹ️ Admin already exists – skipping seed");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "System Admin",
      email: "admin@restaurant.com",
      password: hashedPassword,
      role: "ADMIN",
      status: "APPROVED",
    });

    console.log("🔥 Admin seeded successfully");
  } catch (err) {
    console.error("Admin seed error:", err);
  }
};

module.exports = seedAdmin;
