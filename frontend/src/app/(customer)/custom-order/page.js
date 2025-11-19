'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from './components/StepIndicator';
import ServiceTypeSelection from './components/ServiceTypeSelection';
import ImageUpload from './components/ImageUpload';
import FabricSelection from './components/FabricSelection';
import MeasurementForm from './components/MeasurementForm';
import OrderSummary from './components/OrderSummary';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

/**
 * Custom Order Wizard - Main Page
 * 
 * Multi-step form for custom stitching orders with:
 * - 5 steps with progress tracking
 * - Form state persistence in localStorage
 * - Validation on each step
 * - Mobile-responsive design
 * - Real-time price calculation
 */

// Initial form state structure
const initialFormData = {
  // Step 1: Service Type
  serviceType: '', // 'fully-custom' or 'brand-article'
  designIdea: '',
  
  // Step 2: Reference Images
  referenceImages: [], // Array of { file, preview, name }
  
  // Step 3: Fabric Selection
  fabricSource: '', // 'lc-provides' or 'customer-provides'
  selectedFabric: null,
  fabricDetails: '',
  
  // Step 4: Measurements
  useStandardSize: false,
  standardSize: '',
  measurements: {
    // Upper Body
    shirtLength: '',
    shoulderWidth: '',
    sleeveLength: '',
    armHole: '',
    bust: '',
    waist: '',
    hip: '',
    frontNeckDepth: '',
    backNeckDepth: '',
    wrist: '',
    
    // Lower Body
    trouserLength: '',
    trouserWaist: '',
    trouserHip: '',
    thigh: '',
    bottom: '',
    kneeLength: '',
    
    // Dupatta
    dupattaLength: '',
    dupattaWidth: '',
    
    // Shirt Style
    shirtStyle: 'normal', // 'normal', 'cape', 'with-shalwar', 'mgirl'
  },
  saveMeasurements: false,
  measurementLabel: '',
  
  // Step 5: Special Instructions
  specialInstructions: '',
  rushOrder: false,
  
  // Contact (if not logged in)
  customerInfo: {
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
  },
};

