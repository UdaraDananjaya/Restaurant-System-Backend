const { Restaurant, MenuItem, Order, User, Sequelize } = require("../models");
const axios = require("axios");

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
    console.error("getRestaurant Error:", err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

/**
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (contact !== undefined) updateData.contact = contact;
    if (opening_hours !== undefined) updateData.opening_hours = opening_hours;

    // cuisines may come as JSON string or comma-separated; store as string
    if (cuisines !== undefined) updateData.cuisines = String(cuisines);

    if (imagePath) updateData.image = imagePath;

    if (!restaurant) {
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
    console.error("updateRestaurantProfile Error:", err);
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
    console.error("getMenu Error:", err);
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
    console.error("addMenuItem Error:", err);
    res.status(500).json({ message: "Failed to add menu item" });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { name, price, stock, isAvailable } = req.body;

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Ensure item belongs to this seller
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

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (isAvailable !== undefined) updateData.is_available = isAvailable;
    if (imagePath) updateData.image = imagePath;

    await menuItem.update(updateData);

    res.json({ message: "✅ Menu item updated" });
  } catch (err) {
    console.error("updateMenuItem Error:", err);
    res.status(500).json({ message: "Failed to update menu item" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
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
    console.error("deleteMenuItem Error:", err);
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
    console.error("getOrders Error:", err);
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
    console.error("updateOrderStatus Error:", err);
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
    console.error("getAnalytics Error:", err);
    res.status(500).json({ message: "Analytics failed" });
  }
};

/* ================================================= */
/* ================= FORECAST ====================== */
/* ================================================= */

exports.getForecast = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // ✅ Better: get last 14 days daily sales totals (not last 5 orders)
    const since = new Date();
    since.setDate(since.getDate() - 14);

    const daily = await Order.findAll({
      where: {
        restaurant_id: restaurant.id,
        created_at: { [Sequelize.Op.gte]: since },
      },
      attributes: [
        // for MySQL: DATE(created_at)
        [Sequelize.fn("DATE", Sequelize.col("created_at")), "day"],
        [Sequelize.fn("SUM", Sequelize.col("total_amount")), "total"],
      ],
      group: [Sequelize.fn("DATE", Sequelize.col("created_at"))],
      order: [[Sequelize.fn("DATE", Sequelize.col("created_at")), "ASC"]],
      raw: true,
    });

    // If not enough data, return safe response (so dashboard won't break)
    if (!daily || daily.length < 3) {
      return res.json({
        forecast: [],
        note: "Not enough order data for forecasting (need at least 3 days).",
      });
    }

    const sales = daily.map((d) => Number(d.total));
    const days = sales.map((_, idx) => idx + 1);

    const ML_BASE_URL = (
      process.env.ML_BASE_URL || "http://127.0.0.1:8000"
    ).replace(/\/$/, "");

    // Call ML forecast API
    const response = await axios.post(
      `${ML_BASE_URL}/forecast`,
      { days, sales },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        timeout: 8000, // ✅ avoid hanging forever
      },
    );

    res.json({
      forecast: response.data?.next_7_days_forecast || [],
    });
  } catch (err) {
    // ✅ log useful details
    console.error("Forecast Error:", err.response?.data || err.message);

    // ✅ do not kill dashboard; return safe response
    return res.json({
      forecast: [],
      note: "ML service unavailable or forecast failed.",
    });
  }
};
