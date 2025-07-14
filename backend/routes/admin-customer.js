// routes/admin-customer.js
const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} = require("../controllers/admin-customer-handler");

router.get("/", getAllCustomers);
router.get("/:id", getCustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

module.exports = router;
