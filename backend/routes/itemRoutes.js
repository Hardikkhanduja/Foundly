const express = require('express');
const router = express.Router();
const {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems
} = require('../controllers/itemController');
const { protect } = require('../middleware/auth');

router.route('/').get(getItems).post(protect, createItem);
router.route('/myitems').get(protect, getMyItems);
router.route('/:id').get(getItemById).put(protect, updateItem).delete(protect, deleteItem);

module.exports = router;
