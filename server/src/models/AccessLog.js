const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  badgeId: {
    type: String,
    required: true
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    required: true
  },
  doorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Door',
    required: true
  },
  result: {
    type: String,
    enum: ['granted', 'denied'],
    required: true
  },
  reason: {
    type: String
  },
  simulatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AccessLog', accessLogSchema);
