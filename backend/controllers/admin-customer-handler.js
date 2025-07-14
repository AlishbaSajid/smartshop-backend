// controllers/admin-customer-handler.js
const User = require("../models/user");

// ✅ Get all customers
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).select("-password");
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers", details: err.message });
  }
};

// ✅ Get a single customer
const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: "customer" }).select("-password");
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer", details: err.message });
  }
};

// ✅ Update a customer
const updateCustomer = async (req, res) => {
  try {
    const updated = await User.findOneAndUpdate(
      { _id: req.params.id, role: "customer" },
      req.body,
      { new: true }
    ).select("-password");

    if (!updated) return res.status(404).json({ error: "Customer not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer", details: err.message });
  }
};

// ✅ Delete a customer
const deleteCustomer = async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({ _id: req.params.id, role: "customer" });
    if (!deleted) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer", details: err.message });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};
