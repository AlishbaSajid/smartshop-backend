// controllers/public-handler.js
const Service = require("../models/service");
const Provider = require("../models/provider");
const Category = require("../models/category"); // ✅ Important for category lookups
const mongoose = require("mongoose");

// ✅ Get all active services
const getAllPublicServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true, isApproved: true })
      .populate("providerId", "name category location")
      .populate("category", "name"); // ✅ Added
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// ✅ Get services of a specific provider
const getProviderServicesPublic = async (req, res) => {
  try {
    const providerId = req.params.providerId;
    const services = await Service.find({ providerId, isActive: true, isApproved: true })
      .populate("category", "name"); // ✅ Added for better display
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider's services" });
  }
};

// ✅ Get basic provider profile info
const getPublicProviderProfile = async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.providerId)
      .select("name email phone location category experience")
      .populate("category", "name"); // ✅ Optional: populate category name
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider profile" });
  }
};

// ✅ Search services by filters


const searchServices = async (req, res) => {
  try {
    const { category, location, keyword, minPrice, maxPrice } = req.query;
    const query = { isActive: true, isApproved: true };

    // ✅ Handle category as ObjectId or name
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        // If valid ObjectId, use it directly
        query.category = category;
      } else {
        // Else try finding by category name
        const categoryDoc = await Category.findOne({ name: { $regex: category, $options: "i" } });
        if (categoryDoc) {
          query.category = categoryDoc._id;
        } else {
          return res.json([]); // No matching category
        }
      }
    }

    // ✅ Location match (optional)
    if (location) {
      query.location = location;
    }

    // ✅ Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // ✅ Keyword search in title or description
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // ✅ Execute query
    const services = await Service.find(query)
      .populate("providerId", "name location category")
      .populate("category", "name")
      .select("-__v");

    res.json(services);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
};


module.exports = {
  getAllPublicServices,
  getProviderServicesPublic,
  getPublicProviderProfile,
  searchServices
};
