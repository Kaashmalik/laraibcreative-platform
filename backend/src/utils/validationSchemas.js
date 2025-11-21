const Joi = require('joi');

// Reusable schemas
const objectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid ID format');

const addressSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  phone: Joi.string().required().pattern(/^(\+92|0|92)[0-9]{10}$/).message('Invalid phone number format'),
  whatsapp: Joi.string().pattern(/^(\+92|0|92)[0-9]{10}$/).allow('', null),
  addressLine1: Joi.string().required(),
  addressLine2: Joi.string().allow('', null),
  city: Joi.string().required(),
  province: Joi.string().required(),
  postalCode: Joi.string().pattern(/^[0-9]{5}$/).message('Invalid postal code'),
  deliveryInstructions: Joi.string().max(500).allow('', null)
});

const measurementSchema = Joi.object({
  shirtLength: Joi.number().min(0).max(100),
  shoulderWidth: Joi.number().min(0).max(50),
  sleeveLength: Joi.number().min(0).max(60),
  armHole: Joi.number().min(0).max(40),
  bust: Joi.number().min(0).max(100),
  waist: Joi.number().min(0).max(100),
  hip: Joi.number().min(0).max(120),
  frontNeckDepth: Joi.number().min(0).max(20),
  backNeckDepth: Joi.number().min(0).max(20),
  wrist: Joi.number().min(0).max(30),
  trouserLength: Joi.number().min(0).max(80),
  trouserWaist: Joi.number().min(0).max(100),
  trouserHip: Joi.number().min(0).max(120),
  thigh: Joi.number().min(0).max(60),
  bottom: Joi.number().min(0).max(40),
  kneeLength: Joi.number().min(0).max(40),
  dupattaLength: Joi.number().min(0).max(150),
  dupattaWidth: Joi.number().min(0).max(60),
  unit: Joi.string().valid('inches', 'cm').default('inches'),
  sizeLabel: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom')
});

const orderItemSchema = Joi.object({
  product: objectId.required(),
  quantity: Joi.number().integer().min(1).required(),
  isCustom: Joi.boolean().default(false),
  suitType: Joi.string().valid('ready-made', 'replica', 'karhai').optional(),
  measurements: Joi.when('isCustom', {
    is: true,
    then: measurementSchema.required(),
    otherwise: Joi.forbidden()
  }),
  referenceImages: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    caption: Joi.string().allow('')
  })),
  karhaiPattern: Joi.object({
    embroideryType: Joi.string().valid('zardozi', 'aari', 'sequins', 'beads', 'thread', 'mixed', 'none').optional(),
    complexity: Joi.string().valid('simple', 'moderate', 'intricate', 'heavy').optional(),
    coverage: Joi.string().valid('minimal', 'partial', 'full', 'heavy').optional(),
    description: Joi.string().max(500).allow('', null).optional()
  }).optional(),
  specialInstructions: Joi.string().max(1000).allow('', null),
  fabric: Joi.string().allow('', null)
});

// Order Schemas
const createOrderSchema = Joi.object({
  items: Joi.array().items(orderItemSchema).min(1).required(),
  shippingAddress: addressSchema.required(),
  payment: Joi.object({
    method: Joi.string().valid('bank-transfer', 'jazzcash', 'easypaisa', 'cod').required(),
    receiptImage: Joi.when('method', {
      is: 'cod',
      then: Joi.object({
        url: Joi.string().uri().required(),
        cloudinaryId: Joi.string().allow(''),
        secure: Joi.boolean().default(true)
      }).required(),
      otherwise: Joi.object({
        url: Joi.string().uri(),
        cloudinaryId: Joi.string().allow(''),
        secure: Joi.boolean().default(true)
      }).allow(null)
    }),
    transactionId: Joi.string().allow('', null),
    transactionDate: Joi.date().allow(null),
    advanceAmount: Joi.number().min(0).allow(null),
    enableWhatsAppNotifications: Joi.boolean().default(true)
  }).required(),
  customerInfo: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    whatsapp: Joi.string().allow('', null)
  }).allow(null), // Optional if user is logged in
  specialInstructions: Joi.string().max(1000).allow('', null)
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid(
    'pending-payment',
    'payment-verified',
    'fabric-arranged',
    'stitching-in-progress',
    'quality-check',
    'ready-for-dispatch',
    'out-for-delivery',
    'delivered',
    'cancelled'
  ).required(),
  note: Joi.string().allow('', null),
  assignedTailor: Joi.string().allow('', null),
  trackingInfo: Joi.object({
    courierService: Joi.string().required(),
    trackingNumber: Joi.string().required(),
    trackingUrl: Joi.string().uri().allow('', null),
    dispatchDate: Joi.date().default(Date.now)
  }).allow(null)
});

const verifyPaymentSchema = Joi.object({
  approved: Joi.boolean().required(),
  rejectionReason: Joi.string().when('approved', {
    is: false,
    then: Joi.required(),
    otherwise: Joi.allow('', null)
  }),
  notes: Joi.string().allow('', null)
});

const productSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  description: Joi.string().required(),
  shortDescription: Joi.string().allow('', null).max(500),
  category: objectId.required(),
  subcategory: Joi.string().allow('', null),
  pricing: Joi.object({
    basePrice: Joi.number().min(0).required(),
    salePrice: Joi.number().min(0).allow(null),
    discountPercentage: Joi.number().min(0).max(100).allow(null),
    customStitchingCharge: Joi.number().min(0).allow(null)
  }).required(),
  fabric: Joi.object({
    type: Joi.string().allow('', null),
    material: Joi.string().allow('', null),
    careInstructions: Joi.string().allow('', null)
  })
});

module.exports = {
  objectId,
  addressSchema,
  measurementSchema,
  orderItemSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  verifyPaymentSchema,
  productSchema
};