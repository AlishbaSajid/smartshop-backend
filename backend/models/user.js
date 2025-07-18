
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["customer", "provider", "admin"],
    default: "customer"
  },
  status: {
  type: String,
  enum: ["active", "blocked"],
  default: "active"
},
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
