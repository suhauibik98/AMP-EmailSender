require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");

const connectionDB = require("./db/connectiondb");
const { transporter } = require("./config/emailConfig");
const authMiddleware = require("./middleware/authMiddleware");
const emailRouter = require("./routes/emailRouter");

const app = express();

const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";
const ALLOWED_ORIGINS = (process.env.ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

let server;
let isShuttingDown = false;

/**
 * Basic hardening
 */
app.disable("x-powered-by");
app.set("trust proxy", 1);

/**
 * Health endpoints
 * readiness turns false during shutdown
 */
app.get("/health/live", (req, res) => {
  return res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", (req, res) => {
  if (isShuttingDown) {
    return res.status(503).json({
      status: "shutting_down",
    });
  }

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
      // allow tools / server-to-server / postman without origin
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
 * limit request size to reduce abuse
 */
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

/**
 * Prevent HTTP parameter pollution
 */
app.use(hpp());

/**
 * Compression for responses
 */
app.use(compression());

/**
 * Logging
 */
app.use(morgan(IS_PROD ? "combined" : "dev"));

/**
 * Global rate limiter
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

/**
 * Stricter limiter for email endpoints
 */
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
 * Optional: reject requests during shutdown
 */
app.use((req, res, next) => {
  if (isShuttingDown) {
    return res.status(503).json({
      message: "Server is restarting, please try again shortly",
    });
  }
  next();
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
 * Central error handler
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

async function shutdown(signal) {
  try {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    isShuttingDown = true;

    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      console.log("HTTP server closed");
    }

    // if your connectionDB uses mongoose:
    // const mongoose = require("mongoose");
    // await mongoose.connection.close();

    console.log("Shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
}

async function start() {
  try {
    if (NODE_ENV !== "production") {
      console.warn("Warning: NODE_ENV is not set to production");
    }

    await transporter.verify();
    console.log("SMTP server is ready");

    await connectionDB();
    console.log("Mongo connected");

    server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Email service running on port ${PORT} in ${NODE_ENV} mode`);
    });

    server.headersTimeout = 60 * 1000;
    server.requestTimeout = 30 * 1000;
    server.keepAliveTimeout = 5 * 1000;
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});

start();


