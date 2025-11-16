const CommunityPost = require('../models/Community');
const User = require('../models/User');

// @desc    Create community post
// @route   POST /api/community
// @access  Private
exports.createCommunityPost = async (req, res) => {
  try {
    const { title, content, house } = req.body;

    // Validate house access
    if (house === 'school-wide') {
      // Only admin can post school-wide
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admins can create school-wide posts'
        });
      }
    } else {
      // Users can only post to their own house
      if (req.user.house !== house && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only post to your own house community'
        });
      }
    }

    const post = await CommunityPost.create({
      title,
      content,
      house,
      postedBy: req.user._id
    });

    await post.populate('postedBy', 'fullName role house');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get community posts
// @route   GET /api/community
// @access  Private
exports.getCommunityPosts = async (req, res) => {
  try {
    const { house } = req.query;

    let query = { isActive: true };

    // Filter by house
    if (house) {
      query.house = house;
    } else {
      // Show posts from user's house and school-wide
      if (req.user.role === 'admin') {
        // Admin sees all posts
      } else {
        query.$or = [
          { house: req.user.house },
          { house: 'school-wide' }
        ];
      }
    }

    // Check authorization for specific house
    if (house && house !== 'school-wide') {
      if (req.user.role !== 'admin' && req.user.house !== house) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this house community'
        });
      }
    }

    const posts = await CommunityPost.find(query)
      .populate('postedBy', 'fullName role house')
      .sort('-isPinned -createdAt')
      .limit(100);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get post by ID
// @route   GET /api/community/:id
// @access  Private
exports.getCommunityPostById = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id)
      .populate('postedBy', 'fullName role house');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check authorization
    if (post.house !== 'school-wide' && req.user.role !== 'admin' && req.user.house !== post.house) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this post'
      });
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update community post
// @route   PUT /api/community/:id
// @access  Private (Admin/Owner)
exports.updateCommunityPost = async (req, res) => {
  try {
    let post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }

    post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'fullName role house');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete community post
// @route   DELETE /api/community/:id
// @access  Private (Admin/Owner)
exports.deleteCommunityPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && post.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Pin/Unpin community post
// @route   PUT /api/community/:id/pin
// @access  Private (Admin/Teacher)
exports.togglePinPost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only admin or teachers of the same house can pin
    if (req.user.role !== 'admin' &&
        (req.user.role !== 'teacher' || req.user.house !== post.house)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pin this post'
      });
    }

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({
      success: true,
      message: `Post ${post.isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: post
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
