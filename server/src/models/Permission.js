const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'teacher', 'security'],
    default: null
  },
  buildingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
    default: null
  },
  doorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Door',
    default: null
  },
  allowedDays: [{
    type: Number, // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    min: 0,
    max: 6
  }],
  startTime: {
    type: String, // HH:mm format
    match: /^([01]\d|2[0-3]):([0-5]\d)$/
  },
  endTime: {
    type: String, // HH:mm format
    match: /^([01]\d|2[0-3]):([0-5]\d)$/
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
