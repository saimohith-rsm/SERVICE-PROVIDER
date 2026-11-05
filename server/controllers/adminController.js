const User = require('../models/User');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// @desc    Get complete administrative dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      totalProviders,
      approvedProviders,
      pendingProviders,
      rejectedProviders,
      totalServices,
      totalBookings,
      completedBookings,
      cancelledBookings,
      openComplaints,
      recentBookings,
      recentProviders,
      completedList,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Provider.countDocuments(),
      Provider.countDocuments({ verificationStatus: 'approved' }),
      Provider.countDocuments({ verificationStatus: 'pending' }),
      Provider.countDocuments({ verificationStatus: 'rejected' }),
      Service.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: 'Completed' }),
      Booking.countDocuments({ bookingStatus: 'Cancelled' }),
      Complaint.countDocuments({ status: { $in: ['Open', 'Under Review'] } }),
      Booking.find()
        .populate('customerId', 'name email phone')
        .populate('providerId', 'businessName')
        .populate('serviceId', 'title price')
        .sort({ createdAt: -1 })
        .limit(8),
      Provider.find()
        .populate('userId', 'name email phone createdAt')
        .sort({ createdAt: -1 })
        .limit(6),
      Booking.find({ bookingStatus: 'Completed' }).select('finalPrice estimatedPrice'),
    ]);

    const totalRevenue = completedList.reduce((acc, curr) => {
      const price = curr.finalPrice !== undefined && curr.finalPrice !== null
        ? curr.finalPrice
        : curr.estimatedPrice;
      return acc + (price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        totalProviders,
        approvedProviders,
        pendingProviders,
        rejectedProviders,
        totalServices,
        totalBookings,
        completedBookings,
        cancelledBookings,
        openComplaints,
        totalRevenue,
      },
      recentBookings,
      recentProviders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all providers for admin
// @route   GET /api/admin/providers
// @access  Private (Admin)
const getAdminProviders = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.verificationStatus = status;
    }

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { serviceAreas: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    const providers = await Provider.find(query)
      .populate('userId', 'name email phone profileImage address isActive createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: providers.length,
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider verification status (Approve / Reject)
// @route   PATCH /api/admin/providers/:id/verification
// @access  Private (Admin)
const updateProviderVerification = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status.',
      });
    }

    const provider = await Provider.findById(req.params.id).populate('userId');
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found.',
      });
    }

    provider.verificationStatus = status;
    await provider.save();

    // Send notification to the provider user
    const title =
      status === 'approved'
        ? 'Congratulations! Your Provider Account is Approved'
        : 'Provider Application Status Update';

    const message =
      status === 'approved'
        ? `Your provider profile "${provider.businessName}" has been verified and approved by the administrator. You can now publish and manage your services!`
        : `Your provider profile verification was marked as ${status}. ${note || ''}`;

    await Notification.create({
      userId: provider.userId._id,
      title,
      message,
      type: 'verification',
      link: '/provider/dashboard',
    });

    res.status(200).json({
      success: true,
      message: `Provider verification status updated to '${status}'.`,
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private (Admin)
const getAdminBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (search) {
      query.bookingId = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('customerId', 'name email phone')
        .populate('providerId', 'businessName averageRating')
        .populate('serviceId', 'title price')
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

// @desc    Get all platform services for admin
// @route   GET /api/admin/services
// @access  Private (Admin)
const getAdminServices = async (req, res, next) => {
  try {
    const services = await Service.find()
      .populate('providerId', 'businessName verificationStatus averageRating')
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getAdminProviders,
  updateProviderVerification,
  getAdminBookings,
  getAdminServices,
};

