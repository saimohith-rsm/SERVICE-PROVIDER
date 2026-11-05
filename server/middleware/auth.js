const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'serveease_super_secure_jwt_secret_key_2026_antigravity'
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

const requireApprovedProvider = async (req, res, next) => {
  try {
    const provider = await Provider.findOne({ userId: req.user._id });
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found for this user account.',
      });
    }

    if (provider.verificationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your provider account is currently '${provider.verificationStatus}'. Only approved providers can publish or manage services.`,
        verificationStatus: provider.verificationStatus,
      });
    }

    req.provider = provider;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  authorize,
  requireApprovedProvider,
};

