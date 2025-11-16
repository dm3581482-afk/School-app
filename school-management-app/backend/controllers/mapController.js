const Map3D = require('../models/Map3D');

// @desc    Upload new 3D map
// @route   POST /api/maps
// @access  Private (Admin only)
exports.uploadMap = async (req, res) => {
  try {
    const { name, description, modelUrl, thumbnailUrl, fileSize, fileFormat, metadata, markers } = req.body;

    const map = await Map3D.create({
      name,
      description,
      modelUrl,
      thumbnailUrl,
      fileSize,
      fileFormat,
      metadata,
      markers,
      uploadedBy: req.user._id,
      isActive: false
    });

    res.status(201).json({
      success: true,
      message: '3D map uploaded successfully',
      data: map
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all maps
// @route   GET /api/maps
// @access  Private (Admin only)
exports.getAllMaps = async (req, res) => {
  try {
    const maps = await Map3D.find()
      .populate('uploadedBy', 'fullName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: maps.length,
      data: maps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active map
// @route   GET /api/maps/active
// @access  Public
exports.getActiveMap = async (req, res) => {
  try {
    const map = await Map3D.findOne({ isActive: true });

    if (!map) {
      return res.status(404).json({
        success: false,
        message: 'No active map found'
      });
    }

    res.status(200).json({
      success: true,
      data: map
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Set map as active
// @route   PUT /api/maps/:id/activate
// @access  Private (Admin only)
exports.activateMap = async (req, res) => {
  try {
    const map = await Map3D.findById(req.params.id);

    if (!map) {
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }

    // Deactivate all other maps
    await Map3D.updateMany({ _id: { $ne: map._id } }, { isActive: false });

    // Activate this map
    map.isActive = true;
    await map.save();

    res.status(200).json({
      success: true,
      message: 'Map activated successfully',
      data: map
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update map
// @route   PUT /api/maps/:id
// @access  Private (Admin only)
exports.updateMap = async (req, res) => {
  try {
    let map = await Map3D.findById(req.params.id);

    if (!map) {
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }

    map = await Map3D.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Map updated successfully',
      data: map
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete map
// @route   DELETE /api/maps/:id
// @access  Private (Admin only)
exports.deleteMap = async (req, res) => {
  try {
    const map = await Map3D.findById(req.params.id);

    if (!map) {
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }

    if (map.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete active map. Please activate another map first.'
      });
    }

    await map.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Map deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add marker to map
// @route   POST /api/maps/:id/markers
// @access  Private (Admin only)
exports.addMarker = async (req, res) => {
  try {
    const map = await Map3D.findById(req.params.id);

    if (!map) {
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }

    const { name, description, position, type } = req.body;

    map.markers.push({
      name,
      description,
      position,
      type
    });

    await map.save();

    res.status(200).json({
      success: true,
      message: 'Marker added successfully',
      data: map
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete marker from map
// @route   DELETE /api/maps/:id/markers/:markerId
// @access  Private (Admin only)
exports.deleteMarker = async (req, res) => {
  try {
    const map = await Map3D.findById(req.params.id);

    if (!map) {
      return res.status(404).json({
        success: false,
        message: 'Map not found'
      });
    }

    map.markers = map.markers.filter(
      marker => marker._id.toString() !== req.params.markerId
    );

    await map.save();

    res.status(200).json({
      success: true,
      message: 'Marker deleted successfully',
      data: map
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
