require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

/* 🔹 MySQL pool */
const pool = require("./config/db");

/* 🔹 Sequelize ORM */
const { sequelize } = require("./models");

/* 🔹 Swagger Documentation */
const { swaggerUi, specs } = require("./config/swagger");

/* 🔹 Admin seed */
const seedAdmin = require("./seed/admin.seed");

/* 🔹 Routes */
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const sellerRoutes = require("./routes/seller.routes");
const customerRoutes = require("./routes/customer.routes");

const app = express();

/* ================= SECURITY HEADERS ================= */
app.use(helmet());

/* ================= GLOBAL RATE LIMIT ================= */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    message: "Too many requests from this IP. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/* ================= CORS CONFIG ================= */
/* ✅ Allow ALL localhost ports (best for development) */
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (origin.startsWith("http://localhost")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

/* ================= BODY PARSING ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FILES ================= */
app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads")),
);

/* ================= SWAGGER DOCUMENTATION ================= */
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Restaurant API Docs",
  }),
);

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/customer", customerRoutes);

/* ================= HEALTH CHECK ================= */
app.get("/", (req, res) => {
  res.send("✅ Restaurant Management API Running");
});

/* ================= START SERVER ================= */
const startServer = async () => {
  try {
    /* Test legacy MySQL connection */
    const connection = await pool.getConnection();
    console.log("✅ MySQL Database Connected (Legacy Pool)");
    connection.release();

    /* Sync Sequelize models with database */
    await sequelize.authenticate();
    console.log("✅ Sequelize ORM Connected");

    // Sync models (creates tables if they don't exist)
    // Use { alter: true } in development, { force: false } in production
    await sequelize.sync({ alter: false });
    console.log("✅ Database models synchronized");

    /* 🔥 Auto seed admin */
    await seedAdmin();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
