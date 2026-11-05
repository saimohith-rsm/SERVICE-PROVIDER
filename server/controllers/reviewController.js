const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Provider = require('../models/Provider');
const Notification = require('../models/Notification');

// @desc    Create a review for a completed booking
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // 1. Find booking
    const booking = await Booking.findById(bookingId).populate('providerId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // 2. Verify ownership
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only review services you have booked.',
      });
    }

    // 3. Verify booking is Completed
    if (booking.bookingStatus !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Reviews are only allowed after a booking is 'Completed'. Current status is '${booking.bookingStatus}'.`,
      });
    }

    // 4. Check if already reviewed
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this booking.',
      });
    }

    // 5. Create review
    const review = await Review.create({
      customerId: req.user._id,
      providerId: booking.providerId._id,
      bookingId: booking._id,
      rating: Number(rating),
      comment,
    });

    // Notify provider
    if (booking.providerId?.userId) {
      await Notification.create({
        userId: booking.providerId.userId,
        title: 'New Customer Review Received',
        message: `${req.user.name} rated your service ${rating}/5 stars: "${comment.slice(0, 80)}..."`,
        type: 'review',
        link: `/provider/reviews`,
      });
    }

    const populatedReview = await Review.findById(review._id).populate(
      'customerId',
      'name profileImage'
    );

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a specific provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ providerId: req.params.providerId })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's written reviews
// @route   GET /api/reviews/my
// @access  Private (Customer)
const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ customerId: req.user._id })
      .populate('providerId', 'businessName averageRating')
      .populate({
        path: 'bookingId',
        populate: { path: 'serviceId', select: 'title price' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (Customer owner)
const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (review.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own reviews.',
      });
    }

    if (rating !== undefined) review.rating = Number(rating);
    if (comment !== undefined) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully!',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (Customer owner or Admin)
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.',
      });
    }

    if (
      req.user.role !== 'admin' &&
      review.customerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this review.',
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getMyReviews,
  updateReview,
  deleteReview,
};

