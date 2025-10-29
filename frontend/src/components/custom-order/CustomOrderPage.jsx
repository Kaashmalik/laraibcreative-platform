import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Send, CheckCircle } from 'lucide-react';
import StepIndicator from './StepIndicator';
import ServiceTypeSelection from './ServiceTypeSelection';
import ImageUpload from './ImageUpload';
import FabricSelection from './FabricSelection';
import MeasurementForm from './MeasurementForm';
import OrderSummary from './OrderSummary';
import { BASIC_MEASUREMENTS, getRequiredMeasurements } from './measurementData';

/**
 * CustomOrderPage Component
 * Main component that orchestrates the entire custom order flow
 */
const CustomOrderPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [orderData, setOrderData] = useState({
    serviceType: '',
    images: [],
    fabric: '',
    measurements: {},
    garmentStyle: 'normal-shirt'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Define steps
  const steps = [
    { id: 'service', title: 'Service Type', component: 'ServiceTypeSelection' },
    { id: 'images', title: 'Design', component: 'ImageUpload' },
    { id: 'fabric', title: 'Fabric', component: 'FabricSelection' },
    { id: 'measurements', title: 'Measurements', component: 'MeasurementForm' },
    { id: 'summary', title: 'Review', component: 'OrderSummary' }
  ];

  // Validation for each step
  const canProceed = () => {
    switch (currentStep) {
      case 0: // Service Type
        return orderData.serviceType !== '';
      
      case 1: // Images
        return orderData.images.length > 0;
      
      case 2: // Fabric
        return orderData.fabric !== '';
      
      case 3: // Measurements
        const requiredMeasurements = [
          ...BASIC_MEASUREMENTS,
          ...getRequiredMeasurements(orderData.garmentStyle || 'normal-shirt')
        ];
        return requiredMeasurements.every(
          key => orderData.measurements[key] && orderData.measurements[key] > 0
        );
      
      case 4: // Summary
        return true;
      
      default:
        return false;
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (canProceed() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Update order data
  const updateOrderData = (field, value) => {
    setOrderData({
      ...orderData,
      [field]: value
    });
  };

  // Handle order submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would normally send data to your backend
      console.log('Order Data:', orderData);
      
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Submission error:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ServiceTypeSelection
            selected={orderData.serviceType}
            onSelect={(value) => updateOrderData('serviceType', value)}
          />
        );
      
      case 1:
        return (
          <ImageUpload
            images={orderData.images}
            onImagesChange={(images) => updateOrderData('images', images)}
          />
        );
      
      case 2:
        return (
          <FabricSelection
            selected={orderData.fabric}
            onSelect={(value) => updateOrderData('fabric', value)}
          />
        );
      
      case 3:
        return (
          <MeasurementForm
            serviceType={orderData.serviceType}
            measurements={orderData.measurements}
            onMeasurementsChange={(measurements) => 
              updateOrderData('measurements', measurements)
            }
          />
        );
      
      case 4:
        return (
          <OrderSummary
            orderData={{
              ...orderData,
              garmentStyle: orderData.garmentStyle || 'normal-shirt'
            }}
            onSubmit={handleSubmit}
          />
        );
      
      default:
        return null;
    }
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-scale-in">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Order Submitted!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Thank you for choosing LaraibCreative. We've received your custom order 
            and our team will contact you within 24 hours to confirm the details.
          </p>
          
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Order ID:</strong> LC-{Date.now().toString().slice(-8)}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email confirmation sent to:</strong> customer@example.com
            </p>
          </div>
          
          <button
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(0);
              setOrderData({
                serviceType: '',
                images: [],
                fabric: '',
                measurements: {},
                garmentStyle: 'normal-shirt'
              });
            }}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Create Another Order
          </button>
        </div>
      </div>
    );
  }

  // Main order form
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            LaraibCreative Custom Order
          </h1>
          <p className="text-gray-600">
            Create your perfect outfit in just a few steps
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <StepIndicator currentStep={currentStep} steps={steps} />

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-semibold
              transition-all duration-300
              ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-pink-500 hover:text-pink-600'
              }
            `}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-lg font-semibold
                transition-all duration-300 transform
                ${
                  canProceed()
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Next
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className={`
                flex items-center gap-2 px-8 py-3 rounded-lg font-semibold
                transition-all duration-300 transform
                ${
                  canProceed() && !isSubmitting
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Order
                </>
              )}
            </button>
          )}
        </div>

        {/* Helper Text */}
        {!canProceed() && (
          <p className="text-center text-sm text-gray-500 mt-4">
            Please complete all required fields to proceed
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-600">
        <p>© 2025 LaraibCreative. All rights reserved.</p>
        <p className="mt-2">
          Need help? Contact us at{' '}
          <a href="mailto:support@laraibcreative.com" className="text-pink-600 hover:underline">
            support@laraibcreative.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default CustomOrderPage;