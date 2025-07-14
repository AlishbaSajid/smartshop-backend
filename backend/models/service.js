const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // e.g., "1 hour"
  location: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isApproved: { type: Boolean, default: false }, // New services are unapproved by default
  // In models/service.js
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  }

}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
