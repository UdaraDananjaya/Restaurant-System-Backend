const { User, Restaurant, Order, AdminLog, sequelize } = require("../models");
const logAdminAction = require("../utils/adminLogger");
const { Parser } = require("json2csv");

/* ================= USERS ================= */

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'created_at'],
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

/* ================= APPROVE SELLER ================= */

exports.approveSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const [updatedCount] = await User.update(
      { status: 'APPROVED' },
      {
        where: {
          id: sellerId,
          role: 'SELLER'
        }
      }
    );

    if (updatedCount === 0)
      return res.status(404).json({ message: "Seller not found" });

    await logAdminAction(req.user.id, "Approved Seller", sellerId);

    res.json({ message: "Seller approved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Approval failed" });
  }
};

/* ================= REJECT SELLER ================= */

exports.rejectSeller = async (req, res) => {
  try {
    const sellerId = req.params.id;

    const [updatedCount] = await User.update(
      { status: 'REJECTED' },
      {
        where: {
          id: sellerId,
          role: 'SELLER'
        }
      }
    );

    if (updatedCount === 0)
      return res.status(404).json({ message: "Seller not found" });

    await logAdminAction(req.user.id, "Rejected Seller", sellerId);

    res.json({ message: "Seller rejected successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reject failed" });
  }
};

/* ================= SUSPEND USER ================= */

exports.suspendUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const [updatedCount] = await User.update(
      { status: 'SUSPENDED' },
      { where: { id: userId } }
    );

    if (updatedCount === 0)
      return res.status(404).json({ message: "User not found" });

    await logAdminAction(req.user.id, "Suspended User", userId);

    res.json({ message: "User suspended successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Suspend failed" });
  }
};

/* ================= REACTIVATE USER ================= */

exports.reactivateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const [updatedCount] = await User.update(
      { status: 'APPROVED' },
      { where: { id: userId } }
    );

    if (updatedCount === 0)
      return res.status(404).json({ message: "User not found" });

    await logAdminAction(req.user.id, "Reactivated User", userId);

    res.json({ message: "User reactivated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Reactivate failed" });
  }
};

/* ================= ANALYTICS ================= */

exports.analytics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalRestaurants = await Restaurant.count();
    const totalOrders = await Order.count();

    res.json({
      totalUsers,
      totalRestaurants,
      totalOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics failed" });
  }
};

/* ================= ALL ORDERS ================= */

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: ['id', 'status', 'total_amount', 'created_at'],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['email']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name'],
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['email']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Transform to match the original SQL output format
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      customerEmail: order.customer?.email,
      restaurantName: order.restaurant?.name,
      sellerEmail: order.restaurant?.seller?.email
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ================= ADMIN LOGS ================= */

exports.getLogs = async (req, res) => {
  try {
    const logs = await AdminLog.findAll({
      attributes: ['id', 'action', 'created_at'],
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['email']
        },
        {
          model: User,
          as: 'targetUser',
          attributes: ['email']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Transform to match the original SQL output format
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      created_at: log.created_at,
      adminEmail: log.admin?.email,
      targetUserEmail: log.targetUser?.email
    }));

    res.json(formattedLogs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

/* ================= CSV EXPORTS ================= */

/* Export Users CSV */
exports.exportUsersCSV = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'status', 'created_at'],
      raw: true
    });

    const parser = new Parser();
    const csv = parser.parse(users);

    res.header("Content-Type", "text/csv");
    res.attachment("users.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Users CSV export failed" });
  }
};

/* Export Orders CSV */
exports.exportOrdersCSV = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: ['id', 'status', 'total_amount', 'created_at'],
      include: [
        {
          model: User,
          as: 'customer',
          attributes: ['email']
        },
        {
          model: Restaurant,
          as: 'restaurant',
          attributes: ['name'],
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['email']
            }
          ]
        }
      ]
    });

    // Format for CSV
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
      customerEmail: order.customer?.email,
      restaurantName: order.restaurant?.name,
      sellerEmail: order.restaurant?.seller?.email
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedOrders);

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Orders CSV export failed" });
  }
};

/* Export Logs CSV */
exports.exportLogsCSV = async (req, res) => {
  try {
    const logs = await AdminLog.findAll({
      attributes: ['id', 'action', 'created_at'],
      include: [
        {
          model: User,
          as: 'admin',
          attributes: ['email']
        },
        {
          model: User,
          as: 'targetUser',
          attributes: ['email']
        }
      ]
    });

    // Format for CSV
    const formattedLogs = logs.map(log => ({
      id: log.id,
      action: log.action,
      created_at: log.created_at,
      adminEmail: log.admin?.email,
      targetUserEmail: log.targetUser?.email
    }));

    const parser = new Parser();
    const csv = parser.parse(formattedLogs);

    res.header("Content-Type", "text/csv");
    res.attachment("admin_logs.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Logs CSV export failed" });
  }
};

/* ================= MONTHLY REVENUE TREND ================= */

exports.monthlyRevenue = async (req, res) => {
  try {
    const rows = await sequelize.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        SUM(total_amount) AS revenue
      FROM orders
      WHERE status = 'COMPLETED'
      GROUP BY month
      ORDER BY month ASC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Revenue trend failed" });
  }
};

