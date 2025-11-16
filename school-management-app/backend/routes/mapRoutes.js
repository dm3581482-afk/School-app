const express = require('express');
const router = express.Router();
const {
  uploadMap,
  getAllMaps,
  getActiveMap,
  activateMap,
  updateMap,
  deleteMap,
  addMarker,
  deleteMarker
} = require('../controllers/mapController');
const { protect, isAdmin } = require('../middleware/auth');

router.post('/', protect, isAdmin, uploadMap);
router.get('/', protect, isAdmin, getAllMaps);
router.get('/active', getActiveMap);
router.put('/:id/activate', protect, isAdmin, activateMap);
router.put('/:id', protect, isAdmin, updateMap);
router.delete('/:id', protect, isAdmin, deleteMap);
router.post('/:id/markers', protect, isAdmin, addMarker);
router.delete('/:id/markers/:markerId', protect, isAdmin, deleteMarker);

module.exports = router;
