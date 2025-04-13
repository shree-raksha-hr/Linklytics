// models/Url.js
const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    required: true,
    unique: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  clicks: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null  // Allow anonymous URLs
  },
  // Added for custom expirations
  expiresAt: {
    type: Date,
    default: null
  },
  // Custom alias flag to distinguish between auto-generated and custom shortIds
  isCustom: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Url', UrlSchema);