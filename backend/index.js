const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/admin-user");
const customerRoutes = require("./routes/customer");
const providerRoutes = require("./routes/provider");
const customerBookingRoutes = require("./routes/booking");
const { verifyToken, isAdmin, isCustomer, isProvider } = require("./middleware/auth-middleware");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");
const adminProviderRoutes = require("./routes/admin-provider");
const adminCustomerRoutes = require("./routes/admin-customer");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Utility function to register admin routes with middleware
const adminRoute = (path, router) => app.use(path, verifyToken, isAdmin, router);

//admin routes
adminRoute("/user", userRoutes);
adminRoute("/admin", adminRoutes); 
adminRoute("/admin/providers", adminProviderRoutes);
adminRoute("/admin/customers", adminCustomerRoutes);


// non-admin Routes
app.use("/auth", authRoutes);
app.use("/customer", verifyToken, isCustomer, customerRoutes);
app.use("/provider", verifyToken, isProvider, providerRoutes);
app.use("/customer/bookings", verifyToken, isCustomer, customerBookingRoutes);
app.use("/provider", verifyToken, isProvider, providerRoutes);

// routes for guest users who are not logged in
app.use("/public", publicRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("🚀 Backend is up and running!");
});

// ✅ MongoDB Connection
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "smartshopdb"
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};

// ✅ Start Server
connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
});
