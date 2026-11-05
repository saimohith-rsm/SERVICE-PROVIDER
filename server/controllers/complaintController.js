const Complaint = require('../models/Complaint');
const Booking = require('../models/Booking');

// @desc    File a complaint
// @route   POST /api/complaints
// @access  Private (Customer)
const createComplaint = async (req, res, next) => {
  try {
    const { bookingId, subject, description } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Associated booking not found.',
      });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only file complaints for your own bookings.',
      });
    }

    const complaint = await Complaint.create({
      customerId: req.user._id,
      bookingId,
      subject,
      description,
      status: 'Open',
    });

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully. Our support team will review it shortly.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer complaints
// @route   GET /api/complaints/my
// @access  Private (Customer)
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ customerId: req.user._id })
      .populate({
        path: 'bookingId',
        select: 'bookingId bookingDate timeSlot estimatedPrice bookingStatus',
        populate: { path: 'providerId', select: 'businessName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (Admin)
// @route   GET /api/complaints
// @access  Private (Admin)
const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find()
      .populate('customerId', 'name email phone')
      .populate({
        path: 'bookingId',
        select: 'bookingId bookingDate timeSlot',
        populate: { path: 'providerId', select: 'businessName' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status & resolution note (Admin)
// @route   PATCH /api/complaints/:id/status
// @access  Private (Admin)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, adminResponse } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(status && { status }),
          ...(adminResponse !== undefined && { adminResponse }),
        },
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint status updated.',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
};

