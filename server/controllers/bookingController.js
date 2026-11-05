const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// Helper to generate a human-friendly unique Booking ID
const generateBookingId = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `SE-${dateStr}-${randomPart}`;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Customer)
const createBooking = async (req, res, next) => {
  try {
    const {
      serviceId,
      bookingDate,
      timeSlot,
      serviceAddress,
      customerPhone,
      problemDescription,
      paymentMethod = 'Cash',
    } = req.body;

    // 1. Verify service exists and is active
    const service = await Service.findById(serviceId).populate('providerId');
    if (!service || !service.isActive) {
      return res.status(404).json({
        success: false,
        message: 'The requested service is currently unavailable or does not exist.',
      });
    }

    const provider = service.providerId;
    if (!provider) {
      return res.status(400).json({
        success: false,
        message: 'Service is not linked to a valid provider.',
      });
    }

    // 2. Verify provider is approved and active
    if (provider.verificationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This provider is not currently authorized to accept bookings.',
      });
    }

    if (!provider.availability?.isAcceptingBookings) {
      return res.status(400).json({
        success: false,
        message: 'This provider is currently not accepting new bookings.',
      });
    }

    // 3. Validate booking date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(bookingDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Booking date cannot be in the past.',
      });
    }

    // 4. Validate time slot belongs to provider's configured time slots
    if (
      provider.availability?.timeSlots &&
      provider.availability.timeSlots.length > 0 &&
      !provider.availability.timeSlots.includes(timeSlot)
    ) {
      return res.status(400).json({
        success: false,
        message: `The selected time slot '${timeSlot}' is not in the provider's active schedule.`,
      });
    }

    // 5. Prevent double booking: check if provider already has an active booking on that date and slot
    const existingConflict = await Booking.findOne({
      providerId: provider._id,
      bookingDate,
      timeSlot,
      bookingStatus: { $in: ['Pending', 'Accepted', 'On The Way', 'In Progress', 'Completed'] },
    });

    if (existingConflict) {
      return res.status(409).json({
        success: false,
        message: 'The selected date and time slot is already reserved. Please select another slot.',
      });
    }

    // 6. Create booking with unique booking ID
    const bookingId = generateBookingId();
    const estimatedPrice = service.price;

    const booking = await Booking.create({
      bookingId,
      customerId: req.user._id,
      providerId: provider._id,
      serviceId: service._id,
      bookingDate,
      timeSlot,
      serviceAddress: {
        street: serviceAddress.street,
        city: serviceAddress.city || 'Guntur',
        state: serviceAddress.state || 'Andhra Pradesh',
        postalCode: serviceAddress.postalCode || '',
        landmark: serviceAddress.landmark || '',
      },
      customerPhone: customerPhone || req.user.phone,
      problemDescription: problemDescription || '',
      estimatedPrice,
      finalPrice: estimatedPrice,
      bookingStatus: 'Pending',
      paymentMethod,
      paymentStatus: 'Pending',
      statusHistory: [
        {
          status: 'Pending',
          timestamp: new Date(),
          note: 'Booking request created by customer.',
          updatedBy: req.user._id,
        },
      ],
    });

    // 7. Send notification to Provider
    await Notification.create({
      userId: provider.userId,
      title: 'New Service Booking Request',
      message: `You have received a new booking #${bookingId} for "${service.title}" on ${bookingDate} (${timeSlot}).`,
      type: 'booking',
      link: `/provider/bookings/${booking._id}`,
    });

    // 8. Send notification to Customer
    await Notification.create({
      userId: req.user._id,
      title: 'Booking Placed Successfully',
      message: `Your booking #${bookingId} for "${service.title}" has been sent to ${provider.businessName}. Awaiting confirmation.`,
      type: 'booking',
      link: `/customer/bookings/${booking._id}`,
    });

    const populated = await Booking.findById(booking._id)
      .populate('providerId', 'businessName averageRating serviceAreas')
      .populate('serviceId', 'title price estimatedDuration')
      .populate('customerId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully!',
      booking: populated,
    });
  } catch (error) {
    // Catch duplicate key error if concurrent request happened
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This appointment slot was just reserved by another customer. Please choose a different slot.',
      });
    }
    next(error);
  }
};

