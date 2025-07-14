// routes/provider.js
const express = require("express");
const { createProviderProfile } = require("../controllers/provider-handler");
const { getProviderBookings, acceptBooking, rejectBooking } = require("../controllers/booking-handler");
const { createService, getProviderServices, updateService, deleteService } = require("../controllers/service-handler");
const router = express.Router();

// ✅ Provider profile
router.post("/profile", createProviderProfile);

// ✅ Bookings
router.get("/bookings", getProviderBookings);
router.patch("/bookings/:id/accept", acceptBooking);
router.patch("/bookings/:id/reject", rejectBooking);

// ✅ Services
router.post("/services", createService);
router.get("/services", getProviderServices);
router.put("/services/:id", updateService);
router.delete("/services/:id", deleteService);

module.exports = router;
