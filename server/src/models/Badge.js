const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'expired'],
    default: 'active'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
