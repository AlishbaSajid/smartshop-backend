const mongoose = require("mongoose"); // ✅ You need this
const Provider = require("../models/provider");
const User = require("../models/user");
const Category = require("../models/category");

const createProviderProfile = async (req, res) => {
  try {
    const { phone, category, experience, location, services } = req.body;

    // ✅ 1. Validate required fields
    if (!phone || !category || !experience || !location) {
      return res.status(400).json({ error: "All fields are required: phone, category, experience, location" });
    }

    // ✅ 2. Check if provider profile already exists
    const existingProfile = await Provider.findOne({ userId: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ error: "Provider profile already exists" });
    }

    // ✅ 3. Validate user role
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role !== "provider") {
      return res.status(403).json({ error: "Only providers can create a profile" });
    }

    // ✅ 4. Find category _id if name was provided
    let categoryId = category;

    if (!mongoose.Types.ObjectId.isValid(category)) {
      const categoryDoc = await Category.findOne({ name: { $regex: category, $options: "i" } });
      if (!categoryDoc) {
        return res.status(400).json({ error: "Invalid category name" });
      }
      categoryId = categoryDoc._id;
    }

    // ✅ 5. Create provider profile
    const profile = new Provider({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone,
      category: categoryId,
      experience,
      location,
      services,
    });

    await profile.save();

    res.status(201).json({
      message: "Provider profile created successfully",
      profile
    });

  } catch (error) {
    console.error("Create Provider Profile Error:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

module.exports = { createProviderProfile };
