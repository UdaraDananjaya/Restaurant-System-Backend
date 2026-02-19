const sequelize = require('../config/sequelize');
const User = require('./User');
const Restaurant = require('./Restaurant');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const AdminLog = require('./AdminLog');
const Customer = require('./Customer');

// Define Associations

// User - Restaurant (One to Many)
User.hasMany(Restaurant, {
  foreignKey: 'seller_id',
  as: 'restaurants'
});
Restaurant.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller'
});

// User - Customer (One to One)
User.hasOne(Customer, {
  foreignKey: 'user_id',
  as: 'customerProfile'
});
Customer.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// Restaurant - MenuItem (One to Many)
Restaurant.hasMany(MenuItem, {
  foreignKey: 'restaurant_id',
  as: 'menuItems'
});
MenuItem.belongsTo(Restaurant, {
  foreignKey: 'restaurant_id',
  as: 'restaurant'
});

// User - Order (One to Many)
User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders'
});
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'customer'
});

// Restaurant - Order (One to Many)
Restaurant.hasMany(Order, {
  foreignKey: 'restaurant_id',
  as: 'orders'
});
Order.belongsTo(Restaurant, {
  foreignKey: 'restaurant_id',
  as: 'restaurant'
});

// AdminLog - User (Many to One)
AdminLog.belongsTo(User, {
  foreignKey: 'admin_id',
  as: 'admin'
});
AdminLog.belongsTo(User, {
  foreignKey: 'target_user_id',
  as: 'targetUser'
});

module.exports = {
  sequelize,
  User,
  Restaurant,
  MenuItem,
  Order,
  AdminLog,
  Customer
};

