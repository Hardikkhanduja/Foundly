const Item = require('../models/Item');

const getItems = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword ? { title: { $regex: req.query.keyword, $options: 'i' } } : {};
    const category = req.query.category ? { category: req.query.category } : {};
    const type = req.query.type ? { type: req.query.type } : {};
    const status = req.query.status ? { status: req.query.status } : {};

    const filter = { ...keyword, ...category, ...type, ...status };
    const count = await Item.countDocuments(filter);
    const items = await Item.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({ items, page, pages: Math.ceil(count / pageSize) });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('postedBy', 'name email');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const createItem = async (req, res) => {
  try {
    const { title, description, category, type, location, date, imageUrl, contactPhone, contactEmail } = req.body;
    const item = await new Item({ title, description, category, type, location, date, imageUrl, contactPhone: contactPhone || '', contactEmail: contactEmail || '', postedBy: req.user._id }).save();
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(401).json({ message: 'Not authorized' });

    const { title, description, category, type, location, date, imageUrl, status, contactPhone, contactEmail } = req.body;
    Object.assign(item, { title, description, category, type, location, date, imageUrl, status, contactPhone, contactEmail });

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(401).json({ message: 'Not authorized' });

    await Item.deleteOne({ _id: item._id });
    res.json({ message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ postedBy: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getStats = async (req, res) => {
  try {
    const total = await Item.countDocuments();
    const resolved = await Item.countDocuments({ status: 'Resolved' });
    const active = await Item.countDocuments({ status: { $in: ['Open', 'Claimed'] } });
    res.json({ total, resolved, active });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getMyItems,
  getStats,
};
