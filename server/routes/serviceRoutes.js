const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const { protect, authorize, requireApprovedProvider } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public search and detail routes
router.get('/', getServices);
router.get('/provider/my', protect, authorize('provider'), getMyServices);
router.get('/:id', getServiceById);

// Provider service management
router.post(
  '/',
  protect,
  authorize('provider'),
  requireApprovedProvider,
  [
    body('categoryId', 'Valid Category ID is required').isMongoId(),
    body('title', 'Service title is required').trim().notEmpty(),
    body('description', 'Service description is required').trim().notEmpty(),
    body('price', 'Valid service price is required').isFloat({ min: 0 }),
    validate,
  ],
  createService
);

router.put('/:id', protect, authorize('provider', 'admin'), updateService);
router.delete('/:id', protect, authorize('provider', 'admin'), deleteService);

module.exports = router;

