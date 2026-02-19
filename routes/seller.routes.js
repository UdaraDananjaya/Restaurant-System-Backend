const express = require("express");
const router = express.Router();

/* ================= MIDDLEWARE ================= */
const verifyToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

/* ================= CONTROLLER ================= */
const sellerController = require("../controllers/seller.controller");

/* ================================================= */
/* ================= RESTAURANT ==================== */
/* ================================================= */

/**
 * @swagger
 * /api/seller/restaurant:
 *   get:
 *     summary: Get seller's restaurant
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Restaurant details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 */
router.get(
  "/restaurant",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.getRestaurant,
);

/* ================================================= */
/* ================= MENU MANAGEMENT =============== */
/* ================================================= */

/**
 * @swagger
 * /api/seller/menu:
 *   get:
 *     summary: Get restaurant menu items
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MenuItem'
 */
router.get(
  "/menu",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.getMenu,
);

/**
 * @swagger
 * /api/seller/menu:
 *   post:
 *     summary: Add new menu item
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Menu item created
 */
router.post(
  "/menu",
  verifyToken,
  checkRole(["SELLER"]),
  upload.single("image"),
  sellerController.addMenuItem,
);

/**
 * @swagger
 * /api/seller/menu/{id}:
 *   put:
 *     summary: Update menu item
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu item updated
 */
router.put(
  "/menu/:id",
  verifyToken,
  checkRole(["SELLER"]),
  upload.single("image"),
  sellerController.updateMenuItem,
);

/**
 * @swagger
 * /api/seller/menu/{id}:
 *   delete:
 *     summary: Delete menu item
 *     tags: [Seller]
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
 *         description: Menu item deleted
 */
router.delete(
  "/menu/:id",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.deleteMenuItem,
);

/* ================================================= */
/* ================= ORDER MANAGEMENT ============== */
/* ================================================= */

/**
 * @swagger
 * /api/seller/orders:
 *   get:
 *     summary: Get restaurant orders
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
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
  checkRole(["SELLER"]),
  sellerController.getOrders,
);

/**
 * @swagger
 * /api/seller/orders/{id}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 */
router.put(
  "/orders/:id/status",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.updateOrderStatus,
);

/* ================================================= */
/* ================= ANALYTICS ===================== */
/* ================================================= */

/**
 * @swagger
 * /api/seller/analytics:
 *   get:
 *     summary: Get seller analytics
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics data
 */
router.get(
  "/analytics",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.getAnalytics,
);

/**
 * @swagger
 * /api/seller/forecast:
 *   get:
 *     summary: Get demand forecast
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Forecast data
 */
router.get(
  "/forecast",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.getForecast,
);

module.exports = router;
