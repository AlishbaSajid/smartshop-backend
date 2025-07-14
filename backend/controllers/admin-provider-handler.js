// controllers/admin-provider-handler.js
const User = require("../models/user");
const Provider = require("../models/provider");
const Service = require("../models/service");

// ✅ Get all providers
const getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: "provider" }).select("-password");
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch providers", details: err.message });
  }
};

// ✅ Get a single provider with complete detail
const getProviderById = async (req, res) => {
  try {
    const providerId = req.params.id;

    // ✅ Step 1: Find provider profile by its _id
    const profile = await Provider.findById(providerId);
    if (!profile) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    // ✅ Step 2: Get related user data using userId from profile
    const user = await User.findOne({ _id: profile.userId, role: "provider" }).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found for this provider profile" });
    }

    // ✅ Step 3: Get services registered by the provider (match providerId)
    const services = await Service.find({ providerId: profile._id });

    // ✅ Step 4: Send response
    res.json({
      user,
      profile,
      services,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch provider details", details: err.message });
  }
};

// ✅ Update a provider (both User and Provider models)
const updateProvider = async (req, res) => {
  try {
    const providerId = req.params.id;

    // ✅ Step 1: Update User model
    const updatedUser = await User.findOneAndUpdate(
      { _id: providerId, role: "provider" },
      req.body.user,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "Provider user not found" });
    }

    // ✅ Step 2: Update Provider profile
    const updatedProfile = await Provider.findOneAndUpdate(
      { userId: providerId },
      req.body.profile,
      { new: true }
    );

    res.json({
      user: updatedUser,
      profile: updatedProfile
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update provider", details: err.message });
  }
};

// ✅ Delete a provider (User, Provider, and Services)
const deleteProvider = async (req, res) => {
  try {
    const providerUserId = req.params.id;

    // ✅ Step 1: Delete user
    const deletedUser = await User.findOneAndDelete({ _id: providerUserId, role: "provider" });
    if (!deletedUser) {
      return res.status(404).json({ error: "Provider user not found" });
    }

    // ✅ Step 2: Find and delete provider profile
    const providerProfile = await Provider.findOneAndDelete({ userId: providerUserId });

    // ✅ Step 3: Delete services created by this provider (if profile found)
    if (providerProfile) {
      await Service.deleteMany({ providerId: providerProfile._id });
    }

    res.json({ message: "Provider, profile, and all related services deleted successfully." });
  } catch (err) {
    res.status(500).json({
      error: "Failed to delete provider",
      details: err.message
    });
  }
};

module.exports = {
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider
};