// @desc    Get customer's bookings
// @route   GET /api/bookings/my
// @access  Private (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { customerId: req.user._id };

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate({
          path: 'providerId',
          select: 'businessName averageRating totalReviews userId',
          populate: { path: 'userId', select: 'name phone email profileImage' },
        })
        .populate('serviceId', 'title price estimatedDuration categoryId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider's bookings
// @route   GET /api/bookings/provider
// @access  Private (Provider)
const getProviderBookings = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const query = { providerId: provider._id };

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customerId', 'name email phone profileImage address')
        .populate('serviceId', 'title price estimatedDuration')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private (Customer owner, Assigned Provider, or Admin)
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({
        path: 'providerId',
        populate: { path: 'userId', select: 'name email phone profileImage' },
      })
      .populate({
        path: 'serviceId',
        populate: { path: 'categoryId', select: 'name image' },
      })
      .populate('customerId', 'name email phone profileImage address');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Access check
    const isCustomer = booking.customerId._id.toString() === req.user._id.toString();
    let isAssignedProvider = false;
    if (req.user.role === 'provider') {
      const provider = await Provider.findOne({ userId: req.user._id });
      if (provider && booking.providerId._id.toString() === provider._id.toString()) {
        isAssignedProvider = true;
      }
    }
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isAssignedProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// Valid status lifecycle transitions
const VALID_TRANSITIONS = {
  Pending: ['Accepted', 'Rejected'],
  Accepted: ['On The Way', 'Cancelled'],
  'On The Way': ['In Progress', 'Cancelled'],
  'In Progress': ['Completed'],
  Completed: [],
  Rejected: [],
  Cancelled: [],
};

// @desc    Update booking status (Provider/Admin progress updates)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Assigned Provider or Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note, finalPrice, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('providerId')
      .populate('serviceId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Verify authorized user: must be assigned provider or admin
    if (req.user.role !== 'admin') {
      const provider = await Provider.findOne({ userId: req.user._id });
      if (!provider || booking.providerId._id.toString() !== provider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned service provider can update this booking status.',
        });
      }
    }

    // Validate lifecycle transition
    const currentStatus = booking.bookingStatus;
    const allowedNextStatuses = VALID_TRANSITIONS[currentStatus] || [];

    if (req.user.role !== 'admin' && !allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${currentStatus}' to '${status}'. Allowed: ${allowedNextStatuses.join(', ') || 'None (terminal state)'}`,
      });
    }

    booking.bookingStatus = status;

    if (finalPrice !== undefined && finalPrice !== null) {
      booking.finalPrice = Number(finalPrice);
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    } else if (status === 'Completed' && booking.paymentMethod === 'Cash') {
      // In cash on service completion, mark payment as paid if specified
      if (req.body.markPaid) {
        booking.paymentStatus = 'Paid';
      }
    }

    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });

    await booking.save();

    // Create notification for Customer
    await Notification.create({
      userId: booking.customerId,
      title: `Booking Update: ${status}`,
      message: `Your booking #${booking.bookingId} for "${booking.serviceId?.title}" is now marked as ${status}. ${note || ''}`,
      type: 'status_update',
      link: `/customer/bookings/${booking._id}`,
    });

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}' successfully!`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking (Customer cancellation)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Customer owner or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.id).populate('providerId');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Only customer who owns booking or admin can cancel
    if (
      req.user.role !== 'admin' &&
      booking.customerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own bookings.',
      });
    }

    // Cannot cancel completed, already rejected, or already cancelled
    if (['Completed', 'Rejected', 'Cancelled'].includes(booking.bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already '${booking.bookingStatus}'.`,
      });
    }

    booking.bookingStatus = 'Cancelled';
    booking.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: reason || 'Cancelled by customer.',
      updatedBy: req.user._id,
    });

    await booking.save();

    // Notify provider
    if (booking.providerId?.userId) {
      await Notification.create({
        userId: booking.providerId.userId,
        title: 'Booking Cancelled',
        message: `Booking #${booking.bookingId} has been cancelled by the customer. Reason: ${reason || 'Not specified'}`,
        type: 'booking',
        link: `/provider/bookings/${booking._id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status
// @route   PATCH /api/bookings/:id/payment
// @access  Private (Provider / Admin)
const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, finalPrice } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (finalPrice !== undefined) booking.finalPrice = Number(finalPrice);

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully!',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  updatePaymentStatus,
};

