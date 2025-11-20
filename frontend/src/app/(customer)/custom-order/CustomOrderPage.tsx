'use client';

/**
 * Custom Order Wizard - Main Page
 * Production-ready multi-step custom order wizard
 * 
 * @module app/(customer)/custom-order/CustomOrderPage
 */

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { DynamicErrorBoundary } from '@/components/shared/DynamicErrorBoundary';
import { useWizard } from '@/hooks/useWizard';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import type { OrderSubmissionData, OrderSubmissionResponse } from '@/types/custom-order';

// Dynamically import step components for code splitting
const StepIndicator = dynamic(() => import('./components/StepIndicator'), {
  loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const ServiceTypeSelection = dynamic(() => import('./components/ServiceTypeSelection'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const ImageUpload = dynamic(() => import('./components/ImageUpload'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const FabricSelection = dynamic(() => import('./components/FabricSelection'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const MeasurementForm = dynamic(() => import('./components/MeasurementForm'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const OrderSummary = dynamic(() => import('./components/OrderSummary'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const SuccessConfirmation = dynamic(() => import('./components/SuccessConfirmation'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />,
  ssr: false,
});

const TOTAL_STEPS = 5;

function CustomOrderPage() {
  const router = useRouter();
  const {
    currentStep,
    totalSteps,
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    isSavingDraft,
    draftSaved,
    priceBreakdown,
    updateFormData,
    updateNestedFormData,
    nextStep,
    prevStep,
    saveDraftManually,
    validateCurrentStep,
  } = useWizard(TOTAL_STEPS);

  const [submittedOrder, setSubmittedOrder] = useState<OrderSubmissionResponse | null>(null);

  /**
   * Update nested measurement data
   */
  const updateMeasurements = (field: string, value: string | number) => {
    updateNestedFormData('measurements', field, value);
  };

  /**
   * Handle save draft
   */
  const handleSaveDraft = async () => {
    const saved = await saveDraftManually();
    if (saved) {
      toast.success('Draft saved successfully! You can continue later.');
      router.push('/products');
    } else {
      toast.error('Failed to save draft. Please try again.');
    }
  };

  /**
   * Submit the custom order
   */
  const handleSubmit = async () => {
    // Validate final step
    if (!validateCurrentStep()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload reference images first (if any)
      let imageUrls: string[] = [];
      if (formData.referenceImages.length > 0) {
        try {
          const uploadResponse = await api.customOrders.uploadImages(
            formData.referenceImages.map(img => img.file)
          );
          imageUrls = uploadResponse.urls || [];
        } catch (uploadError: any) {
          console.error('Image upload failed:', uploadError);
          toast.error('Failed to upload images. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Prepare order data
      const orderData: OrderSubmissionData = {
        serviceType: formData.serviceType as 'fully-custom' | 'brand-article',
        designIdea: formData.designIdea || undefined,
        referenceImages: imageUrls,
        fabricSource: formData.fabricSource as 'lc-provides' | 'customer-provides',
        selectedFabric: formData.selectedFabric || undefined,
        fabricDetails: formData.fabricDetails || undefined,
        useStandardSize: formData.useStandardSize,
        standardSize: formData.standardSize || undefined,
        measurements: formData.measurements,
        saveMeasurements: formData.saveMeasurements,
        measurementLabel: formData.measurementLabel || undefined,
        specialInstructions: formData.specialInstructions || undefined,
        rushOrder: formData.rushOrder,
        customerInfo: formData.customerInfo,
        estimatedPrice: priceBreakdown?.total || 0,
      };

      // Submit order
      const response = await api.customOrders.submit(orderData);

      if (response.success) {
        setSubmittedOrder(response);
        
        // Clear draft
        localStorage.removeItem('laraibcreative-custom-order-draft');
        
        // Trigger WhatsApp notification (if phone provided)
        if (formData.customerInfo.phone) {
          triggerWhatsAppNotification(response.orderNumber, formData.customerInfo.phone);
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error(response.error || 'Failed to submit order');
      }
    } catch (error: any) {
      console.error('Order submission failed:', error);
      toast.error(error.message || 'Failed to submit order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Trigger WhatsApp notification
   */
  const triggerWhatsAppNotification = (orderNumber: string, phone: string) => {
    const whatsappNumber = formData.customerInfo.whatsapp || phone;
    const message = encodeURIComponent(
      `Thank you for your custom order! Your order number is ${orderNumber}. We'll contact you soon with more details.`
    );
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`;
    
    // Open WhatsApp in new tab (optional)
    // window.open(whatsappUrl, '_blank');
    
    // Or trigger backend notification
    // api.notifications.sendWhatsApp({ phone: whatsappNumber, message });
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
            onChange={(field, value) => updateFormData(field as any, value)}
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
            onChange={(field, value) => updateFormData(field as any, value)}
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
            onChange={(field, value) => updateFormData(field as any, value)}
            estimatedPrice={priceBreakdown?.total || 0}
            priceBreakdown={priceBreakdown}
            errors={errors}
          />
        );

      default:
        return null;
    }
  };

  // Show success confirmation
  if (submittedOrder) {
    return (
      <SuccessConfirmation
        orderNumber={submittedOrder.orderNumber}
        orderId={submittedOrder.orderId}
        onContinueShopping={() => router.push('/products')}
        onViewOrder={() => router.push(`/orders/${submittedOrder.orderId}`)}
      />
    );
  }

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
          {draftSaved && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Draft saved automatically</span>
            </div>
          )}
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
                onClick={prevStep}
                className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 min-h-[48px]"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            )}

            <button
              onClick={handleSaveDraft}
              disabled={isSavingDraft}
              className="flex-1 sm:flex-none px-6 py-3 border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 hover:border-purple-400 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              <Save className="w-5 h-5" />
              {isSavingDraft ? 'Saving...' : 'Save Draft'}
            </button>
          </div>

          <div className="w-full sm:w-auto">
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="w-full px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl min-h-[48px]"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg font-medium hover:from-pink-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit Order
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
          <a
            href="https://wa.me/923020718182?text=Hi!%20I'm%20interested%20in%20LaraibCreative%20products"
            className="text-purple-600 hover:underline font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// Export with error boundary wrapper
export default function CustomOrderPageWithErrorBoundary() {
  return (
    <DynamicErrorBoundary componentName="CustomOrderPage">
      <CustomOrderPage />
    </DynamicErrorBoundary>
  );
}

