const express = require('express');
const router = express.Router();

const {
  getAdminDashboardStats,
  getAdminProviders,
  updateProviderVerification,
  getAdminBookings,
  getAdminServices,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/providers', getAdminProviders);
router.patch('/providers/:id/verification', updateProviderVerification);
router.get('/bookings', getAdminBookings);
router.get('/services', getAdminServices);

module.exports = router;

