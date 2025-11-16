const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin/Teacher)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, type, house, priority, isPublic, expiryDate } = req.body;

    // Teachers can only create house-specific announcements for their house
    if (req.user.role === 'teacher') {
      if (type === 'school-wide') {
        return res.status(403).json({
          success: false,
          message: 'Teachers cannot create school-wide announcements'
        });
      }
      if (house !== req.user.house) {
        return res.status(403).json({
          success: false,
          message: 'You can only create announcements for your house'
        });
      }
    }

    const announcement = await Announcement.create({
      title,
      content,
      type,
      house: type === 'school-wide' ? 'all' : house,
      priority,
      isPublic,
      postedBy: req.user._id,
      expiryDate
    });

    // Create notifications for relevant users
    let recipientQuery = {};
    if (type === 'school-wide') {
      recipientQuery = { role: { $in: ['student', 'teacher', 'captain', 'vice-captain'] } };
    } else if (house) {
      recipientQuery = { house };
    }

    const recipients = await User.find(recipientQuery);

    const notifications = recipients.map(recipient => ({
      recipient: recipient._id,
      type: 'announcement',
      title: 'New Announcement',
      message: title,
      relatedId: announcement._id,
      relatedModel: 'Announcement',
      priority: priority === 'urgent' ? 'high' : 'medium'
    }));

    await Notification.insertMany(notifications);

    await announcement.populate('postedBy', 'fullName role');

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Public (with optional auth)
exports.getAnnouncements = async (req, res) => {
  try {
    const { type, house, priority } = req.query;

    let query = { isActive: true };

    // Check for expired announcements
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    ];

    // If user is not logged in, show only public announcements
    if (!req.user) {
      query.isPublic = true;
    } else {
      // Show announcements based on user's house and role
      if (type) query.type = type;
      if (house) query.house = house;
      if (priority) query.priority = priority;

      // Filter by house if not admin
      if (req.user.role !== 'admin') {
        query.$or = [
          { house: 'all' },
          { house: req.user.house }
        ];
      }
    }

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'fullName role')
      .sort('-priority -createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Public (with optional auth)
exports.getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('postedBy', 'fullName role');

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check access permissions
    if (!req.user && !announcement.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'This announcement is not public'
      });
    }

    res.status(200).json({
      success: true,
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin/Owner)
exports.updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && announcement.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this announcement'
      });
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'fullName role');

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin/Owner)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && announcement.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this announcement'
      });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
