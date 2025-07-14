// routes/admin-provider.js
const express = require("express");
const router = express.Router();
const {
  getAllProviders,
  getProviderById,
  updateProvider,
  deleteProvider
} = require("../controllers/admin-provider-handler");

router.get("/", getAllProviders);
router.get("/:id", getProviderById);
router.put("/:id", updateProvider);
router.delete("/:id", deleteProvider);

module.exports = router;
