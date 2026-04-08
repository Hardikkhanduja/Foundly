const Claim = require('../models/Claim');
const Item = require('../models/Item');

// @desc    Create a claim
// @route   POST /api/claims
// @access  Private
const createClaim = async (req, res) => {
  try {
    const { item: itemId, message } = req.body;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user already claimed this item
    const existingClaim = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existingClaim) {
      return res.status(400).json({ message: 'You have already claimed this item' });
    }

    const claim = new Claim({
      item: itemId,
      claimant: req.user._id,
      message,
    });

    const createdClaim = await claim.save();

    // Increment item status if it's currently open
    if (item.status === 'Open') {
      item.status = 'Claimed';
      await item.save();
    }

    res.status(201).json(createdClaim);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get claims for an item
// @route   GET /api/claims/item/:itemId
// @access  Private
const getItemClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ item: req.params.itemId }).populate('claimant', 'name email');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's claims
// @route   GET /api/claims/myclaims
// @access  Private
const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id }).populate('item', 'title category status');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update claim status (Approve/Reject)
// @route   PUT /api/claims/:id/status
// @access  Private
const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const claim = await Claim.findById(req.params.id).populate('item');

    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }

    // Only owner of the item or admin can approve/reject claims
    if (claim.item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    claim.status = status;
    await claim.save();

    // If approved, mark the item as resolved
    if (status === 'approved') {
      const item = await Item.findById(claim.item._id);
      item.status = 'Resolved';
      await item.save();
      
      // Auto-reject other pending claims for this item
      await Claim.updateMany(
        { item: item._id, _id: { $ne: claim._id }, status: 'pending' },
        { $set: { status: 'rejected' } }
      );
    }

    res.json(claim);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createClaim,
  getItemClaims,
  getMyClaims,
  updateClaimStatus,
};
