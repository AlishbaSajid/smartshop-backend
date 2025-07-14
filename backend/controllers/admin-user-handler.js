const User = require("../models/user");
const Provider = require("../models/provider");
const Service = require("../models/service");

// ✅ Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Filtered & paginated user listing (customers & providers only)
const getFilteredUsers = async (req, res) => {
  try {
    const { role, name, email, page = 1, limit = 10 } = req.query;

    const query = { role: { $ne: "admin" } };

    if (role && ["customer", "provider"].includes(role)) {
      query.role = role;
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select("-password")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      users
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
};

// ✅ Get user by ID (admin or self)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (req.user.role !== "admin" && req.user.id !== user.id.toString())
      return res.status(403).json({ error: "Unauthorized" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update any user (admin or self)
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== "admin" && req.user.id !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    const updateData = { ...req.body };
    delete updateData.password;

    const updated = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete user (admin only) — includes provider cleanup if needed
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ error: "Only admin can delete users" });

    const userId = req.params.id;

    // Step 1: Delete user from User collection
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    // Step 2: If user was a provider, delete Provider profile and Services
    if (deletedUser.role === "provider") {
      const providerProfile = await Provider.findOneAndDelete({ userId });
      if (providerProfile) {
        await Service.deleteMany({ providerId: providerProfile._id });
      }
    }

    res.json({ message: "User and related data deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update own profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (req.params.id !== userId)
      return res.status(403).json({ error: "You can only update your profile" });

    const existingEmail = await User.findOne({ email });
    if (existingEmail && existingEmail._id.toString() !== userId)
      return res.status(400).json({ error: "Email already in use" });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getFilteredUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,
};
