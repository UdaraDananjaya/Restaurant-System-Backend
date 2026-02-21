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

exports.getForecast = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Get last 5 days orders (example logic)
    const recentOrders = await Order.findAll({
      where: { restaurant_id: restaurant.id },
      order: [["created_at", "DESC"]],
      limit: 5,
    });

    if (recentOrders.length === 0) {
      return res.status(400).json({
        message: "Not enough order data for forecasting",
      });
    }

    // Extract sales amounts
    const sales = recentOrders
        .map((o) => o.total_amount)
        .reverse(); // oldest → newest

    const days = sales.map((_, index) => index + 1);

    // 🔹 Call ML forecast API
    const response = await axios.post(
        "http://127.0.0.1:8000/forecast",
        { days, sales },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
    );

    res.json({
      forecast: response.data?.next_7_days_forecast || [],
    });

  } catch (err) {
    console.error("Forecast Error:", err.message);

    res.status(500).json({
      message: "Failed to fetch forecast from ML service",
    });
  }
};