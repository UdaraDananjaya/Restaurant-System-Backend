const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Restaurant System API",
      version: "1.0.0",
      description: "API documentation for Restaurant Management System",
      contact: {
        name: "API Support",
        email: "admin@restaurant.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            role: { type: "string", enum: ["ADMIN", "SELLER", "CUSTOMER"] },
            status: {
              type: "string",
              enum: ["PENDING", "APPROVED", "SUSPENDED", "REJECTED"],
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },

        Restaurant: {
          type: "object",
          properties: {
            id: { type: "integer" },
            seller_id: { type: "integer" },
            name: { type: "string" },
            status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
            image: { type: "string" },

            // ✅ NEW seller profile fields
            contact_number: { type: "string" },
            address: { type: "string" },
            cuisines: { type: "array", items: { type: "string" } },

            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },

        Customer: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            age: { type: "integer", nullable: true },
            gender: {
              type: "string",
              enum: ["Male", "Female", "Other"],
              nullable: true,
            },
            dietary_preferences: { type: "array", items: { type: "string" } },
            favorite_cuisine: { type: "string", nullable: true },
            order_history: { type: "array", items: { type: "object" } },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },

        MenuItem: {
          type: "object",
          properties: {
            id: { type: "integer" },
            restaurant_id: { type: "integer" },
            name: { type: "string" },
            price: { type: "number", format: "decimal" },
            stock: { type: "integer" },
            image: { type: "string" },
            orders_count: { type: "integer" },
            is_available: { type: "boolean" },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },

        Order: {
          type: "object",
          properties: {
            id: { type: "integer" },
            user_id: { type: "integer" },
            restaurant_id: { type: "integer" },
            items: { type: "array", items: { type: "object" } },
            total_amount: { type: "number", format: "decimal" },
            status: {
              type: "string",
              enum: [
                "PENDING",
                "CONFIRMED",
                "PREPARING",
                "READY",
                "COMPLETED",
                "CANCELLED",
              ],
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },

        Error: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
      },
    },

    security: [{ bearerAuth: [] }],
  },

  apis: ["./routes/*.js", "./controllers/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
