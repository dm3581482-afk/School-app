const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect, isAdmin, isTeacherOrAdmin } = require('../middleware/auth');

router.post('/', createAppointment);
router.get('/', protect, isTeacherOrAdmin, getAllAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id/status', protect, isTeacherOrAdmin, updateAppointmentStatus);
router.delete('/:id', protect, isAdmin, deleteAppointment);

module.exports = router;
