const express = require('express');
const router = express.Router();

const { getUsers, toggleUserStatus } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/', getUsers);
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;

