const User = require("../models/user");
const Service = require("../models/service");
const Provider = require("../models/provider");
const Booking = require("../models/booking");
const Review = require("../models/review");
const Category = require("../models/category");

// ✅ Admin Dashboard Summary
const getAdminSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalProviders = await User.countDocuments({ role: "provider" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalServices = await Service.countDocuments();
    const totalApprovedServices = await Service.countDocuments({ isApproved: true });
    const totalUnapprovedServices = await Service.countDocuments({ isApproved: false });
    const totalBookings = await Booking.countDocuments();
    const recentUsers = await User.find({ role: { $ne: "admin" } }).sort({ createdAt: -1 }).limit(5).select("name email role createdAt");
    const totalReviews = await Review.countDocuments();

    const topRatedServices = await Review.aggregate([
      {
        $group: {
          _id: "$serviceId",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      },
      { $sort: { averageRating: -1, reviewCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "_id",
          as: "service"
        }
      },
      { $unwind: "$service" },
      {
        $lookup: {
          from: "providers",
          localField: "service.providerId",
          foreignField: "_id",
          as: "provider"
        }
      },
      { $unwind: "$provider" },
      {
        $lookup: {
          from: "users",
          localField: "provider.userId",
          foreignField: "_id",
          as: "providerUser"
        }
      },
      { $unwind: "$providerUser" },
      {
        $lookup: {
          from: "categories",
          localField: "service.category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $project: {
          title: "$service.title",
          averageRating: 1,
          reviewCount: 1,
          providerName: "$providerUser.name",
          categoryName: "$category.name"
        }
      }
    ]);

    res.json({
      totalUsers,
      totalProviders,
      totalCustomers,
      totalServices,
      totalApprovedServices,
      totalUnapprovedServices,
      totalBookings,
      recentUsers,
      totalReviews,
      topRatedServices
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load admin dashboard summary", details: err.message });
  }
};

// ✅ Admin: Get all services with provider and category info
const getAllServicesForAdmin = async (req, res) => {
  try {
    const services = await Service.find()
      .populate({
        path: "providerId",
        populate: { path: "userId", select: "name email" }
      })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services", details: err.message });
  }
};

// ✅ Approve / Unapprove Service
const toggleServiceApproval = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    service.isApproved = !service.isApproved;
    await service.save();

    res.json({
      message: `Service is now ${service.isApproved ? "approved" : "unapproved"}`,
      service
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle service approval", details: err.message });
  }
};

// ✅ Unapproved Services
const getUnapprovedServices = async (req, res) => {
  try {
    const services = await Service.find({ isApproved: false })
      .populate({
        path: "providerId",
        populate: { path: "userId", select: "name email" }
      })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unapproved services", details: err.message });
  }
};

// ✅ Update a service
const updateServiceByAdmin = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ error: "Service not found" });

    res.json({ message: "Service updated", service });
  } catch (err) {
    res.status(500).json({ error: "Failed to update service", details: err.message });
  }
};

// ✅ Delete a service
const deleteServiceByAdmin = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Service not found" });

    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete service", details: err.message });
  }
};

// ✅ All bookings with filter
const getAllBookingsForAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const bookings = await Booking.find(filter)
      .populate("customerId", "name email")
      .populate({
        path: "providerId",
        populate: { path: "userId", select: "name email" }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings", details: err.message });
  }
};

// ✅ Single booking
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "name email")
      .populate({
        path: "providerId",
        populate: { path: "userId", select: "name email" }
      });

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking", details: err.message });
  }
};

// ✅ Update booking status
const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json({ message: "Booking status updated", booking });
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking", details: err.message });
  }
};

// ✅ Delete booking
const deleteBooking = async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Booking not found" });

    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking", details: err.message });
  }
};

// ✅ Booking stats
const getBookingStats = async (req, res) => {
  try {
    const stats = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking stats", details: err.message });
  }
};

// ✅ Toggle service active status
const toggleServiceActivation = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: "Service not found" });

    service.isActive = !service.isActive;
    await service.save();

    res.json({ message: `Service is now ${service.isActive ? "active" : "inactive"}`, service });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle service status", details: err.message });
  }
};

// ✅ Block / Unblock users
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin") {
      return res.status(404).json({ error: "User not found or cannot block admin" });
    }

    user.status = user.status === "active" ? "blocked" : "active";
    await user.save();

    res.json({ message: `User ${user.status}`, status: user.status });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle user status", details: err.message });
  }
};

// ✅ Get all reviews
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customerId", "name email")
      .populate({
        path: "serviceId",
        populate: { path: "category", select: "name" }
      });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews", details: err.message });
  }
};

// ✅ Delete review
const deleteReviewByAdmin = async (req, res) => {
  try {
    const deleted = await Review.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Review not found" });

    res.json({ message: "Review deleted by admin" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review", details: err.message });
  }
};

// ✅ Categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories", details: err.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ error: "Category already exists" });

    const category = new Category({ name });
    await category.save();
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ error: "Failed to create category", details: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ error: "Failed to update category", details: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete category", details: err.message });
  }
};

module.exports = {
  getAdminSummary,
  getAllServicesForAdmin,
  toggleServiceApproval,
  getUnapprovedServices,
  updateServiceByAdmin,
  deleteServiceByAdmin,
  getAllBookingsForAdmin,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
  toggleServiceActivation,
  toggleUserStatus,
  getAllReviews,
  deleteReviewByAdmin,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
