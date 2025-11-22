const mongoose = require('mongoose');

/**
 * Production Queue Model
 * Manages order production workflow with status tracking
 */

const productionQueueSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true
  },
  
  orderNumber: {
    type: String,
    required: true,
    index: true
  },
  
  // Current status in production pipeline
  status: {
    type: String,
    enum: [
      'pending',           // Waiting to be assigned
      'assigned',          // Assigned to tailor
      'cutting',           // Fabric cutting in progress
      'stitching',         // Stitching in progress
      'embroidery',         // Embroidery (if applicable)
      'finishing',         // Final finishing touches
      'quality-check',     // Quality control
      'ready-for-shipment', // Ready to ship
      'completed',         // Production complete
      'on-hold',           // Temporarily paused
      'cancelled'          // Cancelled
    ],
    default: 'pending',
    index: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  
  // Tailor assignment
  assignedTailor: {
    tailorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tailor',
      index: true
    },
    assignedAt: Date,
    estimatedCompletion: Date,
    notes: String
  },
  
  // Production timeline
  timeline: {
    assignedAt: Date,
    cuttingStarted: Date,
    cuttingCompleted: Date,
    stitchingStarted: Date,
    stitchingCompleted: Date,
    embroideryStarted: Date,
    embroideryCompleted: Date,
    finishingStarted: Date,
    finishingCompleted: Date,
    qualityCheckPassed: Date,
    readyForShipmentAt: Date,
    completedAt: Date
  },
  
  // Production notes
  notes: [{
    text: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['note', 'issue', 'update', 'reminder'],
      default: 'note'
    }
  }],
  
  // Cutting sheet data
  cuttingSheet: {
    generated: {
      type: Boolean,
      default: false
    },
    generatedAt: Date,
    pdfUrl: String,
    measurements: mongoose.Schema.Types.Mixed
  },
  
  // Quality check
  qualityCheck: {
    passed: Boolean,
    checkedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    checkedAt: Date,
    issues: [{
      description: String,
      severity: {
        type: String,
        enum: ['minor', 'major', 'critical']
      },
      resolved: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Rush order flag
  isRushOrder: {
    type: Boolean,
    default: false
  },
  
  // Estimated completion date
  estimatedCompletionDate: Date,
  
  // Actual completion date
  actualCompletionDate: Date
}, {
  timestamps: true
});

// Indexes
productionQueueSchema.index({ status: 1, priority: -1, createdAt: 1 });
productionQueueSchema.index({ 'assignedTailor.tailorId': 1, status: 1 });
productionQueueSchema.index({ estimatedCompletionDate: 1 });

// Virtual: Days in production
productionQueueSchema.virtual('daysInProduction').get(function() {
  if (!this.timeline.assignedAt) return 0;
  const end = this.timeline.completedAt || new Date();
  return Math.ceil((end - this.timeline.assignedAt) / (1000 * 60 * 60 * 24));
});

// Method: Update status
productionQueueSchema.methods.updateStatus = function(newStatus, userId = null) {
  this.status = newStatus;
  
  // Update timeline
  const now = new Date();
  switch (newStatus) {
    case 'assigned':
      this.timeline.assignedAt = now;
      break;
    case 'cutting':
      this.timeline.cuttingStarted = now;
      break;
    case 'stitching':
      this.timeline.cuttingCompleted = now;
      this.timeline.stitchingStarted = now;
      break;
    case 'embroidery':
      this.timeline.stitchingCompleted = now;
      this.timeline.embroideryStarted = now;
      break;
    case 'finishing':
      this.timeline.embroideryCompleted = now;
      this.timeline.finishingStarted = now;
      break;
    case 'quality-check':
      this.timeline.finishingCompleted = now;
      break;
    case 'ready-for-shipment':
      this.timeline.qualityCheckPassed = now;
      this.timeline.readyForShipmentAt = now;
      break;
    case 'completed':
      this.timeline.completedAt = now;
      this.actualCompletionDate = now;
      break;
  }
  
  // Add note
  if (userId) {
    this.notes.push({
      text: `Status updated to ${newStatus}`,
      addedBy: userId,
      type: 'update'
    });
  }
  
  return this.save();
};

// Method: Assign to tailor
productionQueueSchema.methods.assignToTailor = function(tailorId, estimatedCompletion, notes = '') {
  this.assignedTailor = {
    tailorId,
    assignedAt: new Date(),
    estimatedCompletion,
    notes
  };
  this.status = 'assigned';
  this.timeline.assignedAt = new Date();
  return this.save();
};

// Static method: Get queue by status
productionQueueSchema.statics.getByStatus = function(status) {
  return this.find({ status })
    .populate('orderId')
    .populate('assignedTailor.tailorId')
    .sort({ priority: -1, createdAt: 1 });
};

// Static method: Get overdue items
productionQueueSchema.statics.getOverdue = function() {
  return this.find({
    status: { $nin: ['completed', 'cancelled'] },
    estimatedCompletionDate: { $lt: new Date() }
  })
    .populate('orderId')
    .populate('assignedTailor.tailorId')
    .sort({ estimatedCompletionDate: 1 });
};

const ProductionQueue = mongoose.model('ProductionQueue', productionQueueSchema);

module.exports = ProductionQueue;

