const express = require('express');
const router = express.Router();
const {
  getProfiles,
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  getDefaultProfile
} = require('../controllers/measurementProfileController');
const { protect } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getProfiles)
  .post(createProfile);

router.route('/default')
  .get(getDefaultProfile);

router.route('/:id')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile);

module.exports = router;

