const { Customer, User } = require('../models');

/**
 * Create a new customer profile
 */
exports.createCustomer = async (userId, customerData) => {
  try {
    const customer = await Customer.create({
      user_id: userId,
      age: customerData.age,
      gender: customerData.gender,
      dietary_preferences: customerData.dietary_preferences || [],
      favorite_cuisine: customerData.favorite_cuisine,
      order_history: customerData.order_history || []
    });
    return customer;
  } catch (error) {
    throw error;
  }
};

/**
 * Get customer profile by user ID
 */
exports.getCustomerProfile = async (userId) => {
  try {
    const customer = await Customer.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });
    return customer;
  } catch (error) {
    throw error;
  }
};

/**
 * Update customer profile
 */
exports.updateCustomer = async (userId, customerData) => {
  try {
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    await customer.update({
      age: customerData.age !== undefined ? customerData.age : customer.age,
      gender: customerData.gender !== undefined ? customerData.gender : customer.gender,
      dietary_preferences: customerData.dietary_preferences !== undefined ? customerData.dietary_preferences : customer.dietary_preferences,
      favorite_cuisine: customerData.favorite_cuisine !== undefined ? customerData.favorite_cuisine : customer.favorite_cuisine,
      order_history: customerData.order_history !== undefined ? customerData.order_history : customer.order_history
    });

    return customer;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete customer profile
 */
exports.deleteCustomer = async (userId) => {
  try {
    const deletedCount = await Customer.destroy({
      where: { user_id: userId }
    });

    if (deletedCount === 0) {
      throw new Error('Customer profile not found');
    }

    return deletedCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Suspend customer (soft delete by marking status)
 */
exports.suspendCustomer = async (userId) => {
  try {
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    // Update user status to suspended
    await User.update(
      { status: 'SUSPENDED' },
      { where: { id: userId } }
    );

    return customer;
  } catch (error) {
    throw error;
  }
};

/**
 * Reactivate customer
 */
exports.reactivateCustomer = async (userId) => {
  try {
    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    // Update user status to approved
    await User.update(
      { status: 'APPROVED' },
      { where: { id: userId } }
    );

    return customer;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all customers (admin)
 */
exports.getAllCustomers = async () => {
  try {
    const customers = await Customer.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role', 'status']
      }],
      order: [['created_at', 'DESC']]
    });
    return customers;
  } catch (error) {
    throw error;
  }
};

/**
 * Update order history
 */
exports.addOrderToHistory = async (userId, orderData) => {
  try {
    let customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      customer = await Customer.create({
        user_id: userId,
        order_history: [orderData]
      });
    } else {
      const currentHistory = customer.order_history || [];
      const updatedHistory = [orderData, ...currentHistory];

      await customer.update({
        order_history: updatedHistory
      });
    }

    return customer;
  } catch (error) {
    throw error;
  }
};

