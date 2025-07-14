const Service = require("../models/service");
const Provider = require("../models/provider");
const Category = require("../models/category"); // ✅ Add this at top

// ✅ Create a new service
const createService = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await Provider.findOne({ userId });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const { title, description, price, duration } = req.body;

    if (!title || !price || !duration) {
      return res.status(400).json({ error: "Title, price, and duration are required" });
    }

    let categoryDoc;
    if (typeof provider.category === "string") {
      categoryDoc = await Category.findOne({ name: provider.category });
    } else {
      categoryDoc = await Category.findById(provider.category);
    }

    if (!categoryDoc) {
      return res.status(400).json({ error: "Category not found in system" });
    }

    const service = new Service({
      providerId: provider._id,
      title,
      description,
      price,
      duration,
      category: categoryDoc._id,
      location: provider.location,
    });

    await service.save();
    res.status(201).json({ message: "Service created successfully", service });

  } catch (err) {
    res.status(500).json({ error: "Failed to create service", details: err.message });
  }
};



// ✅ Get all services by logged-in provider
const getProviderServices = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await Provider.findOne({ userId });

    if (!provider) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    const services = await Service.find({ providerId: provider._id })
    .populate("category", "name") // ✅ populate category name
      .select("-__v");
    res.json(services);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

// ✅ Update a specific service
const updateService = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await Provider.findOne({ userId });

    const service = await Service.findOne({
      _id: req.params.id,
      providerId: provider._id,
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const { title, description, price, duration } = req.body;

    if (title) service.title = title;
    if (description) service.description = description;
    if (price) service.price = price;
    if (duration) service.duration = duration;

    await service.save();
    res.json({ message: "Service updated successfully", service });

  } catch (err) {
    res.status(500).json({ error: "Failed to update service", details: err.message });
  }
};

// ✅ Delete a specific service
const deleteService = async (req, res) => {
  try {
    const userId = req.user.id;
    const provider = await Provider.findOne({ userId });

    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      providerId: provider._id,
    });

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json({ message: "Service deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: "Failed to delete service", details: err.message });
  }
};


// ✅ Get all services (for customer view)
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true, isApproved: true })
      .populate("providerId", "name location email")
      .populate("category", "name") // ✅ this gives category name
      .select("-__v");

    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services", details: err.message });
  }
};




// ✅ Customer gets services by provider
const getServicesByProvider = async (req, res) => {
  try {
    const providerId = req.params.providerId;

    const services = await Service.find({ providerId, isActive: true, isApproved: true }).populate("category", "name") // ✅ populate category name
    .select("-__v");


    res.json(services);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch services", details: err.message });
  }
};

module.exports = {
  createService,
  getProviderServices,
  updateService,
  deleteService,
  getAllServices,
  getServicesByProvider,
};
