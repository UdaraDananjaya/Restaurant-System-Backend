const { User } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================================================= */
/* ================= LOGIN (SEQUELIZE) ============= */
/* ================================================= */

exports.loginWithSequelize = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* 🔎 1. Check user exists */
    const user = await User.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* 🔐 2. Check password */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* 🚦 3. Check account status */
    if (user.status === "PENDING") {
      return res.status(403).json({
        message: "Your account is pending approval by admin.",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        message: "Your account has been suspended.",
      });
    }

    /* 🎫 4. Generate JWT */
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================================================= */
/* ================= REGISTER (SEQUELIZE) ========== */
/* ================================================= */

exports.registerWithSequelize = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    /* 🔹 1. Validate role */
    if (!["CUSTOMER", "SELLER"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    /* 🔹 2. Check if user exists */
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    /* 🔹 3. Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* 🔹 4. Determine status */
    const status = role === "SELLER" ? "PENDING" : "APPROVED";

    /* 🔹 5. Create user using Sequelize */
    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      status
    });

    /* 🎯 6. Send response */
    res.status(201).json({
      message:
        role === "SELLER"
          ? "Seller registered successfully. Awaiting admin approval."
          : "Customer registered successfully.",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

