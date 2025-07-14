const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Provider",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service", // ✅ fix: reference Service model
    required: true,
  },
  date: { type: Date, required: true },
  time: { type: String },
  location: { type: String },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);

