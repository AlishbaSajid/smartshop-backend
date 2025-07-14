const Review = require("../models/review");

// ✅ Add a review
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const customerId = req.user.id;
    const { serviceId } = req.params;

    // Prevent duplicate review from same customer
    const alreadyReviewed = await Review.findOne({ customerId, serviceId });
    if (alreadyReviewed) {
      return res.status(400).json({ error: "You have already reviewed this service." });
    }

    const review = new Review({ customerId, serviceId, rating, comment });
    await review.save();

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ error: "Failed to add review", details: err.message });
  }
};


// ✅ Delete a review (only by the same customer)
const deleteReview = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const customerId = req.user.id;

    const deleted = await Review.findOneAndDelete({ serviceId, customerId });
    if (!deleted) return res.status(404).json({ error: "Review not found" });

    res.json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete review", details: err.message });
  }
};

// ✅ Get reviews for a service
const getReviewsByService = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await Review.find({ serviceId })
      .populate("customerId", "name email")
      .populate({
        path: "serviceId",
        select: "title category",
        populate: {
          path: "category",
          select: "name"
        }
      })
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews", details: err.message });
  }
};


module.exports = {
  addReview,
  deleteReview,
  getReviewsByService
};
