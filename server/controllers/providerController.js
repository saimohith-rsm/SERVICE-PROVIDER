const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all approved providers with filters & sorting
// @route   GET /api/providers
// @access  Public
const getProviders = async (req, res, next) => {
  try {
    const { search, location, minRating, sort, page = 1, limit = 12 } = req.query;

    const query = { verificationStatus: 'approved' };

    // Search by business name or area
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { serviceAreas: { $elemMatch: { $regex: search, $options: 'i' } } },
      ];
    }

    // Filter by location/area
    if (location && location !== 'all') {
      query.serviceAreas = { $elemMatch: { $regex: location, $options: 'i' } };
    }

    // Filter by min rating
    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    let sortOption = { averageRating: -1, totalReviews: -1 };
    if (sort === 'rating_asc') sortOption = { averageRating: 1 };
    if (sort === 'experience_desc') sortOption = { experience: -1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [providers, total] = await Promise.all([
      Provider.find(query)
        .populate('userId', 'name email phone profileImage address')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit)),
      Provider.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: providers.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      providers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single provider by ID
// @route   GET /api/providers/:id
// @access  Public
const getProviderById = async (req, res, next) => {
  try {
    const provider = await Provider.findById(req.params.id).populate(
      'userId',
      'name email phone profileImage address'
    );

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found.',
      });
    }

    // Fetch active services offered by this provider
    const services = await Service.find({
      providerId: provider._id,
      isActive: true,
    }).populate('categoryId', 'name image');

    // Fetch reviews for this provider
    const reviews = await Review.find({ providerId: provider._id })
      .populate('customerId', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      provider,
      services,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider profile
// @route   PUT /api/providers/profile
// @access  Private (Provider)
const updateProviderProfile = async (req, res, next) => {
  try {
    const { businessName, description, experience, serviceAreas } = req.body;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    if (businessName) provider.businessName = businessName;
    if (description !== undefined) provider.description = description;
    if (experience !== undefined) provider.experience = Number(experience);
    if (serviceAreas && Array.isArray(serviceAreas)) provider.serviceAreas = serviceAreas;

    await provider.save();

    res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully!',
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update provider availability
// @route   PUT /api/providers/availability
// @access  Private (Provider)
const updateAvailability = async (req, res, next) => {
  try {
    const { days, timeSlots, isAcceptingBookings } = req.body;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    if (days && Array.isArray(days)) provider.availability.days = days;
    if (timeSlots && Array.isArray(timeSlots)) provider.availability.timeSlots = timeSlots;
    if (isAcceptingBookings !== undefined) {
      provider.availability.isAcceptingBookings = isAcceptingBookings;
    }

    await provider.save();

    res.status(200).json({
      success: true,
      message: 'Availability schedule updated successfully!',
      availability: provider.availability,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider dashboard statistics
// @route   GET /api/providers/dashboard/stats
// @access  Private (Provider)
const getProviderDashboardStats = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    const [
      totalServices,
      newBookingRequests,
      acceptedBookings,
      completedBookings,
      recentBookings,
      recentReviews,
      completedList,
    ] = await Promise.all([
      Service.countDocuments({ providerId: provider._id }),
      Booking.countDocuments({ providerId: provider._id, bookingStatus: 'Pending' }),
      Booking.countDocuments({
        providerId: provider._id,
        bookingStatus: { $in: ['Accepted', 'On The Way', 'In Progress'] },
      }),
      Booking.countDocuments({ providerId: provider._id, bookingStatus: 'Completed' }),
      Booking.find({ providerId: provider._id })
        .populate('customerId', 'name phone email profileImage')
        .populate('serviceId', 'title price')
        .sort({ createdAt: -1 })
        .limit(6),
      Review.find({ providerId: provider._id })
        .populate('customerId', 'name profileImage')
        .sort({ createdAt: -1 })
        .limit(5),
      Booking.find({
        providerId: provider._id,
        bookingStatus: 'Completed',
      }).select('finalPrice estimatedPrice paymentStatus'),
    ]);

    // Calculate total earnings from completed bookings
    const totalEarnings = completedList.reduce((acc, curr) => {
      const price = curr.finalPrice !== undefined && curr.finalPrice !== null
        ? curr.finalPrice
        : curr.estimatedPrice;
      return acc + (price || 0);
    }, 0);

    res.status(200).json({
      success: true,
      stats: {
        verificationStatus: provider.verificationStatus,
        totalServices,
        newBookingRequests,
        acceptedBookings,
        completedBookings,
        totalEarnings,
        averageRating: provider.averageRating,
        totalReviews: provider.totalReviews,
      },
      recentBookings,
      recentReviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviders,
  getProviderById,
  updateProviderProfile,
  updateAvailability,
  getProviderDashboardStats,
};

