const express = require('express');
const router = express.Router();

const {
  getProviders,
  getProviderById,
  updateProviderProfile,
  updateAvailability,
  getProviderDashboardStats,
} = require('../controllers/providerController');

const { protect, authorize } = require('../middleware/auth');

// Public provider listings
router.get('/', getProviders);
router.get('/dashboard/stats', protect, authorize('provider'), getProviderDashboardStats);
router.get('/:id', getProviderById);

// Provider authenticated actions
router.put('/profile', protect, authorize('provider'), updateProviderProfile);
router.put('/availability', protect, authorize('provider'), updateAvailability);

module.exports = router;

