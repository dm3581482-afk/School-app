const express = require('express');
const router = express.Router();
const {
  createCommunityPost,
  getCommunityPosts,
  getCommunityPostById,
  updateCommunityPost,
  deleteCommunityPost,
  togglePinPost
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createCommunityPost);
router.get('/', protect, getCommunityPosts);
router.get('/:id', protect, getCommunityPostById);
router.put('/:id', protect, updateCommunityPost);
router.delete('/:id', protect, deleteCommunityPost);
router.put('/:id/pin', protect, togglePinPost);

module.exports = router;
