const mongoose = require('mongoose');

const doorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  securityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  }
}, { timestamps: true });

module.exports = mongoose.model('Door', doorSchema);
