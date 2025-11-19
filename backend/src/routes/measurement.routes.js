// backend/src/routes/measurement.routes.js

const express = require('express');
const router = express.Router();
const measurementController = require('../controllers/measurementController');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const { body, param, query } = require('express-validator');

/**
 * Validation schemas
 */

// Create measurement validation
const createMeasurementValidation = [
  body('label')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Label must be between 1 and 50 characters'),
  
  body('measurementType')
    .isIn(['standard', 'custom'])
    .withMessage('Measurement type must be either "standard" or "custom"'),
  
  body('standardSize')
    .optional()
    .isIn(['XS', 'S', 'M', 'L', 'XL'])
    .withMessage('Invalid standard size'),
  
  // Upper body measurements
  body('measurements.shoulder')
    .optional()
    .isFloat({ min: 10, max: 25 })
    .withMessage('Shoulder width must be between 10 and 25 inches'),
  
  body('measurements.bust')
    .optional()
    .isFloat({ min: 15, max: 50 })
    .withMessage('Bust measurement must be between 15 and 50 inches'),
  
  body('measurements.waist')
    .optional()
    .isFloat({ min: 15, max: 50 })
    .withMessage('Waist measurement must be between 15 and 50 inches'),
  
  body('measurements.hip')
    .optional()
    .isFloat({ min: 15, max: 55 })
    .withMessage('Hip measurement must be between 15 and 55 inches'),
  
  body('measurements.armhole')
    .optional()
    .isFloat({ min: 7, max: 18 })
    .withMessage('Armhole must be between 7 and 18 inches'),
  
  body('measurements.wrist')
    .optional()
    .isFloat({ min: 6, max: 18 })
    .withMessage('Wrist must be between 6 and 18 inches'),
  
  body('measurements.sleeveLength')
    .optional()
    .isFloat({ min: 15, max: 30 })
    .withMessage('Sleeve length must be between 15 and 30 inches'),
  
  body('measurements.frontNeckDepth')
    .optional()
    .isFloat({ min: 5, max: 15 })
    .withMessage('Front neck depth must be between 5 and 15 inches'),
  
  body('measurements.backNeckDepth')
    .optional()
    .isFloat({ min: 1, max: 8 })
    .withMessage('Back neck depth must be between 1 and 8 inches'),
  
  // Shirt measurements
  body('measurements.shirtLength')
    .optional()
    .isFloat({ min: 25, max: 55 })
    .withMessage('Shirt length must be between 25 and 55 inches'),
  
  body('measurements.shirtStyle')
    .optional()
    .isIn(['normal', 'cape', 'withShalwar', 'mGirl', 'custom'])
    .withMessage('Invalid shirt style'),
  
  // Lower body measurements
  body('measurements.trouserLength')
    .optional()
    .isFloat({ min: 30, max: 50 })
    .withMessage('Trouser length must be between 30 and 50 inches'),
  
  body('measurements.trouserWaist')
    .optional()
    .isFloat({ min: 20, max: 50 })
    .withMessage('Trouser waist must be between 20 and 50 inches'),
  
  body('measurements.trouserHip')
    .optional()
    .isFloat({ min: 25, max: 60 })
    .withMessage('Trouser hip must be between 25 and 60 inches'),
  
  body('measurements.thigh')
    .optional()
    .isFloat({ min: 15, max: 40 })
    .withMessage('Thigh measurement must be between 15 and 40 inches'),
  
  body('measurements.bottom')
    .optional()
    .isFloat({ min: 10, max: 30 })
    .withMessage('Bottom measurement must be between 10 and 30 inches'),
  
  body('measurements.kneeLength')
    .optional()
    .isFloat({ min: 15, max: 30 })
    .withMessage('Knee length must be between 15 and 30 inches'),
  
  // Shalwar measurements
  body('measurements.shalwarLength')
    .optional()
    .isFloat({ min: 35, max: 50 })
    .withMessage('Shalwar length must be between 35 and 50 inches'),
  
  body('measurements.shalwarWaist')
    .optional()
    .isFloat({ min: 20, max: 50 })
    .withMessage('Shalwar waist must be between 20 and 50 inches'),
  
  // Dupatta measurements
  body('measurements.dupattaLength')
    .optional()
    .isFloat({ min: 80, max: 120 })
    .withMessage('Dupatta length must be between 80 and 120 inches'),
  
  body('measurements.dupattaWidth')
    .optional()
    .isFloat({ min: 30, max: 50 })
    .withMessage('Dupatta width must be between 30 and 50 inches'),
  
  body('tailorNotes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Tailor notes cannot exceed 500 characters'),
  
  body('bodyType')
    .optional()
    .isIn(['petite', 'regular', 'plus', 'tall'])
    .withMessage('Invalid body type'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean'),
  
  body('measurementImage')
    .optional()
    .isURL()
    .withMessage('Invalid measurement image URL')
];

// Update measurement validation (same as create but all optional)
const updateMeasurementValidation = createMeasurementValidation.map(validation => {
  return validation.optional();
});

// Duplicate measurement validation
const duplicateMeasurementValidation = [
  body('newLabel')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('New label must be between 1 and 50 characters')
];

// Verify measurement validation
const verifyMeasurementValidation = [
  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// List measurements validation
const listMeasurementsValidation = [
  query('includeDeleted')
    .optional()
    .isBoolean()
    .withMessage('includeDeleted must be a boolean'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('sortBy must be a string')
];

// Admin list validation
const adminListValidation = [
  query('verified')
    .optional()
    .isBoolean()
    .withMessage('verified must be a boolean'),
  
  query('needsUpdate')
    .optional()
    .isBoolean()
    .withMessage('needsUpdate must be a boolean'),
  
  query('search')
    .optional()
    .isString()
    .trim()
    .withMessage('search must be a string'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isString()
    .withMessage('sortBy must be a string')
];

/**
 * Public Routes
 */

// Get standard size chart (no authentication required)
router.get(
  '/size-chart',
  measurementController.getSizeChart
);

/**
 * Customer Routes (Authenticated)
 */

// Create new measurement
router.post(
  '/',
  authenticate,
  createMeasurementValidation,
  validateRequest,
  measurementController.createMeasurement
);

// Get user's measurements
router.get(
  '/',
  authenticate,
  listMeasurementsValidation,
  validateRequest,
  measurementController.getMeasurements
);

// Get single measurement by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  validateRequest,
  measurementController.getMeasurementById
);

// Update measurement
router.put(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  updateMeasurementValidation,
  validateRequest,
  measurementController.updateMeasurement
);

// Delete measurement (soft delete)
router.delete(
  '/:id',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  validateRequest,
  measurementController.deleteMeasurement
);

// Restore soft-deleted measurement
router.put(
  '/:id/restore',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  validateRequest,
  measurementController.restoreMeasurement
);

// Set measurement as default
router.put(
  '/:id/set-default',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  validateRequest,
  measurementController.setDefaultMeasurement
);

// Duplicate measurement
router.post(
  '/:id/duplicate',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  duplicateMeasurementValidation,
  validateRequest,
  measurementController.duplicateMeasurement
);

// Compare with standard size
router.get(
  '/:id/compare/:size',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  param('size').isIn(['XS', 'S', 'M', 'L', 'XL']).withMessage('Invalid standard size'),
  validateRequest,
  measurementController.compareWithStandardSize
);

// Get suggested standard size
router.get(
  '/:id/suggest-size',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  validateRequest,
  measurementController.suggestStandardSize
);

// Download measurement sheet as PDF
router.get(
  '/:id/download',
  authenticate,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  validateRequest,
  measurementController.downloadMeasurementSheet
);

/**
 * Admin-Only Routes
 */

// Verify measurement
router.put(
  '/:id/verify',
  authenticate,
  requireAdmin,
  param('id').isMongoId().withMessage('Invalid measurement ID'),
  verifyMeasurementValidation,
  validateRequest,
  measurementController.verifyMeasurement
);

// Get measurement statistics
router.get(
  '/analytics/stats',
  authenticate,
  requireAdmin,
  measurementController.getMeasurementStatistics
);

// Get all measurements for admin view
router.get(
  '/admin/all',
  authenticate,
  requireAdmin,
  adminListValidation,
  validateRequest,
  measurementController.getAllMeasurementsAdmin
);

/**
 * Error handling middleware for this router
 */
router.use((error, req, res, next) => {
  console.error('Measurement route error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'An error occurred in measurement processing',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = router;