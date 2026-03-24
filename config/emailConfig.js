const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL (NOT STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
 
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000,

  pool: true,
  maxConnections: 3,
  maxMessages: 50,

  logger: true,
  debug: true,
});

module.exports = { transporter };
