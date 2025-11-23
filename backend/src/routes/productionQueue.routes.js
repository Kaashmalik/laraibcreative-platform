const express = require('express');
const router = express.Router();
const productionQueueController = require('../controllers/productionQueueController');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require authentication and admin access
router.use(protect);
router.use(adminOnly);

/**
 * @route   GET /api/v1/production-queue
 * @desc    Get all production queue items
 * @access  Admin
 */
router.get('/', productionQueueController.getQueue);

/**
 * @route   GET /api/v1/production-queue/:id
 * @desc    Get single queue item
 * @access  Admin
 */
router.get('/:id', productionQueueController.getQueueItem);

/**
 * @route   PATCH /api/v1/production-queue/:id/status
 * @desc    Update queue item status
 * @access  Admin
 */
router.patch('/:id/status', productionQueueController.updateStatus);

/**
 * @route   PATCH /api/v1/production-queue/:id/assign
 * @desc    Assign order to tailor
 * @access  Admin
 */
router.patch('/:id/assign', productionQueueController.assignTailor);

/**
 * @route   POST /api/v1/production-queue/bulk/status
 * @desc    Bulk update status
 * @access  Admin
 */
router.post('/bulk/status', productionQueueController.bulkUpdateStatus);

/**
 * @route   POST /api/v1/production-queue/bulk/cutting-sheets
 * @desc    Generate cutting sheets for multiple orders
 * @access  Admin
 */
router.post('/bulk/cutting-sheets', productionQueueController.generateCuttingSheets);

/**
 * @route   POST /api/v1/production-queue/bulk/whatsapp
 * @desc    Send WhatsApp blast to multiple orders
 * @access  Admin
 */
router.post('/bulk/whatsapp', productionQueueController.sendWhatsAppBlast);

module.exports = router;

