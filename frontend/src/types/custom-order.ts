/**
 * Custom Order Wizard TypeScript Types
 * Production-ready type definitions for custom order system
 * 
 * @module types/custom-order
 */

/**
 * Service Type
 */
export type ServiceType = 'fully-custom' | 'brand-article';

/**
 * Suit Type
 */
export type SuitType = 'ready-made' | 'replica' | 'karhai';

/**
 * Fabric Source
 */
export type FabricSource = 'lc-provides' | 'customer-provides';

/**
 * Shirt Style
 */
export type ShirtStyle = 'normal' | 'cape' | 'with-shalwar' | 'mgirl';

/**
 * Standard Size
 */
export type StandardSize = 'XS' | 'S' | 'M' | 'L' | 'XL';

/**
 * Reference Image
 */
export interface ReferenceImage {
  file: File;
  preview: string;
  name: string;
  size: number;
  uploadedAt?: string;
  url?: string; // After upload to server
}

/**
 * Fabric Option
 */
export interface FabricOption {
  id: string | number;
  name: string;
  type: string;
  color: string;
  pattern: string;
  price: number;
  pricePerMeter: number;
  metersIncluded: number;
  image: string;
  description: string;
  inStock: boolean;
}

/**
 * Measurements
 */
export interface Measurements {
  // Upper Body
  shirtLength?: string | number;
  shoulderWidth?: string | number;
  sleeveLength?: string | number;
  armHole?: string | number;
  bust?: string | number;
  waist?: string | number;
  hip?: string | number;
  frontNeckDepth?: string | number;
  backNeckDepth?: string | number;
  wrist?: string | number;
  
  // Lower Body
  trouserLength?: string | number;
  trouserWaist?: string | number;
  trouserHip?: string | number;
  thigh?: string | number;
  bottom?: string | number;
  kneeLength?: string | number;
  
  // Dupatta
  dupattaLength?: string | number;
  dupattaWidth?: string | number;
  
  // Shirt Style
  shirtStyle?: ShirtStyle;
}

/**
 * Customer Info
 */
export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
}

/**
 * Custom Order Form Data
 */
export interface CustomOrderFormData {
  // Step 0: Suit Type Selection
  suitType: SuitType | '';
  
  // Step 1: Service Type
  serviceType: ServiceType | '';
  designIdea: string;
  
  // Step 2: Reference Images / Replica Uploads
  referenceImages: ReferenceImage[];
  
  // Step 3: Fabric Selection / Karhai Pattern
  fabricSource: FabricSource | '';
  selectedFabric: FabricOption | null;
  fabricDetails: string;
  karhaiPattern?: {
    embroideryType: 'zardozi' | 'aari' | 'sequins' | 'beads' | 'thread' | 'mixed' | 'none';
    complexity: 'simple' | 'moderate' | 'intricate' | 'heavy';
    coverage: 'minimal' | 'partial' | 'full' | 'heavy';
    description?: string;
  };
  
  // Step 4: Measurements
  useStandardSize: boolean;
  standardSize: StandardSize | '';
  measurements: Measurements;
  saveMeasurements: boolean;
  measurementLabel: string;
  selectedMeasurementProfile?: string; // ID of saved measurement profile
  
  // Step 5: Special Instructions
  specialInstructions: string;
  rushOrder: boolean;
  
  // Contact (if not logged in)
  customerInfo: CustomerInfo;
  
  // Cart Integration
  addToCart?: boolean;
}

/**
 * Price Breakdown
 */
export interface PriceBreakdown {
  baseStitching: number;
  fabricCost: number;
  rushOrderFee: number;
  complexDesignSurcharge: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Order Submission Data
 */
export interface OrderSubmissionData {
  serviceType: ServiceType;
  designIdea?: string;
  referenceImages: string[]; // URLs after upload
  fabricSource: FabricSource;
  selectedFabric?: FabricOption;
  fabricDetails?: string;
  useStandardSize: boolean;
  standardSize?: StandardSize;
  measurements: Measurements;
  saveMeasurements: boolean;
  measurementLabel?: string;
  specialInstructions?: string;
  rushOrder: boolean;
  customerInfo: CustomerInfo;
  estimatedPrice: number;
}

/**
 * Order Submission Response
 */
export interface OrderSubmissionResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  message?: string;
  error?: string;
}

/**
 * Wizard Step
 */
export interface WizardStep {
  number: number;
  title: string;
  description: string;
  component: string;
}

/**
 * Wizard State
 */
export interface WizardState {
  currentStep: number;
  totalSteps: number;
  formData: CustomOrderFormData;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  draftSaved: boolean;
  priceBreakdown: PriceBreakdown | null;
}

/**
 * Draft Data
 */
export interface DraftData {
  formData: CustomOrderFormData;
  savedAt: string;
  version: number;
}

/**
 * Saved Measurements (for logged-in users)
 */
export interface SavedMeasurement {
  _id: string;
  label: string;
  measurements: Measurements;
  createdAt: string;
  updatedAt: string;
}

