const mongoose = require('mongoose');

/**
 * Fabric Inventory Model
 * Manages fabric stock with low-stock alerts
 */

const fabricInventorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Fabric name is required'],
    trim: true,
    index: true
  },
  
  type: {
    type: String,
    required: true,
    enum: ['lawn', 'chiffon', 'silk', 'cotton', 'velvet', 'georgette', 'organza', 'linen', 'karandi', 'khaddar', 'other'],
    index: true
  },
  
  color: {
    type: String,
    trim: true,
    index: true
  },
  
  quality: {
    type: String,
    enum: ['standard', 'premium', 'luxury'],
    default: 'standard'
  },
  
  // Inventory tracking
  stock: {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    unit: {
      type: String,
      enum: ['meters', 'yards'],
      default: 'meters'
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Threshold cannot be negative']
    },
    reorderPoint: {
      type: Number,
      default: 5,
      min: [0, 'Reorder point cannot be negative']
    }
  },
  
  // Pricing
  pricing: {
    costPerMeter: {
      type: Number,
      required: true,
      min: [0, 'Cost cannot be negative']
    },
    sellingPricePerMeter: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      enum: ['PKR', 'USD', 'SAR'],
      default: 'PKR'
    }
  },
  
  // Supplier information
  supplier: {
    name: String,
    contact: String,
    email: String,
    phone: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
    default: 'in-stock',
    index: true
  },
  
  // Auto-disable when out of stock
  autoDisable: {
    type: Boolean,
    default: true
  },
  
  // Alerts
  alerts: {
    lowStockAlerted: {
      type: Boolean,
      default: false
    },
    outOfStockAlerted: {
      type: Boolean,
      default: false
    },
    lastAlertDate: Date
  },
  
  // Images
  images: [{
    url: String,
    publicId: String,
    alt: String
  }],
  
  // Notes
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Indexes
fabricInventorySchema.index({ status: 1, 'stock.quantity': 1 });
fabricInventorySchema.index({ type: 1, color: 1 });

// Pre-save: Update status based on stock
fabricInventorySchema.pre('save', function(next) {
  const quantity = this.stock.quantity;
  const threshold = this.stock.lowStockThreshold;
  const reorderPoint = this.stock.reorderPoint;
  
  if (quantity === 0) {
    this.status = 'out-of-stock';
    if (this.autoDisable) {
      // TODO: Disable products using this fabric
    }
  } else if (quantity <= reorderPoint) {
    this.status = 'out-of-stock';
  } else if (quantity <= threshold) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  
  next();
});

// Static method: Get low stock items
fabricInventorySchema.statics.getLowStock = function() {
  return this.find({
    status: { $in: ['low-stock', 'out-of-stock'] },
    'alerts.lowStockAlerted': false
  });
};

// Static method: Get available fabrics
fabricInventorySchema.statics.getAvailable = function() {
  return this.find({
    status: 'in-stock',
    'stock.quantity': { $gt: 0 }
  });
};

const FabricInventory = mongoose.model('FabricInventory', fabricInventorySchema);

module.exports = FabricInventory;