export default function CustomOrderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Total steps in the wizard
  const totalSteps = 5;

  // Steps configuration handled inside StepIndicator

  // Load saved draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('customOrderDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(parsed);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Auto-save to localStorage when formData changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem('customOrderDraft', JSON.stringify(formData));
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(timeoutId);
  }, [formData]);

  /**
   * Update form data for any field
   */
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Update nested measurement data
   */
  const updateMeasurements = (field, value) => {
    setFormData(prev => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: value,
      },
    }));
  };

  /**
   * Validate current step before proceeding
   */
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Service Type
        if (!formData.serviceType) {
          newErrors.serviceType = 'Please select a service type';
        }
        if (formData.serviceType === 'fully-custom' && !formData.designIdea.trim()) {
          newErrors.designIdea = 'Please describe your design idea';
        }
        break;

      case 2: // Reference Images
        if (formData.serviceType === 'brand-article') {
          if (formData.referenceImages.length < 2) {
            newErrors.referenceImages = 'Please upload at least 2 reference images';
          } else if (formData.referenceImages.length > 6) {
            newErrors.referenceImages = 'Maximum 6 images allowed';
          }
        }
        break;

      case 3: // Fabric Selection
        if (!formData.fabricSource) {
          newErrors.fabricSource = 'Please select fabric source';
        }
        if (formData.fabricSource === 'lc-provides' && !formData.selectedFabric) {
          newErrors.selectedFabric = 'Please select a fabric';
        }
        if (formData.fabricSource === 'customer-provides' && !formData.fabricDetails.trim()) {
          newErrors.fabricDetails = 'Please describe the fabric you will provide';
        }
        break;

      case 4: // Measurements
        if (!formData.useStandardSize) {
          // Validate custom measurements - check key measurements
          const required = ['shirtLength', 'shoulderWidth', 'bust', 'waist'];
          required.forEach(field => {
            if (!formData.measurements[field]) {
              newErrors[`measurements.${field}`] = 'This measurement is required';
            }
          });
        } else if (!formData.standardSize) {
          newErrors.standardSize = 'Please select a standard size';
        }
        break;

      case 5: // Review (optional validations)
        // Add contact info validation if user is not logged in
        if (!formData.customerInfo.fullName.trim()) {
          newErrors['customerInfo.fullName'] = 'Name is required';
        }
        if (!formData.customerInfo.phone.trim()) {
          newErrors['customerInfo.phone'] = 'Phone number is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Navigate to next step
   */
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  /**
   * Save as draft and exit
   */
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      // Save to localStorage (already done by auto-save)
      // Optionally save to backend if user is logged in
      
      // Show success message
      alert('Draft saved successfully! You can continue later.');
      
      // Redirect to home or products page
      router.push('/products');
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsSavingDraft(false);
    }
  };

  /**
   * Submit the custom order
   */
  const handleSubmit = async () => {
    // Validate final step
    if (!validateStep(currentStep)) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare form data for submission
      const orderData = new FormData();
      
      // Append all form fields
      orderData.append('serviceType', formData.serviceType);
      orderData.append('designIdea', formData.designIdea);
      orderData.append('fabricSource', formData.fabricSource);
      orderData.append('fabricDetails', formData.fabricDetails);
      orderData.append('measurements', JSON.stringify(formData.measurements));
      orderData.append('specialInstructions', formData.specialInstructions);
      orderData.append('rushOrder', formData.rushOrder);
      orderData.append('customerInfo', JSON.stringify(formData.customerInfo));
      
      // Append reference images
      formData.referenceImages.forEach((img) => {
        if (img.file) {
          orderData.append(`referenceImages`, img.file);
        }
      });
      
      // Send to API
      const response = await fetch('/api/orders/custom', {
        method: 'POST',
        body: orderData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      const result = await response.json();

      // Clear draft from localStorage
      localStorage.removeItem('customOrderDraft');

      // Redirect to order confirmation or cart
      router.push(`/checkout?customOrderId=${result.orderId}`);
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Calculate estimated price based on current form data
   */
  const calculateEstimatedPrice = () => {
    let price = 0;

    // Base stitching charge
    const baseStitchingCharge = 2500; // PKR
    price += baseStitchingCharge;

    // Fabric cost (if provided by LC)
    if (formData.fabricSource === 'lc-provides' && formData.selectedFabric) {
      price += formData.selectedFabric.price || 0;
    }

    // Rush order fee
    if (formData.rushOrder) {
      price += 1000; // PKR
    }

    // Complex design surcharge (if fully custom)
    if (formData.serviceType === 'fully-custom' && formData.designIdea.length > 200) {
      price += 500; // PKR
    }

    return price;
  };

  /**
   * Render current step component
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceTypeSelection
            serviceType={formData.serviceType}
            designIdea={formData.designIdea}
            onChange={(field, value) => updateFormData(field, value)}
            errors={errors}
          />
        );
      
      case 2:
        return (
          <ImageUpload
            images={formData.referenceImages}
            onChange={(images) => updateFormData('referenceImages', images)}
            serviceType={formData.serviceType}
            errors={errors}
          />
        );
      
      case 3:
        return (
          <FabricSelection
            fabricSource={formData.fabricSource}
            selectedFabric={formData.selectedFabric}
            fabricDetails={formData.fabricDetails}
            onChange={(field, value) => updateFormData(field, value)}
            errors={errors}
          />
        );
      
      case 4:
        return (
          <MeasurementForm
            useStandardSize={formData.useStandardSize}
            standardSize={formData.standardSize}
            measurements={formData.measurements}
            saveMeasurements={formData.saveMeasurements}
            measurementLabel={formData.measurementLabel}
            onToggleStandardSize={(value) => updateFormData('useStandardSize', value)}
            onStandardSizeChange={(value) => updateFormData('standardSize', value)}
            onMeasurementChange={updateMeasurements}
            onSaveMeasurementsChange={(value) => updateFormData('saveMeasurements', value)}
            onLabelChange={(value) => updateFormData('measurementLabel', value)}
            errors={errors}
          />
        );
      
      case 5:
        return (
          <OrderSummary
            formData={formData}
            onChange={(field, value) => updateFormData(field, value)}
            estimatedPrice={calculateEstimatedPrice()}
            errors={errors}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Create Your Custom Order
          </h1>
          <p className="text-gray-600">
            Transform your vision into reality with our expert stitching service
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex gap-3 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}
            
            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="w-full px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Add to Cart
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Need help? Contact us on{' '}
          <a href="https://wa.me/923020718182?text=Hi%21%20I%27m%20interested%20in%20LaraibCreative%20products" className="text-purple-600 hover:underline font-medium">
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}