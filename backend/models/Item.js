const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Electronics', 'Documents', 'Clothing', 'Keys', 'Bags', 'Others'],
  },
  type: {
    type: String,
    required: true,
    enum: ['lost', 'found'],
  },
  status: {
    type: String,
    default: 'Open',
    enum: ['Open', 'Claimed', 'Resolved'],
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  contactPhone: {
    type: String,
    default: '',
  },
  contactEmail: {
    type: String,
    default: '',
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
