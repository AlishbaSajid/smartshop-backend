const Provider = require("../models/provider");
const Service = require("../models/service");

const getAllProviders = async (req, res) => {
  try {
    const providers = await Provider.find({ isActive: true })
      .select("-__v")
      .populate("category", "name")
      .lean();

    const providersWithServices = await Promise.all(
      providers.map(async (provider) => {
        const services = await Service.find({ providerId: provider._id }).select("-__v -providerId");

        return {
          ...provider,
          services, // cleaned services without providerId
        };
      })
    );

    res.json(providersWithServices);
  } catch (err) {
    console.error("Get All Providers Error:", err);
    res.status(500).json({
      error: "Failed to fetch providers",
      details: err.message,
    });
  }
};

module.exports = { getAllProviders };
