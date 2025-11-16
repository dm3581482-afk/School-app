const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user (Admin only)
// @route   POST /api/auth/register
// @access  Private/Admin
exports.registerUser = async (req, res) => {
  try {
    const { username, password, fullName, role, house, email, phone, studentId, teacherId, adminKey } = req.body;

    // Validate admin registration key
    if (adminKey !== process.env.ADMIN_REGISTRATION_KEY) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin registration key'
      });
    }

    // Validate username format
    if (!username.endsWith('@kvs')) {
      return res.status(400).json({
        success: false,
        message: 'Username must end with @kvs'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Validate house for non-admin users
    if (role !== 'admin' && !['red', 'blue', 'green', 'yellow'].includes(house)) {
      return res.status(400).json({
        success: false,
        message: 'Valid house must be assigned (red, blue, green, or yellow)'
      });
    }

    // Create user
    const user = await User.create({
      username,
      password,
      fullName,
      role,
      house: role === 'admin' ? 'none' : house,
      email,
      phone,
      studentId,
      teacherId,
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        house: user.house
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    // Check user
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact admin.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          fullName: user.fullName,
          role: user.role,
          house: user.house,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user password
// @route   PUT /api/auth/update-password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
      data: { token }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, house, search } = req.query;

    let query = {};

    if (role) query.role = role;
    if (house) query.house = house;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort('-createdAt');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
