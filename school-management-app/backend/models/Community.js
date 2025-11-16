const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
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
    maxlength: 5000
  },
  house: {
    type: String,
    enum: ['red', 'blue', 'green', 'yellow', 'school-wide'],
    required: true
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
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient querying
communityPostSchema.index({ house: 1, isActive: 1, createdAt: -1 });
communityPostSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
