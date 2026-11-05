const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  registerCustomer,
  registerProvider,
  login,
  getMe,
  updateProfile,
  updatePassword,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Customer registration route
router.post(
  '/register',
  [
    body('name', 'Name is required').trim().notEmpty(),
    body('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('phone', 'Valid phone number is required').trim().notEmpty(),
    validate,
  ],
  registerCustomer
);

// Provider registration route
router.post(
  '/register-provider',
  [
    body('name', 'Contact name is required').trim().notEmpty(),
    body('businessName', 'Business/Service name is required').trim().notEmpty(),
    body('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    body('phone', 'Valid phone number is required').trim().notEmpty(),
    validate,
  ],
  registerProvider
);

// Login route
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').trim().isEmail().normalizeEmail(),
    body('password', 'Password is required').notEmpty(),
    validate,
  ],
  login
);

// Protected profile routes
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);

module.exports = router;

