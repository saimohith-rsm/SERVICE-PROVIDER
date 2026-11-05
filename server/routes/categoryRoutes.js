const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin-only category management
router.post(
  '/',
  protect,
  authorize('admin'),
  [body('name', 'Category name is required').trim().notEmpty(), validate],
  createCategory
);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

module.exports = router;

