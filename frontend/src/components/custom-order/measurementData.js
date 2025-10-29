// LaraibCreative Size Chart Data
export const SIZE_CHART = {
  XS: {
    shoulder: 13.5,
    bust: 18,
    waist: 17.5,
    hip: 19,
    armhole: 8.5,
    wrist: 10,
    sleeveLength: 21,
    normalLength: 37,
    capeLength: 35,
    shirtWithShalwarLength: 32,
    mGirlLength: 34,
    trouserLength: 38,
    trouserWaist: 29,
    shalwarLength: 40
  },
  S: {
    shoulder: 14,
    bust: 19,
    waist: 18.5,
    hip: 20.5,
    armhole: 9,
    wrist: 11,
    sleeveLength: 21.5,
    normalLength: 38,
    capeLength: 36,
    shirtWithShalwarLength: 33,
    mGirlLength: 35,
    trouserLength: 39,
    trouserWaist: 30,
    shalwarLength: 41
  },
  M: {
    shoulder: 14.5,
    bust: 20.5,
    waist: 20,
    hip: 22,
    armhole: 9.75,
    wrist: 12,
    sleeveLength: 22,
    normalLength: 40,
    capeLength: 38,
    shirtWithShalwarLength: 36,
    mGirlLength: 36,
    trouserLength: 40,
    trouserWaist: 32,
    shalwarLength: 42
  },
  L: {
    shoulder: 15,
    bust: 22.5,
    waist: 22,
    hip: 24.5,
    armhole: 11,
    wrist: 13,
    sleeveLength: 22.5,
    normalLength: 40,
    capeLength: 39,
    shirtWithShalwarLength: 36,
    mGirlLength: 38,
    trouserLength: 41,
    trouserWaist: 34,
    shalwarLength: 43
  },
  XL: {
    shoulder: 16,
    bust: 24.5,
    waist: 24,
    hip: 26.5,
    armhole: 11.75,
    wrist: 14,
    sleeveLength: 23,
    normalLength: 41,
    capeLength: 40,
    shirtWithShalwarLength: 37,
    mGirlLength: 39,
    trouserLength: 42,
    trouserWaist: 35,
    shalwarLength: 44
  }
};

// Measurement ranges for custom inputs (all in inches)
export const MEASUREMENT_RANGES = {
  shoulder: { min: 12, max: 18, step: 0.5, label: 'Shoulder' },
  bust: { min: 16, max: 28, step: 0.5, label: 'Bust' },
  waist: { min: 16, max: 28, step: 0.5, label: 'Waist' },
  hip: { min: 17, max: 30, step: 0.5, label: 'Hip' },
  armhole: { min: 7, max: 13, step: 0.25, label: 'Armhole' },
  wrist: { min: 9, max: 16, step: 0.5, label: 'Wrist' },
  sleeveLength: { min: 19, max: 25, step: 0.5, label: 'Sleeve Length' },
  normalLength: { min: 32, max: 45, step: 1, label: 'Normal Length' },
  capeLength: { min: 30, max: 45, step: 1, label: 'Cape Length' },
  shirtWithShalwarLength: { min: 28, max: 40, step: 1, label: 'Shirt with Shalwar Length' },
  mGirlLength: { min: 30, max: 42, step: 1, label: 'MGirl Length' },
  trouserLength: { min: 34, max: 46, step: 1, label: 'Trouser Length' },
  trouserWaist: { min: 26, max: 40, step: 1, label: 'Trouser Waist' },
  shalwarLength: { min: 36, max: 48, step: 1, label: 'Shalwar Length' }
};

// Garment styles with required measurements
export const GARMENT_STYLES = [
  {
    id: 'normal-shirt',
    name: 'Normal Length Shirt',
    description: 'Standard shirt with normal length',
    measurements: ['normalLength']
  },
  {
    id: 'cape-shirt',
    name: 'Cape Style Shirt',
    description: 'Elegant cape style design',
    measurements: ['capeLength']
  },
  {
    id: 'shirt-shalwar',
    name: 'Shirt with Shalwar',
    description: 'Traditional shirt and shalwar set',
    measurements: ['shirtWithShalwarLength', 'shalwarLength']
  },
  {
    id: 'mgirl-shirt',
    name: 'MGirl Shirt',
    description: 'Modern girl style shirt',
    measurements: ['mGirlLength']
  },
  {
    id: 'trouser-set',
    name: 'Shirt with Trouser',
    description: 'Contemporary shirt and trouser set',
    measurements: ['normalLength', 'trouserLength', 'trouserWaist']
  }
];

// Fabric options
export const FABRIC_OPTIONS = [
  {
    id: 'lawn',
    name: 'Lawn',
    emoji: '🌸',
    description: 'Lightweight breathable cotton',
    season: 'Summer',
    price: '+$0'
  },
  {
    id: 'silk',
    name: 'Silk',
    emoji: '✨',
    description: 'Luxurious shine and smooth texture',
    season: 'All Season',
    price: '+$30'
  },
  {
    id: 'chiffon',
    name: 'Chiffon',
    emoji: '💫',
    description: 'Elegant drape and flow',
    season: 'Party Wear',
    price: '+$20'
  },
  {
    id: 'velvet',
    name: 'Velvet',
    emoji: '👑',
    description: 'Rich texture and warmth',
    season: 'Winter',
    price: '+$35'
  },
  {
    id: 'organza',
    name: 'Organza',
    emoji: '🦋',
    description: 'Sheer elegance and grace',
    season: 'Formal',
    price: '+$25'
  },
  {
    id: 'khaddar',
    name: 'Khaddar',
    emoji: '🍂',
    description: 'Cozy winter comfort',
    season: 'Winter',
    price: '+$15'
  }
];

// Service types
export const SERVICE_TYPES = [
  {
    id: 'ready-to-wear',
    title: 'Ready to Wear',
    description: 'Choose from our standard size chart',
    badge: 'Quick Delivery',
    icon: 'Package',
    features: ['Standard sizes', '3-5 days delivery', 'Easy returns']
  },
  {
    id: 'custom-stitched',
    title: 'Custom Stitched',
    description: 'Tailored to your exact measurements',
    badge: 'Perfect Fit',
    icon: 'Ruler',
    features: ['Custom measurements', '7-10 days delivery', 'Perfect fit guaranteed']
  }
];

// Helper function to generate measurement options
export const generateMeasurementOptions = (measurementKey) => {
  const config = MEASUREMENT_RANGES[measurementKey];
  if (!config) return [];
  
  const options = [];
  for (let i = config.min; i <= config.max; i += config.step) {
    options.push({
      value: i.toFixed(2),
      label: `${i.toFixed(2)}"`
    });
  }
  return options;
};

// Helper function to get required measurements for a garment style
export const getRequiredMeasurements = (styleId) => {
  const style = GARMENT_STYLES.find(s => s.id === styleId);
  return style ? style.measurements : [];
};

// Basic measurements required for all garments
export const BASIC_MEASUREMENTS = [
  'shoulder',
  'bust',
  'waist',
  'hip',
  'armhole',
  'wrist',
  'sleeveLength'
];