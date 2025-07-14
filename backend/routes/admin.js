const express = require("express");
const router = express.Router();
const { getAdminSummary, getAllServicesForAdmin, toggleServiceApproval, getUnapprovedServices,  updateServiceByAdmin, deleteServiceByAdmin, getAllBookingsForAdmin, getBookingById, updateBookingStatus, deleteBooking, getBookingStats, toggleServiceActivation, toggleUserStatus, getAllReviews, deleteReviewByAdmin } = require("../controllers/admin-handler");
const {getAllCategories, createCategory, updateCategory, deleteCategory} = require("../controllers/admin-handler");

router.get("/dashboard/summary", getAdminSummary);
router.get("/services", getAllServicesForAdmin);
router.put("/services/:id/approve", toggleServiceApproval);
router.get("/services/unapproved", getUnapprovedServices);

router.put("/services/:id", updateServiceByAdmin);    
router.delete("/services/:id", deleteServiceByAdmin); 
router.get("/bookings", getAllBookingsForAdmin);
router.get("/bookings/stats", getBookingStats);
router.get("/bookings/:id", getBookingById);
router.put("/bookings/:id/status", updateBookingStatus);
router.delete("/bookings/:id", deleteBooking);

router.patch("/services/:id/toggle", toggleServiceActivation);
router.patch("/:id/toggle-status", toggleUserStatus);

router.get("/reviews", getAllReviews);
router.delete("/reviews/:id", deleteReviewByAdmin);

router.get("/categories", getAllCategories);
router.post("/categories", createCategory);
router.patch("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);


module.exports = router;
