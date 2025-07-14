const express = require("express");
const { updateUserProfile } = require("../controllers/admin-user-handler");
const { getAllProviders } = require("../controllers/customer-handler");
const { getServicesByProvider, getAllServices } = require("../controllers/service-handler");
const { searchServices } = require("../controllers/public-handler");
const { addReview, deleteReview } = require("../controllers/review-handler");
const router = express.Router();


router.get("/providers", getAllProviders);
router.patch("/:id/profile", updateUserProfile);

// 👀 Get all services (accessible by customers)
router.get("/services", getAllServices);

// Customer views services of a specific provider
router.get("/providers/:providerId/services", getServicesByProvider);

// ✅ Add search route for customers
router.get("/services/search", searchServices);


// ✅ Customer: Add review to a service
router.post("/reviews/:serviceId", addReview);

// ✅ Customer: Delete their review
router.delete("/reviews/:serviceId", deleteReview);


module.exports = router;
