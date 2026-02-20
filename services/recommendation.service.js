const axios = require("axios");

/**
 * Recommendation Engine
 * Sends order list to ML service and returns ML response
 */

const getRecommendations = async (orders = [], limit = 5) => {
  try {
    if (!Array.isArray(orders) || orders.length === 0) {
      throw new Error("Orders must be a non-empty array");
    }

    // 🔹 Call ML API
    const response = await axios.post(
      "http://127.0.0.1:8000/recommend_ml",
      { orders },
      {
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      },
    );

    // 🔹 Assuming ML returns: { recommended: [...] }
    const mlRecommendations = response.data?.recommended || [];

    // Apply limit if needed
    return mlRecommendations.slice(0, limit);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    throw error;
  }
};

module.exports = getRecommendations;
