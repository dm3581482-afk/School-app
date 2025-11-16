const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['school-wide', 'house-specific', 'urgent', 'general'],
    required: true
  },
  house: {
    type: String,
    enum: ['red', 'blue', 'green', 'yellow', 'all'],
    default: 'all'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isPublic: {
    type: Boolean,
    default: false // If true, visible to non-logged in visitors
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient querying
announcementSchema.index({ type: 1, isActive: 1, createdAt: -1 });
announcementSchema.index({ house: 1, isActive: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
