const express = require("express");
const {
  createBooking,
  getCustomerBookings,
  cancelBooking,
} = require("../controllers/booking-handler");

const router = express.Router();

// Customer creates a booking
router.post("/", createBooking);

// Customer gets all their bookings
router.get("/", getCustomerBookings);

// Customer cancels a specific booking
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
