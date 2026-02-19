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
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recommendations to return
 *     responses:
 *       200:
 *         description: Recommended restaurants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recommended:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Restaurant'
 */
router.get(
  "/recommendations",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.getRecommendations,
);

/**
 * @swagger
 * /api/customer/profile:
 *   get:
 *     summary: Get customer profile with preferences
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 age:
 *                   type: integer
 *                 gender:
 *                   type: string
 *                 dietary_preferences:
 *                   type: array
 *                   items:
 *                     type: string
 *                 favorite_cuisine:
 *                   type: string
 *                 order_history:
 *                   type: array
 *   post:
 *     summary: Update customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dietary_preferences:
 *                 type: array
 *                 items:
 *                   type: string
 *               favorite_cuisine:
 *                 type: string
 *               order_history:
 *                 type: array
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.get(
  "/profile",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.getCustomerProfile,
);

/**
 * @swagger
 * /api/customer/profile:
 *   post:
 *     summary: Create customer profile (if not exists)
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other]
 *               dietary_preferences:
 *                 type: array
 *                 items:
 *                   type: string
 *               favorite_cuisine:
 *                 type: string
 *               order_history:
 *                 type: array
 *     responses:
 *       201:
 *         description: Customer profile created
 *   put:
 *     summary: Update customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               age:
 *                 type: integer
 *               gender:
 *                 type: string
 *               dietary_preferences:
 *                 type: array
 *               favorite_cuisine:
 *                 type: string
 *               order_history:
 *                 type: array
 *     responses:
 *       200:
 *         description: Profile updated
 *   delete:
 *     summary: Delete customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile deleted
 */
router.post(
  "/profile",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.createCustomerProfile,
);

router.put(
  "/profile",
  verifyToken,
  checkRole(["CUSTOMER"]),
  customerController.updateCustomerProfileData,
);

router.delete(
  "/profile",
  verifyToken,
  checkRole(["CUSTOMER"]),
  (req, res, next) => {
    req.params.id = req.user.id;
    next();
  },
  customerController.deleteCustomerProfile,
);

/* =========================
   ADMIN CUSTOMER MANAGEMENT
   ========================= */

/**
 * @swagger
 * /api/customer/admin/all:
 *   get:
 *     summary: Get all customers (admin only)
 *     tags: [Admin - Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all customers
 */
router.get(
  "/admin/all",
  verifyToken,
  checkRole(["ADMIN"]),
  customerController.getAllCustomers,
);

/**
 * @swagger
 * /api/customer/admin/{id}/suspend:
 *   put:
 *     summary: Suspend customer account (admin only)
 *     tags: [Admin - Customers]
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
 *         description: Customer suspended
 */
router.put(
  "/admin/:id/suspend",
  verifyToken,
  checkRole(["ADMIN"]),
  customerController.suspendCustomer,
);

/**
 * @swagger
 * /api/customer/admin/{id}/reactivate:
 *   put:
 *     summary: Reactivate customer account (admin only)
 *     tags: [Admin - Customers]
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
 *         description: Customer reactivated
 */
router.put(
  "/admin/:id/reactivate",
  verifyToken,
  checkRole(["ADMIN"]),
  customerController.reactivateCustomer,
);

/**
 * @swagger
 * /api/customer/admin/{id}:
 *   delete:
 *     summary: Delete customer profile (admin only)
 *     tags: [Admin - Customers]
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
 *         description: Customer deleted
 */
router.delete(
  "/admin/:id",
  verifyToken,
  checkRole(["ADMIN"]),
  customerController.deleteCustomerProfile,
);

module.exports = router;
