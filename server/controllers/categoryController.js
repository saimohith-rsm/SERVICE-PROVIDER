const Category = require('../models/Category');
const Service = require('../models/Service');

// @desc    Get all active categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };

    const categories = await Category.find(filter).sort({ name: 1 });

    // Count services in each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const serviceCount = await Service.countDocuments({
          categoryId: cat._id,
          isActive: true,
        });
        return {
          ...cat.toObject(),
          serviceCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: categoriesWithCount.length,
      categories: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A category with this name already exists.',
      });
    }

    const category = await Category.create({
      name,
      description,
      image,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully!',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, image, isActive } = req.body;

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(image !== undefined && { image }),
          ...(isActive !== undefined && { isActive }),
        },
      },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully!',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete / deactivate category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const serviceCount = await Service.countDocuments({ categoryId: req.params.id });
    if (serviceCount > 0) {
      // Soft-delete / deactivate if services exist
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: `Category deactivated because it is linked to ${serviceCount} service(s).`,
        category,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

