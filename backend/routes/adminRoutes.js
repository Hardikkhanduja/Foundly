const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getUsers,
  deleteUser,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

router.route('/stats').get(protect, admin, getAdminStats);
router.route('/users').get(protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);

module.exports = router;
