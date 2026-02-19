const { Restaurant, MenuItem, Order, User } = require("../models");

/* ================= GET RESTAURANT (SEQUELIZE) ================= */
exports.getRestaurantWithSequelize = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id },
      include: [
        {
          model: MenuItem,
          as: 'menuItems'
        }
      ]
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch restaurant" });
  }
};

/* ================= GET MENU (SEQUELIZE) ================= */
exports.getMenuWithSequelize = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id }
    });

    if (!restaurant) {
      return res.json([]);
    }

    const menuItems = await MenuItem.findAll({
      where: { restaurant_id: restaurant.id },
      order: [['created_at', 'DESC']]
    });

    res.json(menuItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

/* ================= ADD MENU ITEM (SEQUELIZE) ================= */
exports.addMenuItemWithSequelize = async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const imageUrl = req.file
      ? `${process.env.BASE_URL}/uploads/${req.file.filename}`
      : null;

    const menuItem = await MenuItem.create({
      restaurant_id: restaurant.id,
      name,
      price,
      stock: stock || 0,
      image: imageUrl,
      is_available: true,
      orders_count: 0
    });

    res.status(201).json({
      message: "✅ Menu item added",
      menuItem
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add menu item" });
  }
};

/* ================= UPDATE MENU ITEM (SEQUELIZE) ================= */
exports.updateMenuItemWithSequelize = async (req, res) => {
  try {
    const { name, price, stock, is_available } = req.body;
    const menuItemId = req.params.id;

    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const updateData = {
      name,
      price,
      stock,
      is_available: is_available !== undefined ? is_available : true
    };

    if (req.file) {
      updateData.image = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
    }

    const [updatedCount] = await MenuItem.update(
      updateData,
      {
        where: {
          id: menuItemId,
          restaurant_id: restaurant.id
        }
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "✅ Menu item updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update menu item" });
  }
};

/* ================= DELETE MENU ITEM (SEQUELIZE) ================= */
exports.deleteMenuItemWithSequelize = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const deletedCount = await MenuItem.destroy({
      where: {
        id: req.params.id,
        restaurant_id: restaurant.id
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json({ message: "✅ Menu item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete menu item" });
  }
};

/* ================= GET ORDERS (SEQUELIZE) ================= */
exports.getOrdersWithSequelize = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id }
    });

    if (!restaurant) {
      return res.json([]);
    }

    const orders = await Order.findAll({
      where: { restaurant_id: restaurant.id },
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['id', 'email', 'name']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= UPDATE ORDER STATUS (SEQUELIZE) ================= */
exports.updateOrderStatusWithSequelize = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const restaurant = await Restaurant.findOne({
      where: { seller_id: req.user.id }
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const [updatedCount] = await Order.update(
      { status },
      {
        where: {
          id: orderId,
          restaurant_id: restaurant.id
        }
      }
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

