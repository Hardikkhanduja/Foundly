const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const resolvedItems = await Item.countDocuments({ status: 'Resolved' });
    const pendingClaims = await Claim.countDocuments({ status: 'pending' });
    const totalUsers = await User.countDocuments();

    res.json({
      totalItems,
      resolvedItems,
      pendingClaims,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      // Don't let admin delete themselves
      if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot delete yourself' });
      }
      // Consider deleting their items and claims too, but just deleting user for now
      await User.deleteOne({_id: user._id});
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAdminStats,
  getUsers,
  deleteUser,
};
