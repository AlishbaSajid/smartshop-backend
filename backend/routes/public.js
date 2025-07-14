// routes/public.js
const express = require("express");
const { getAllPublicServices, getProviderServicesPublic, getPublicProviderProfile, searchServices  } = require("../controllers/public-handler");
const { getReviewsByService } = require("../controllers/review-handler");

const router = express.Router();

// ⚠️ Place this BEFORE the dynamic :providerId route
router.get("/services/search", searchServices);

// ✅ Public: Get all active services
router.get("/services", getAllPublicServices);

// ✅ Public: Get services by providerId
router.get("/services/:providerId", getProviderServicesPublic);

// ✅ Public: Get provider profile (basic info)
router.get("/provider/:providerId", getPublicProviderProfile);

// 👀 Public: View reviews of a service
router.get("/reviews/:serviceId", getReviewsByService);


module.exports = router;
