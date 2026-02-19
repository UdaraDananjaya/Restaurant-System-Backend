const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

const customerController = require("../controllers/customer.controller");

/* =========================
   CUSTOMER ROUTES
   ========================= */

/**
 * @swagger
 * /api/customer/restaurants:
 *   get:
 *     summary: Get all available restaurants
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */
router.get(
  "/restaurants",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.getRestaurants,
);

/**
 * @swagger
 * /api/customer/restaurants/{id}/menu:
 *   get:
 *     summary: Get restaurant menu
 *     tags: [Customer]
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
 *         description: Restaurant menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 */
router.get(
  "/restaurants/:id/menu",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.getRestaurantMenu,
);

/**
 * @swagger
 * /api/customer/order:
 *   post:
 *     summary: Place an order
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurantId
 *               - items
 *             properties:
 *               restaurantId:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menuItemId:
 *                       type: integer
 *                     portion:
 *                       type: string
 *                     qty:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order placed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 */
router.post(
  "/order",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.placeOrder,
);

/**
 * @swagger
 * /api/customer/orders:
 *   get:
 *     summary: Get customer order history
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customer orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
router.get(
  "/orders",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.getOrders,
);

/**
 * @swagger
 * /api/customer/recommendations:
 *   get:
 *     summary: Get personalized restaurant recommendations
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Restaurant'
 */
router.get(
  "/recommendations",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.getRecommendations,
);

module.exports = router;
