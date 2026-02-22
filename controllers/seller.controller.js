const { Restaurant, MenuItem, Order, User } = require("../models");

/* ================================================= */
/* ================= RESTAURANT ==================== */
/* ================================================= */

exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    res.json(restaurant || null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

/**
 * ✅ NEW
 * Create or update seller restaurant profile
 * Supports multipart/form-data (image optional)
 */
exports.updateRestaurantProfile = async (req, res) => {
  try {
    const { name, address, contact, cuisines, opening_hours } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    let restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    // cuisines might come as JSON string or comma separated
    // We'll store as string safely (you can later convert to array if you want)
    let cuisinesValue = cuisines;
    if (typeof cuisines === "string") {
      cuisinesValue = cuisines; // keep as string (ex: "Sri Lankan,Chinese")
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (contact !== undefined) updateData.contact = contact;
    if (opening_hours !== undefined) updateData.opening_hours = opening_hours;
    if (cuisinesValue !== undefined) updateData.cuisines = cuisinesValue;
    if (imagePath) updateData.image = imagePath;

    if (!restaurant) {
      // Create new restaurant if not exists
      restaurant = await Restaurant.create({
        seller_id: req.user.id,
        ...updateData,
        is_active: true,
      });

      return res.json({ message: "✅ Restaurant created", restaurant });
    }

    await restaurant.update(updateData);

    res.json({ message: "✅ Restaurant updated", restaurant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update restaurant" });
  }
};

/* ================================================= */
/* ================= MENU ========================== */
/* ================================================= */

exports.getMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    if (!restaurant) return res.json([]);

    const menu = await MenuItem.findAll({
      where: { restaurant_id: restaurant.id },
      order: [["id", "DESC"]],
    });

    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant not found" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    await MenuItem.create({
      restaurant_id: restaurant.id,
      name,
      price: Number(price),
      stock: Number(stock),
      image: imagePath,
      is_available: true,
    });

    res.json({ message: "✅ Menu item added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add menu item" });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { name, price, stock, isAvailable } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // 🔐 Ensure item belongs to this seller
    const menuItem = await MenuItem.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          where: { seller_id: req.user.id },
        },
      ],
    });

    if (!menuItem) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (isAvailable !== undefined) updateData.is_available = isAvailable;
    if (imagePath) updateData.image = imagePath;

    await menuItem.update(updateData);

    res.json({ message: "✅ Menu item updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update menu item" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    // 🔐 Ensure ownership before delete
    const menuItem = await MenuItem.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          where: { seller_id: req.user.id },
        },
      ],
    });

    if (!menuItem) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    await menuItem.destroy();

    res.json({ message: "✅ Menu item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
};

/* ================================================= */
/* ================= ORDERS ======================== */
/* ================================================= */

exports.getOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    if (!restaurant) return res.json([]);

    const orders = await Order.findAll({
      where: { restaurant_id: restaurant.id },
      include: [
        {
          model: User,
          as: "customer",
          attributes: ["id", "email", "name"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [updatedCount] = await Order.update(
      { status },
      {
        where: {
          id: req.params.id,
          restaurant_id: restaurant.id,
        },
      },
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "✅ Order status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order" });
  }
};

/* ================================================= */
/* ================= ANALYTICS ===================== */
/* ================================================= */

exports.getAnalytics = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    if (!restaurant) return res.json([]);

    const menuItems = await MenuItem.findAll({
      where: { restaurant_id: restaurant.id },
      attributes: ["name", "stock", "price"],
    });

    res.json(menuItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics failed" });
  }
};

/* ================================================= */
/* ================= FORECAST ====================== */
/* ================================================= */
const axios = require("axios");
exports.getForecast = async (req, res) => {
  try {
    // 🔐 Get user ID from JWT token
    const userId = req.user.id;

    const restaurant = await Restaurant.findOne({
      where: { seller_id: userId },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Get last 30 days of orders
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrders = await Order.findAll({
      where: {
        restaurant_id: restaurant.id,
        created_at: {
          [require("sequelize").Op.gte]: thirtyDaysAgo,
        },
      },
      order: [["created_at", "ASC"]],
      attributes: ["id", "total_amount", "created_at"],
    });

    if (recentOrders.length === 0) {
      return res.status(400).json({
        message: "Not enough order data for forecasting",
      });
    }

    // 📊 Group orders by date and sum total sales for each day
    const dailySales = {};
    recentOrders.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0]; // YYYY-MM-DD
      if (!dailySales[date]) {
        dailySales[date] = 0;
      }
      // Add order amount to daily total
      dailySales[date] += parseFloat(order.total_amount) || 0;
    });

    // 📅 Get sorted dates and sales
    const sortedDates = Object.keys(dailySales).sort();
    const salesData = sortedDates.map((date) => dailySales[date]);

    if (salesData.length < 3) {
      return res.status(400).json({
        message: "Need at least 3 days of order data for forecasting",
      });
    }

    // 🔢 Create numbered days array [1, 2, 3, 4, 5, ...]
    const days = Array.from({ length: salesData.length }, (_, i) => i + 1);

    console.log("📊 Daily Sales Data:", { days, sales: salesData });
    // ✅ Call FastAPI forecasting service
    // Set this in .env as FASTAPI_URL=http://127.0.0.1:8000
    const FASTAPI_URL = (
      process.env.FASTAPI_URL || "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    // You can change endpoint name if yours is different:
    // e.g. /forecast or /predict
    const response = await axios.post(`${FASTAPI_URL}/forecast`, {
      days,
      sales: salesData,
      dates: sortedDates, // optional but useful
    });

    // Expecting something like:
    // { forecast: [..], next_days: [..] } OR any json
    return res.json({
      message: "✅ Forecast generated",
      input: { dates: sortedDates, days, sales: salesData },
      result: response.data,
    });
  } catch (err) {
    console.error("Forecast Error:", err?.response?.data || err.message || err);

    return res.status(500).json({
      message: "Failed to generate forecast",
      error: err?.response?.data || err.message || "Unknown error",
    });
  }
};
