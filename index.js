// api/index.js
require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

const { transporter } = require("./config/emailConfig");
const authMiddleware = require("./middleware/authMiddleware");
const emailRouter = require("./routes/emailRouter");

const app = express();

const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";
const ALLOWED_ORIGINS = (process.env.ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

/**
 * Basic hardening
 */
app.disable("x-powered-by");
app.set("trust proxy", 1);

/**
 * Health endpoints
 */
app.get("/health/live", (req, res) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", (req, res) => {
  return res.status(200).json({
    status: "ready",
  });
});

/**
 * Security headers
 */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/**
 * CORS
 */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/**
 * Body parsing
 */
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

/**
 * Prevent HTTP parameter pollution
 */
app.use(hpp());

/**
 * Compression
 */
app.use(compression());

/**
 * Logging
 */
app.use(morgan(IS_PROD ? "combined" : "dev"));

/**
 * Rate limiters
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_PROD ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
  },
});
app.use(globalLimiter);

const emailLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many email requests, please try again later",
  },
});

/**
 * Routes
 */
app.use("/api/v1", emailLimiter, authMiddleware, emailRouter);

/**
 * 404 handler
 */
app.use((req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "CORS blocked this origin" });
  }

  return res.status(err.status || 500).json({
    message: IS_PROD ? "Internal server error" : err.message,
  });
});

// ✅ For Vercel: Export the app (NO app.listen())
module.exports = app;