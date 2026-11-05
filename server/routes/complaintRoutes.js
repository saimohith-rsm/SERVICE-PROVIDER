const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
} = require('../controllers/complaintController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post(
  '/',
  protect,
  authorize('customer'),
  [
    body('bookingId', 'Valid Booking ID is required').isMongoId(),
    body('subject', 'Subject is required').trim().notEmpty(),
    body('description', 'Description is required').trim().notEmpty(),
    validate,
  ],
  createComplaint
);

router.get('/my', protect, authorize('customer'), getMyComplaints);
router.get('/', protect, authorize('admin'), getAllComplaints);
router.patch('/:id/status', protect, authorize('admin'), updateComplaintStatus);

module.exports = router;

