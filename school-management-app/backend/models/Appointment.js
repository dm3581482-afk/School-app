const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  visitorName: {
    type: String,
    required: true,
    trim: true
  },
  visitorEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  visitorPhone: {
    type: String,
    required: true,
    trim: true
  },
  visitorType: {
    type: String,
    enum: ['parent', 'volunteer', 'visitor', 'other'],
    required: true
  },
  appointmentWith: {
    type: String,
    enum: ['principal', 'vice-principal', 'teacher'],
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.appointmentWith === 'teacher';
    }
  },
  purpose: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  preferredDate: {
    type: Date,
    required: true
  },
  preferredTime: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // Validate time is between 9 AM and 6 PM
        const hour = parseInt(v.split(':')[0]);
        return hour >= 9 && hour < 18;
      },
      message: 'Appointment time must be between 9 AM and 6 PM'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  studentName: {
    type: String,
    trim: true
  },
  studentClass: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
appointmentSchema.index({ preferredDate: 1, status: 1 });
appointmentSchema.index({ appointmentWith: 1, status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
