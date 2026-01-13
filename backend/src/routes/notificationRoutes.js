/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/auth.middleware');

// SSE endpoint for real-time notifications
router.get('/events', protect, notificationController.setupSSEConnection);

module.exports = router;
