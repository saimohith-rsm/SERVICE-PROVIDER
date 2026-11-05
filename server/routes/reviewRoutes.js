const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createReview,
  getProviderReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/provider/:providerId', getProviderReviews);
router.get('/my', protect, authorize('customer'), getMyReviews);

router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('bookingId', 'Valid Booking ID is required').isMongoId(),
    body('rating', 'Rating must be an integer between 1 and 5').isInt({ min: 1, max: 5 }),
    body('comment', 'Comment is required').trim().notEmpty(),
    validate,
  ],
  createReview
);

router.put('/:id', protect, authorize('customer'), updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;

