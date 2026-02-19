const { Customer, Restaurant, MenuItem } = require('../models');

/**
 * Advanced Recommendation Engine
 * Uses customer profile: age, gender, dietary preferences, favorite cuisine, order history
 */
const getRecommendations = async (userId, limit = 5) => {
  try {
    // Get customer profile
    const customerProfile = await Customer.findOne({
      where: { user_id: userId }
    });

    // Get all active restaurants with menu items
    const restaurants = await Restaurant.findAll({
      where: { status: 'ACTIVE' },
      include: [{
        model: MenuItem,
        as: 'menuItems',
        attributes: ['id', 'name', 'price', 'orders_count', 'image']
      }],
      order: [['created_at', 'DESC']]
    });

    if (!customerProfile) {
      return restaurants.slice(0, limit);
    }

    // Score each restaurant
    const scoredRestaurants = restaurants.map(restaurant => {
      let score = 0;

      // Favorite cuisine match
      if (customerProfile.favorite_cuisine &&
          restaurant.name.toLowerCase().includes(customerProfile.favorite_cuisine.toLowerCase())) {
        score += 50;
      }

      // Dietary preferences match
      if (customerProfile.dietary_preferences && customerProfile.dietary_preferences.length > 0) {
        const dietaryMatches = restaurant.menuItems.filter(item => {
          const itemName = item.name.toLowerCase();
          return customerProfile.dietary_preferences.some(pref =>
            itemName.includes(pref.toLowerCase())
          );
        }).length;
        score += dietaryMatches * 10;
      }

      // Popularity score
      const popularityScore = restaurant.menuItems.reduce((sum, item) =>
        sum + (item.orders_count || 0), 0
      );
      score += Math.min(popularityScore / 10, 30);

      // Order history relevance
      if (customerProfile.order_history && customerProfile.order_history.length > 0) {
        score += 15;
      }

      return {
        ...restaurant.toJSON(),
        recommendation_score: score
      };
    });

    return scoredRestaurants
      .sort((a, b) => b.recommendation_score - a.recommendation_score)
      .slice(0, limit);
  } catch (error) {
    console.error('Recommendation error:', error);
    throw error;
  }
};

module.exports = getRecommendations;
