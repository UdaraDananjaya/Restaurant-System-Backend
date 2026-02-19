const { User, Restaurant, Order } = require("../models");

};
  }
    res.status(500).json({ message: "Search failed" });
    console.error(err);
  } catch (err) {
    res.json(users);

    });
      order: [['created_at', 'DESC']]
      attributes: ['id', 'name', 'email', 'role', 'status', 'created_at'],
      where,
    const users = await User.findAll({

    }
      where.status = status;
    if (status) {

    }
      where.role = role;
    if (role) {

    }
      ];
        { email: { [Op.like]: `%${query}%` } }
        { name: { [Op.like]: `%${query}%` } },
      where[Op.or] = [
    if (query) {

    const where = {};

    const { query, role, status } = req.query;
  try {
exports.searchUsersWithSequelize = async (req, res) => {
/* ================= SEARCH USERS (SEQUELIZE) ================= */

};
  }
    res.status(500).json({ message: "Failed to fetch orders" });
    console.error(err);
  } catch (err) {
    res.json(orders);

    });
      order: [['created_at', 'DESC']]
      ],
        }
          ]
            }
              attributes: ['id', 'email', 'name']
              as: 'seller',
              model: User,
            {
          include: [
          attributes: ['id', 'name'],
          as: 'restaurant',
          model: Restaurant,
        {
        },
          attributes: ['id', 'email', 'name']
          as: 'customer',
          model: User,
        {
      include: [
    const orders = await Order.findAll({
  try {
exports.getAllOrdersWithSequelize = async (req, res) => {
/* ================= GET ALL ORDERS WITH JOINS (SEQUELIZE) ================= */

};
  }
    res.status(500).json({ message: "Analytics failed" });
    console.error(err);
  } catch (err) {
    });
      totalOrders,
      totalRestaurants,
      totalUsers,
    res.json({

    const totalOrders = await Order.count();
    const totalRestaurants = await Restaurant.count();
    const totalUsers = await User.count();
  try {
exports.analyticsWithSequelize = async (req, res) => {
/* ================= ANALYTICS (SEQUELIZE) ================= */

};
  }
    res.status(500).json({ message: "Approval failed" });
    console.error(err);
  } catch (err) {
    res.json({ message: "Seller approved successfully" });

    // await logAdminAction(req.user.id, "Approved Seller", sellerId);
    // Log action (if needed)

    }
      return res.status(404).json({ message: "Seller not found" });
    if (updatedCount === 0) {

    );
      }
        }
          role: 'SELLER'
          id: sellerId,
        where: {
      {
      { status: 'APPROVED' },
    const [updatedCount] = await User.update(

    const sellerId = req.params.id;
  try {
exports.approveSellerWithSequelize = async (req, res) => {
/* ================= APPROVE SELLER (SEQUELIZE) ================= */

};
  }
    res.status(500).json({ message: "Failed to fetch users" });
    console.error(err);
  } catch (err) {
    res.json(users);

    });
      order: [['created_at', 'DESC']]
      attributes: ['id', 'name', 'email', 'role', 'status', 'created_at'],
    const users = await User.findAll({
  try {
exports.getUsersWithSequelize = async (req, res) => {
/* ================= GET USERS (SEQUELIZE) ================= */

const { Op } = require("sequelize");
