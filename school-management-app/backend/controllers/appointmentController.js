const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Public
exports.createAppointment = async (req, res) => {
  try {
    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorType,
      appointmentWith,
      teacherId,
      purpose,
      preferredDate,
      preferredTime,
      studentName,
      studentClass
    } = req.body;

    // Validate time slot (9 AM - 6 PM)
    const hour = parseInt(preferredTime.split(':')[0]);
    if (hour < 9 || hour >= 18) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time must be between 9 AM and 6 PM'
      });
    }

    // If appointment with teacher, validate teacherId
    if (appointmentWith === 'teacher') {
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required for teacher appointments'
        });
      }

      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return res.status(400).json({
          success: false,
          message: 'Invalid teacher ID'
        });
      }
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      preferredDate: new Date(preferredDate),
      preferredTime,
      appointmentWith,
      teacherId: appointmentWith === 'teacher' ? teacherId : null,
      status: { $in: ['pending', 'approved'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    const appointment = await Appointment.create({
      visitorName,
      visitorEmail,
      visitorPhone,
      visitorType,
      appointmentWith,
      teacherId: appointmentWith === 'teacher' ? teacherId : null,
      purpose,
      preferredDate,
      preferredTime,
      studentName,
      studentClass
    });

    // Create notification for admin/teacher
    let recipientQuery = {};
    if (appointmentWith === 'principal') {
      recipientQuery = { role: 'admin' };
    } else if (appointmentWith === 'vice-principal') {
      recipientQuery = { role: 'admin' };
    } else if (appointmentWith === 'teacher') {
      recipientQuery = { _id: teacherId };
    }

    const recipients = await User.find(recipientQuery);

    for (const recipient of recipients) {
      await Notification.create({
        recipient: recipient._id,
        type: 'appointment',
        title: 'New Appointment Request',
        message: `${visitorName} has requested an appointment on ${new Date(preferredDate).toDateString()} at ${preferredTime}`,
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        priority: 'high'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment request submitted successfully. You will receive confirmation via email.',
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private (Admin/Teacher)
exports.getAllAppointments = async (req, res) => {
  try {
    const { status, appointmentWith, startDate, endDate } = req.query;

    let query = {};

    if (status) query.status = status;
    if (appointmentWith) query.appointmentWith = appointmentWith;

    // For teachers, show only their appointments
    if (req.user.role === 'teacher') {
      query.$or = [
        { teacherId: req.user._id },
        { appointmentWith: { $in: ['principal', 'vice-principal'] } }
      ];
    }

    if (startDate && endDate) {
      query.preferredDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const appointments = await Appointment.find(query)
      .populate('teacherId', 'fullName email')
      .populate('approvedBy', 'fullName')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Admin/Teacher)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, rejectionReason, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Authorization check
    if (appointment.appointmentWith === 'teacher' && req.user.role === 'teacher') {
      if (appointment.teacherId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this appointment'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    appointment.status = status;
    appointment.approvedBy = req.user._id;

    if (rejectionReason) {
      appointment.rejectionReason = rejectionReason;
    }

    if (notes) {
      appointment.notes = notes;
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('teacherId', 'fullName email')
      .populate('approvedBy', 'fullName');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (Admin only)
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
