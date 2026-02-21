const { Restaurant, MenuItem, Order, User, Customer } = require("../models");
const recommendationService = require("../services/recommendation.service");
const customerService = require("../services/customer.service");

/**
 * Get all restaurants
 */
exports.getRestaurants = async (req, res) => {
  try {
    const { cuisine } = req.query;

    const restaurants = await Restaurant.findAll({
      where: { status: "ACTIVE" },
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Optional cuisine filtering (stored as JSON array in DB)
    if (cuisine) {
      const needle = String(cuisine).trim().toLowerCase();
      const filtered = restaurants.filter((r) =>
        Array.isArray(r.cuisines)
          ? r.cuisines.some((c) => String(c).toLowerCase() === needle)
          : false,
      );
      return res.json(filtered);
    }

    res.json(restaurants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch restaurants" });
  }
};

/**
 * Get restaurant menu
 */
exports.getRestaurantMenu = async (req, res) => {
  try {
    const restaurantId = req.params.id;

    const menu = await MenuItem.findAll({
      where: {
        restaurant_id: restaurantId,
        is_available: true,
      },
      order: [["name", "ASC"]],
    });

    res.json(menu);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

/**
 * Place order
 */
exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, items } = req.body;

    // Validate restaurant exists
    const restaurant = await Restaurant.findByPk(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    // Validate and enrich items
    const enrichedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const menuItem = await MenuItem.findOne({
        where: {
          id: item.menuItemId,
          restaurant_id: restaurantId,
          is_available: true,
        },
      });

      if (!menuItem) {
        return res.status(400).json({
          message: `Menu item ${item.menuItemId} not found or unavailable`,
        });
      }

      // Check stock
      if (menuItem.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${menuItem.name}`,
        });
      }

      // Calculate total
      const itemTotal = menuItem.price * item.qty;
      totalAmount += itemTotal;

      enrichedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        qty: item.qty,
        portion: item.portion || "regular",
      });

      // Update stock and orders count
      await menuItem.update({
        stock: menuItem.stock - item.qty,
        orders_count: menuItem.orders_count + item.qty,
      });
    }

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      restaurant_id: restaurantId,
      items: enrichedItems,
      total_amount: totalAmount,
      status: "PENDING",
    });

    // Fetch order with relations for response
    const orderWithDetails = await Order.findByPk(order.id, {
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name"],
        },
      ],
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: orderWithDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order" });
  }
};

/**
 * Get customer orders
 */
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Restaurant,
          as: "restaurant",
          attributes: ["id", "name", "image"],
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

/**
 * Get personalized restaurant recommendations
 */
const axios = require("axios");

exports.getRecommendations = async (req, res) => {
  try {
    const { orders, limit = 5 } = req.body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        message: "Orders must be a non-empty array",
      });
    }

    // 🔹 Call ML API
    const response = await axios.post(
      "http://127.0.0.1:8000/recommend_ml",
      { orders },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      },
    );

    console.log(response);

    // Adjust based on your ML response structure
    const recommendations =
        response.data?.recommended_food
            ? [response.data.recommended_food]
            : [];

    res.status(200).json({
      recommended: recommendations.slice(0, limit),
    });

  } catch (err) {
    console.error("ML Recommendation Error:", err.message);

    res.status(500).json({
      message: "Failed to fetch recommendations from ML service",
    });
  }
};

/**
 * Update customer profile with preferences
 */
exports.updateCustomerProfile = async (req, res) => {
  try {
    const {
      age,
      gender,
      dietary_preferences,
      favorite_cuisine,
      order_history,
    } = req.body;

    let customer = await Customer.findOne({
      where: { user_id: req.user.id },
    });

    if (!customer) {
      customer = await Customer.create({
        user_id: req.user.id,
        age,
        gender,
        dietary_preferences: dietary_preferences || [],
        favorite_cuisine,
        order_history: order_history || [],
      });
    } else {
      await customer.update({
        age: age !== undefined ? age : customer.age,
        gender: gender !== undefined ? gender : customer.gender,
        dietary_preferences:
          dietary_preferences !== undefined
            ? dietary_preferences
            : customer.dietary_preferences,
        favorite_cuisine:
          favorite_cuisine !== undefined
            ? favorite_cuisine
            : customer.favorite_cuisine,
        order_history:
          order_history !== undefined ? order_history : customer.order_history,
      });
    }

    res.json({
      message: "Customer profile updated successfully",
      profile: customer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update customer profile" });
  }
};

/**
 * Get customer profile
 */
/**
 * Get customer profile
 */
exports.getCustomerProfile = async (req, res) => {
  try {
    const customer = await customerService.getCustomerProfile(req.user.id);

    if (!customer) {
      return res.status(404).json({ message: "Customer profile not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customer profile" });
  }
};

/**
 * Create customer profile (used during registration)
 */
exports.createCustomerProfile = async (req, res) => {
  try {
    const {
      age,
      gender,
      dietary_preferences,
      favorite_cuisine,
      order_history,
    } = req.body;

    // Check if customer profile already exists
    const existingCustomer = await Customer.findOne({
      where: { user_id: req.user.id },
    });

    if (existingCustomer) {
      return res
        .status(409)
        .json({ message: "Customer profile already exists" });
    }

    const customer = await customerService.createCustomer(req.user.id, {
      age,
      gender,
      dietary_preferences,
      favorite_cuisine,
      order_history,
    });

    res.status(201).json({
      message: "Customer profile created successfully",
      profile: customer,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create customer profile" });
  }
};

/**
 * Update customer profile
 */
exports.updateCustomerProfileData = async (req, res) => {
  try {
    const {
      age,
      gender,
      dietary_preferences,
      favorite_cuisine,
      order_history,
    } = req.body;

    const customer = await customerService.updateCustomer(req.user.id, {
      age,
      gender,
      dietary_preferences,
      favorite_cuisine,
      order_history,
    });

    res.json({
      message: "Customer profile updated successfully",
      profile: customer,
    });
  } catch (err) {
    console.error(err);
    if (err.message === "Customer profile not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to update customer profile" });
  }
};

/**
 * Delete customer profile
 */
exports.deleteCustomerProfile = async (req, res) => {
  try {
    const customerId = req.params.id;

    // Check authorization - customer can only delete their own, admin can delete any
    if (req.user.role !== "ADMIN" && req.user.id !== customerId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await customerService.deleteCustomer(customerId);

    res.json({ message: "Customer profile deleted successfully" });
  } catch (err) {
    console.error(err);
    if (err.message === "Customer profile not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to delete customer profile" });
  }
};

/**
 * Suspend customer (admin only)
 */
exports.suspendCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    await customerService.suspendCustomer(customerId);

    res.json({ message: "Customer suspended successfully" });
  } catch (err) {
    console.error(err);
    if (err.message === "Customer profile not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to suspend customer" });
  }
};

/**
 * Reactivate customer (admin only)
 */
exports.reactivateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    await customerService.reactivateCustomer(customerId);

    res.json({ message: "Customer reactivated successfully" });
  } catch (err) {
    console.error(err);
    if (err.message === "Customer profile not found") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to reactivate customer" });
  }
};

/**
 * Get all customers (admin only)
 */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await customerService.getAllCustomers();

    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch customers" });
  }
};
