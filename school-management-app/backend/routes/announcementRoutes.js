const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, optionalAuth, isTeacherOrAdmin } = require('../middleware/auth');

router.post('/', protect, isTeacherOrAdmin, createAnnouncement);
router.get('/', optionalAuth, getAnnouncements);
router.get('/:id', optionalAuth, getAnnouncementById);
router.put('/:id', protect, updateAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);

module.exports = router;
