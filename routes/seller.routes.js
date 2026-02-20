const express = require("express");
const router = express.Router();

/* ================= MIDDLEWARE ================= */
const verifyToken = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");
const requireApprovedSeller = require("../middleware/approvedSeller.middleware");

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
 *         description: Restaurant details (or null if not created)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a seller)
 */
router.get(
  "/restaurant",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.getRestaurant,
);

/**
 * @swagger
 * /api/seller/restaurant:
 *   put:
 *     summary: Create or update seller restaurant profile (APPROVED sellers only)
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
 *                 example: "Thai Spice Colombo"
 *               address:
 *                 type: string
 *                 example: "No 12, Galle Road, Colombo 03"
 *               contact:
 *                 type: string
 *                 example: "+94 77 123 4567"
 *               cuisines:
 *                 type: string
 *                 description: "Comma-separated cuisines"
 *                 example: "Thai,Sri Lankan"
 *               opening_hours:
 *                 type: string
 *                 example: "10:00 - 22:00"
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Restaurant created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Restaurant updated"
 *                 restaurant:
 *                   $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller is not approved / forbidden
 *       500:
 *         description: Failed to update restaurant
 */
router.put(
  "/restaurant",
  verifyToken,
  checkRole(["SELLER"]),
  requireApprovedSeller,
  upload.single("image"),
  sellerController.updateRestaurantProfile,
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a seller)
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
 *     summary: Add new menu item (APPROVED sellers only)
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Chicken Koththu"
 *               price:
 *                 type: number
 *                 example: 1200
 *               stock:
 *                 type: integer
 *                 example: 20
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Menu item added successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller not approved / forbidden
 *       500:
 *         description: Failed to add menu item
 */
router.post(
  "/menu",
  verifyToken,
  checkRole(["SELLER"]),
  requireApprovedSeller,
  upload.single("image"),
  sellerController.addMenuItem,
);

/**
 * @swagger
 * /api/seller/menu/{id}:
 *   put:
 *     summary: Update menu item (APPROVED sellers only)
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Chicken Koththu - Large"
 *               price:
 *                 type: number
 *                 example: 1500
 *               stock:
 *                 type: integer
 *                 example: 30
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Menu item updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Menu item updated"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller not approved / unauthorized action
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Failed to update menu item
 */
router.put(
  "/menu/:id",
  verifyToken,
  checkRole(["SELLER"]),
  requireApprovedSeller,
  upload.single("image"),
  sellerController.updateMenuItem,
);

/**
 * @swagger
 * /api/seller/menu/{id}:
 *   delete:
 *     summary: Delete menu item (APPROVED sellers only)
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Menu item deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Menu item deleted"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller not approved / unauthorized action
 *       404:
 *         description: Menu item not found
 *       500:
 *         description: Failed to delete menu item
 */
router.delete(
  "/menu/:id",
  verifyToken,
  checkRole(["SELLER"]),
  requireApprovedSeller,
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a seller)
 *       500:
 *         description: Failed to fetch orders
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
 *     summary: Update order status (APPROVED sellers only)
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 25
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, CONFIRMED, PREPARING, READY, COMPLETED, CANCELLED]
 *                 example: CONFIRMED
 *     responses:
 *       200:
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "✅ Order status updated"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Seller not approved / forbidden
 *       404:
 *         description: Order not found
 *       500:
 *         description: Failed to update order
 */
router.put(
  "/orders/:id/status",
  verifyToken,
  checkRole(["SELLER"]),
  requireApprovedSeller,
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
 *         description: Analytics data (menu items summary)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a seller)
 *       500:
 *         description: Analytics failed
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not a seller)
 */
router.get(
  "/forecast",
  verifyToken,
  checkRole(["SELLER"]),
  sellerController.getForecast,
);

module.exports = router;
