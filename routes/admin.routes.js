const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

const admin = require("../controllers/admin.controller");

/* ================= USERS ================= */

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get("/users", verifyToken, checkRole(["ADMIN"]), admin.getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/approve:
 *   put:
 *     summary: Approve seller account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seller approved
 */
router.put(
  "/users/:id/approve",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.approveSeller,
);

/**
 * @swagger
 * /api/admin/users/{id}/suspend:
 *   put:
 *     summary: Suspend user account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User suspended
 */
router.put(
  "/users/:id/suspend",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.suspendUser,
);

/**
 * @swagger
 * /api/admin/users/{id}/reactivate:
 *   put:
 *     summary: Reactivate suspended user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User reactivated
 */
router.put(
  "/users/:id/reactivate",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.reactivateUser,
);

/**
 * @swagger
 * /api/admin/users/{id}/reject:
 *   put:
 *     summary: Reject seller application
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Seller rejected
 */
router.put(
  "/users/:id/reject",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.rejectSeller,
);

/* ================= ANALYTICS ================= */

/**
 * @swagger
 * /api/admin/analytics:
 *   get:
 *     summary: Get system analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get("/analytics", verifyToken, checkRole(["ADMIN"]), admin.analytics);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 */
router.get("/orders", verifyToken, checkRole(["ADMIN"]), admin.getAllOrders);

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Get admin activity logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin logs
 */
router.get("/logs", verifyToken, checkRole(["ADMIN"]), admin.getLogs);

/* ================= CSV EXPORT ================= */

/**
 * @swagger
 * /api/admin/export/users:
 *   get:
 *     summary: Export users as CSV
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get(
  "/export/users",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.exportUsersCSV,
);

/**
 * @swagger
 * /api/admin/export/orders:
 *   get:
 *     summary: Export orders as CSV
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get(
  "/export/orders",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.exportOrdersCSV,
);

/**
 * @swagger
 * /api/admin/export/logs:
 *   get:
 *     summary: Export logs as CSV
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV file
 */
router.get(
  "/export/logs",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.exportLogsCSV,
);

/**
 * @swagger
 * /api/admin/revenue-trend:
 *   get:
 *     summary: Get monthly revenue trend
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue trend data
 */
router.get(
  "/revenue-trend",
  verifyToken,
  checkRole(["ADMIN"]),
  admin.monthlyRevenue,
);

module.exports = router;
