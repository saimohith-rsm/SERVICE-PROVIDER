const Service = require('../models/Service');
const Provider = require('../models/Provider');
const Category = require('../models/Category');

// @desc    Get all services with comprehensive search, filters, pagination & sorting
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const {
      search,
      category,
      location,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by Category
    if (category && category !== 'all') {
      // Check if category is ObjectId or name
      const categoryDoc = await Category.findOne({
        $or: [{ _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }, { name: category }],
      });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Find services and populate provider and category
    let services = await Service.find(query)
      .populate({
        path: 'providerId',
        match: { verificationStatus: 'approved' },
        populate: {
          path: 'userId',
          select: 'name phone email profileImage address',
        },
      })
      .populate('categoryId', 'name image');

    // Filter out services where provider is not approved (or didn't match)
    services = services.filter((s) => s.providerId !== null);

    // Filter by location (check provider's serviceAreas)
    if (location && location !== 'all') {
      const locLower = location.toLowerCase();
      services = services.filter((s) =>
        s.providerId &&
        s.providerId.serviceAreas &&
        s.providerId.serviceAreas.some((area) =>
          area.toLowerCase().includes(locLower)
        )
      );
    }

    // Filter by minimum provider rating
    if (minRating) {
      services = services.filter(
        (s) => s.providerId && s.providerId.averageRating >= Number(minRating)
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      services.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      services.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating_desc') {
      services.sort(
        (a, b) =>
          (b.providerId?.averageRating || 0) - (a.providerId?.averageRating || 0)
      );
    } else {
      // newest
      services.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const total = services.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedServices = services.slice(startIndex, startIndex + Number(limit));

    res.status(200).json({
      success: true,
      count: paginatedServices.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      services: paginatedServices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate({
        path: 'providerId',
        populate: {
          path: 'userId',
          select: 'name phone email profileImage address',
        },
      })
      .populate('categoryId', 'name image description');

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current provider's own services
// @route   GET /api/services/provider/my
// @access  Private (Provider)
const getMyServices = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    const services = await Service.find({ providerId: provider._id })
      .populate('categoryId', 'name image')
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

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Approved Provider)
const createService = async (req, res, next) => {
  try {
    const { categoryId, title, description, price, estimatedDuration } = req.body;

    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found.',
      });
    }

    if (provider.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Only approved service providers can create and publish services.',
      });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Selected category does not exist.',
      });
    }

    const service = await Service.create({
      providerId: provider._id,
      categoryId,
      title,
      description,
      price: Number(price),
      estimatedDuration: estimatedDuration || '1-2 hours',
      isActive: true,
    });

    const populatedService = await Service.findById(service._id)
      .populate('categoryId', 'name image')
      .populate('providerId', 'businessName averageRating');

    res.status(201).json({
      success: true,
      message: 'Service created successfully!',
      service: populatedService,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private (Owner Provider or Admin)
const updateService = async (req, res, next) => {
  try {
    const { categoryId, title, description, price, estimatedDuration, isActive } = req.body;

    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    // Authorization check: must be owner provider or admin
    if (req.user.role !== 'admin') {
      const provider = await Provider.findOne({ userId: req.user._id });
      if (!provider || service.providerId.toString() !== provider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this service.',
        });
      }
    }

    if (categoryId) service.categoryId = categoryId;
    if (title) service.title = title;
    if (description) service.description = description;
    if (price !== undefined) service.price = Number(price);
    if (estimatedDuration) service.estimatedDuration = estimatedDuration;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();

    const updated = await Service.findById(service._id).populate('categoryId', 'name image');

    res.status(200).json({
      success: true,
      message: 'Service updated successfully!',
      service: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / deactivate service
// @route   DELETE /api/services/:id
// @access  Private (Owner Provider or Admin)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.',
      });
    }

    if (req.user.role !== 'admin') {
      const provider = await Provider.findOne({ userId: req.user._id });
      if (!provider || service.providerId.toString() !== provider._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this service.',
        });
      }
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
};

