const express = require("express");
const requireRole = require("../middleware/requireRole");
const { baseSendEmail } = require("../controllers/emailController");
const validateEmailRequest = require("../middleware/validateEmailRequest");
const emailRateLimiter = require("../middleware/emailRateLimiter");
const asyncHandler = require("../utils/asyncHandler");
const ROLES = require("../constants/roles");

const router = express.Router();

/**
 * POST /api/v1/email/send
 * Send email via email service
 */
router.post(
  "/email/send",
  emailRateLimiter,
  // requireRole(ROLES.ADMIN, ROLES.DIRECTOR, ROLES.EMPLOYEE),
  validateEmailRequest,
  asyncHandler(baseSendEmail),
);

module.exports = router;
