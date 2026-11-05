const User = require('../models/User');
const Provider = require('../models/Provider');
const Notification = require('../models/Notification');
const { generateToken } = require('../utils/jwt');

// @desc    Register a new Customer
// @route   POST /api/auth/register
// @access  Public
const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'customer', // strictly enforce customer
      address: address || {},
    });

    // Create a welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Welcome to ServeEase!',
      message: 'Explore local services in Guntur and surrounding areas, compare prices, and book trusted professionals.',
      type: 'system',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Service Provider
// @route   POST /api/auth/register-provider
// @access  Public
const registerProvider = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      businessName,
      description,
      experience,
      serviceAreas,
      address,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user with provider role
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'provider',
      address: address || {},
    });

    // Create associated provider profile with pending status
    const provider = await Provider.create({
      userId: user._id,
      businessName: businessName || `${name}'s Services`,
      description: description || 'Professional local services in Guntur region.',
      experience: Number(experience) || 1,
      serviceAreas: Array.isArray(serviceAreas) && serviceAreas.length > 0
        ? serviceAreas
        : ['Guntur', 'Brodipet', 'Arundelpet'],
      verificationStatus: 'pending',
    });

    // Welcome notification
    await Notification.create({
      userId: user._id,
      title: 'Provider Application Received',
      message: 'Your service provider profile is pending admin approval. You will receive an update once verified.',
      type: 'verification',
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: 'Provider registration submitted successfully! Pending admin approval.',
      token,
      user,
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Explicitly select password field
    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found for this email address. Please check your spelling or sign up.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password entered. Please try again.',
      });
    }

    const token = generateToken(user._id, user.role);

    // If provider, load provider details as well
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = await Provider.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user,
      provider: providerProfile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let provider = null;

    if (user.role === 'provider') {
      provider = await Provider.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user,
      provider,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(name && { name }),
          ...(phone && { phone }),
          ...(address && { address }),
          ...(profileImage !== undefined && { profileImage }),
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  registerProvider,
  login,
  getMe,
  updateProfile,
  updatePassword,
};

