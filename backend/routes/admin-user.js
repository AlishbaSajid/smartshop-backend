const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,getFilteredUsers
} = require("../controllers/admin-user-handler");


const router = express.Router();

// ✅ Admin: Filtered user listing
router.get("/search", getFilteredUsers);

// ✅ Admin-only routes
router.get("/", getAllUsers);
router.delete("/:id", deleteUser);

// ✅ Routes accessible by admin or the user themself (self-check is done in controller)
router.get("/:id", getUserById);
router.put("/:id", updateUser);
// router.patch("/:id/profile", updateUserProfile);
router.patch("/:id/profile", updateUserProfile);



module.exports = router;
