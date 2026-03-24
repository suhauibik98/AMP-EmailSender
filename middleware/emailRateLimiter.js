const rateLimit = require("express-rate-limit");

const emailRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30,
  message: {
    message: "Too many email requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = emailRateLimiter;