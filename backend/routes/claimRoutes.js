const express = require('express');
const router = express.Router();
const {
  createClaim,
  getItemClaims,
  getMyClaims,
  updateClaimStatus
} = require('../controllers/claimController');
const { protect } = require('../middleware/auth');

router.route('/').post(protect, createClaim);
router.route('/myclaims').get(protect, getMyClaims);
router.route('/item/:itemId').get(protect, getItemClaims);
router.route('/:id/status').put(protect, updateClaimStatus);

module.exports = router;
