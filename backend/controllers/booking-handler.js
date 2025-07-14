const Booking = require("../models/booking");
const Provider = require("../models/provider");
const Service = require("../models/service");

// ✅ Book a service
const createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { providerId, service, date, time, location } = req.body;

    // ✅ 1. Check required fields
    if (!providerId || !service || !date || !time || !location) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // ✅ 2. Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found." });
    }

    // ✅ 3. Check if service exists, is active, and approved
    const selectedService = await Service.findById(service);
    if (!selectedService) {
      return res.status(404).json({ error: "Service not found." });
    }

    if (!selectedService.isActive || !selectedService.isApproved) {
      return res.status(400).json({
        error: "This service is currently unavailable or not approved for booking.",
      });
    }

    // ✅ 4. Prevent double booking for same provider/service/date/time (regardless of customer)
    const bookingDate = new Date(date);
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

    const existingBooking = await Booking.findOne({
      providerId,
      service,
      date: { $gte: startOfDay, $lte: endOfDay },
      time: time,
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "This time slot has already been booked for the selected service and provider.",
      });
    }

    // ✅ 5. Create and save booking
    const newBooking = await new Booking({
      customerId,
      providerId,
      service,
      date: new Date(date),
      time,
      location,
    }).save();

    // ✅ 6. Populate service and provider (including nested category)
    const populatedBooking = await Booking.findById(newBooking._id).populate([
      {
        path: "service",
        select: "title price"
      },
      {
        path: "providerId",
        select: "name category",
        populate: { path: "category", select: "name" }
      }
    ]);

    // ✅ 7. Success response
    res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    });

  } catch (err) {
    console.error("Booking Error:", err.message);
    res.status(500).json({
      error: "Failed to create booking",
      details: err.message,
    });
  }
};




// ✅ Get all bookings for logged-in customer
const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate("providerId", "name email phone category location")
      .populate("service", "title price")
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch bookings",
      details: err.message,
    });
  }
};

// ✅ Cancel booking (only if pending)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.user.id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Only pending bookings can be cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully" });
  } catch (err) {
    res.status(500).json({
      error: "Failed to cancel booking",
      details: err.message,
    });
  }
};

// ✅ Get all bookings for logged-in provider
const getProviderBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await Provider.findOne({ userId });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const bookings = await Booking.find({ providerId: provider._id })
      .populate("customerId", "name email")
      .populate("service", "title price")
      .sort({ date: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Provider Booking Error:", err);
    res.status(500).json({
      error: "Failed to fetch provider bookings",
      details: err.message,
    });
  }
};

// ✅ Accept booking
const acceptBooking = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      providerId: provider._id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Only pending bookings can be accepted" });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({ message: "Booking accepted", booking });

  } catch (err) {
    res.status(500).json({
      error: "Failed to accept booking",
      details: err.message,
    });
  }
};

// ✅ Reject booking
const rejectBooking = async (req, res) => {
  try {
    const provider = await Provider.findOne({ userId: req.user.id });
    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      providerId: provider._id,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Only pending bookings can be rejected" });
    }

    booking.status = "rejected";
    await booking.save();

    res.json({ message: "Booking rejected", booking });

  } catch (err) {
    res.status(500).json({
      error: "Failed to reject booking",
      details: err.message,
    });
  }
};

module.exports = {
  createBooking,
  getCustomerBookings,
  cancelBooking,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
};
