const MeasurementProfile = require('../models/MeasurementProfile');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Get all measurement profiles for user
 * @route GET /api/v1/measurement-profiles
 * @access Private
 */
exports.getProfiles = async (req, res) => {
  try {
    const profiles = await MeasurementProfile.getUserProfiles(req.user.id);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error('Error fetching measurement profiles:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch measurement profiles'
    });
  }
};

/**
 * Get single measurement profile
 * @route GET /api/v1/measurement-profiles/:id
 * @access Private
 */
exports.getProfile = async (req, res) => {
  try {
    const profile = await MeasurementProfile.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Measurement profile not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching measurement profile:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch measurement profile'
    });
  }
};

/**
 * Create measurement profile
 * @route POST /api/v1/measurement-profiles
 * @access Private
 */
exports.createProfile = async (req, res) => {
  try {
    const { name, type, measurements, notes, avatarImage, isDefault } = req.body;

    if (!name || !measurements) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Name and measurements are required'
      });
    }

    const profile = await MeasurementProfile.create({
      userId: req.user.id,
      name,
      type: type || 'custom',
      measurements,
      notes,
      avatarImage,
      isDefault: isDefault || false
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: profile,
      message: 'Measurement profile created successfully'
    });
  } catch (error) {
    console.error('Error creating measurement profile:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to create measurement profile'
    });
  }
};

/**
 * Update measurement profile
 * @route PUT /api/v1/measurement-profiles/:id
 * @access Private
 */
exports.updateProfile = async (req, res) => {
  try {
    const profile = await MeasurementProfile.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Measurement profile not found'
      });
    }

    const { name, type, measurements, notes, avatarImage, isDefault } = req.body;

    if (name) profile.name = name;
    if (type) profile.type = type;
    if (measurements) profile.measurements = measurements;
    if (notes !== undefined) profile.notes = notes;
    if (avatarImage !== undefined) profile.avatarImage = avatarImage;
    if (isDefault !== undefined) profile.isDefault = isDefault;
    
    profile.lastUsed = new Date();

    await profile.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: profile,
      message: 'Measurement profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating measurement profile:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update measurement profile'
    });
  }
};

/**
 * Delete measurement profile
 * @route DELETE /api/v1/measurement-profiles/:id
 * @access Private
 */
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await MeasurementProfile.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Measurement profile not found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Measurement profile deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting measurement profile:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to delete measurement profile'
    });
  }
};

/**
 * Get default profile
 * @route GET /api/v1/measurement-profiles/default
 * @access Private
 */
exports.getDefaultProfile = async (req, res) => {
  try {
    const profile = await MeasurementProfile.getDefaultProfile(req.user.id);

    if (!profile) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'No default measurement profile found'
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching default profile:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch default profile'
    });
  }
};

