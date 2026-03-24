const mongoose = require("mongoose");

const EmailSchema = new mongoose.Schema(
  {
    to: { type: String, required: true },
    subject: { type: String, required: true },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Email", EmailSchema);
