const { User, Customer, Restaurant, sequelize } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ================================================= */
/* ================= LOGIN ========================= */
/* ================================================= */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* 🔎 1. Check user exists */
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* 🔐 2. Check password first */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* 🚦 3. Check account status */
    if (user.status === "PENDING") {
      return res.status(403).json({
        message: "Your account is waiting for admin approval.",
      });
    }

    if (user.status === "REJECTED") {
      return res.status(403).json({
        message: "Your registration was rejected by admin.",
      });
    }

    if (user.status === "SUSPENDED") {
      return res.status(403).json({
        message: "Your account has been suspended. Contact admin.",
      });
    }

    /* ✅ Only APPROVED users reach here */

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      id: user.id,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================================================= */
/* ================= REGISTER ====================== */
/* ================================================= */

exports.register = async (req, res) => {
  try {
    const {
      // shared
      name,
      email,
      password,
      role,

      // customer
      age,
      gender,
      genderOtherText,
      dietaryPref,
      favoriteCuisine,

      // seller
      restaurantName,
      contactNumber,
      restaurantAddress,
      restaurantCuisines,
    } = req.body;

    /* 🧾 1. Validate input */
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* 🔎 2. Check if email already exists */
    const existing = await User.findOne({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    /* 🔐 3. Hash password */
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Role-specific validation (matches your updated frontend register form) ---
    if (role === "CUSTOMER") {
      if (!age || Number(age) <= 0) {
        return res.status(400).json({ message: "Valid age is required" });
      }
      if (!gender) {
        return res.status(400).json({ message: "Gender is required" });
      }
      if (gender === "Other" && !genderOtherText) {
        return res
          .status(400)
          .json({ message: "Please specify your gender (Other)" });
      }
      if (!Array.isArray(dietaryPref) || dietaryPref.length === 0) {
        return res
          .status(400)
          .json({ message: "Select at least one dietary preference" });
      }
      if (!favoriteCuisine) {
        return res
          .status(400)
          .json({ message: "Favorite cuisine is required" });
      }
    }

    if (role === "SELLER") {
      if (!restaurantName) {
        return res.status(400).json({ message: "Restaurant name is required" });
      }
      if (!contactNumber) {
        return res.status(400).json({ message: "Contact number is required" });
      }
      if (!restaurantAddress) {
        return res
          .status(400)
          .json({ message: "Restaurant address/area is required" });
      }
      if (
        !Array.isArray(restaurantCuisines) ||
        restaurantCuisines.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Select at least one restaurant cuisine" });
      }
    }

    /* 🚦 4. Set default status */
    const status = role === "SELLER" ? "PENDING" : "APPROVED";

    /* 💾 5. Create records in a transaction */
    await sequelize.transaction(async (t) => {
      const newUser = await User.create(
        {
          name,
          email,
          password: hashedPassword,
          role,
          status,
        },
        { transaction: t },
      );

      if (role === "CUSTOMER") {
        await Customer.create(
          {
            user_id: newUser.id,
            age: Number(age),
            gender,
            gender_other_text: gender === "Other" ? genderOtherText : null,
            dietary_preferences: dietaryPref,
            favorite_cuisine: favoriteCuisine,
            order_history: [],
          },
          { transaction: t },
        );
      }

      if (role === "SELLER") {
        // Create a restaurant shell for the seller.
        // Keep restaurant INACTIVE until admin approves the seller.
        await Restaurant.create(
          {
            seller_id: newUser.id,
            name: restaurantName,
            contact_number: contactNumber,
            address: restaurantAddress,
            cuisines: restaurantCuisines,
            status: "INACTIVE",
          },
          { transaction: t },
        );
      }
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
