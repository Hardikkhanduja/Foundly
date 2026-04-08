const Claim = require('../models/Claim');
const Item = require('../models/Item');

const createClaim = async (req, res) => {
  try {
    const { item: itemId, message } = req.body;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const existing = await Claim.findOne({ item: itemId, claimant: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already claimed this item' });

    const claim = await new Claim({ item: itemId, claimant: req.user._id, message }).save();

    if (item.status === 'Open') {
      item.status = 'Claimed';
      await item.save();
    }

    res.status(201).json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getItemClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ item: req.params.itemId }).populate('claimant', 'name email');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user._id }).populate('item', 'title category status');
    res.json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateClaimStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await Claim.findById(req.params.id).populate('item');

    if (!claim) return res.status(404).json({ message: 'Claim not found' });

    if (claim.item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(401).json({ message: 'Not authorized' });

    claim.status = status;
    await claim.save();

    if (status === 'approved') {
      await Item.findByIdAndUpdate(claim.item._id, { status: 'Resolved' });
      await Claim.updateMany(
        { item: claim.item._id, _id: { $ne: claim._id }, status: 'pending' },
        { $set: { status: 'rejected' } }
      );
    }

    res.json(claim);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createClaim,
  getItemClaims,
  getMyClaims,
  updateClaimStatus,
};
