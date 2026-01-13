/**
 * Alerts Routes
 */

const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require authentication and admin access
router.use(protect);
router.use(adminOnly);

// Run system alert checks
router.post('/check', alertsController.checkAlerts);

// Get alert history
router.get('/history', alertsController.getAlertHistory);

module.exports = router;
