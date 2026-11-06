const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Provider = require('../models/Provider');

const DEMO_FALLBACK_USERS = {
  'demo_rahul_customer_example_com': {
    _id: 'demo_rahul_customer_example_com',
    name: 'Rahul Sharma',
    email: 'rahul.customer@example.com',
    role: 'customer',
    phone: '+91 9988776655',
    isActive: true,
  },
  'demo_ramesh_electrician_serveease_com': {
    _id: 'demo_ramesh_electrician_serveease_com',
    name: 'Ramesh Kumar',
    email: 'ramesh.electrician@serveease.com',
    role: 'provider',
    phone: '+91 9848011223',
    isActive: true,
  },
  'demo_anji_mechanic_serveease_com': {
    _id: 'demo_anji_mechanic_serveease_com',
    name: 'Anji Reddy',
    email: 'anji.mechanic@serveease.com',
    role: 'provider',
    phone: '+91 9848055667',
    isActive: true,
  },
  'demo_admin_serveease_com': {
    _id: 'demo_admin_serveease_com',
    name: 'System Administrator',
    email: 'admin@serveease.com',
    role: 'admin',
    phone: '+91 9876543210',
    isActive: true,
  },
  'demo_vu241fa04910_gmail_com': {
    _id: 'demo_vu241fa04910_gmail_com',
    name: 'Sai Mohith Raja',
    email: 'vu241fa04910@gmail.com',
    role: 'customer',
    phone: '+91 9848012345',
    isActive: true,
  },
};

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

    let user = null;
    if (mongoose.connection && mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
      user = await User.findById(decoded.id);
    }

    if (!user && DEMO_FALLBACK_USERS[decoded.id]) {
      user = DEMO_FALLBACK_USERS[decoded.id];
    }

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

