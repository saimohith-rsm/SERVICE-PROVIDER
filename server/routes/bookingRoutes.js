const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  updatePaymentStatus,
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Customer routes
router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('serviceId', 'Valid Service ID is required').isMongoId(),
    body('bookingDate', 'Valid booking date is required (YYYY-MM-DD)').notEmpty(),
    body('timeSlot', 'Time slot is required').notEmpty(),
    body('serviceAddress.street', 'Street address is required').notEmpty(),
    body('customerPhone', 'Valid contact phone is required').notEmpty(),
    validate,
  ],
  createBooking
);

router.get('/my', protect, authorize('customer'), getMyBookings);

// Provider routes
router.get('/provider', protect, authorize('provider'), getProviderBookings);

// Booking detail & lifecycle updates
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, authorize('provider', 'admin'), updateBookingStatus);
router.patch('/:id/cancel', protect, cancelBooking);
router.patch('/:id/payment', protect, authorize('provider', 'admin'), updatePaymentStatus);

module.exports = router;

