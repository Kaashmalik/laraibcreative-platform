/**
 * useWizard Hook
 * Custom hook for managing multi-step wizard state
 * 
 * @module hooks/useWizard
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { CustomOrderFormData, PriceBreakdown } from '@/types/custom-order';
import { validateStep } from '@/lib/validations/custom-order-schemas';
import { calculatePriceBreakdown } from '@/lib/utils/price-calculation';
import { saveDraft, loadDraft, clearDraft } from '@/lib/utils/draft-manager';

/**
 * Initial form data
 */
const initialFormData: CustomOrderFormData = {
  suitType: '',
  serviceType: '',
  designIdea: '',
  referenceImages: [],
  fabricSource: '',
  selectedFabric: null,
  fabricDetails: '',
  karhaiPattern: undefined,
  useStandardSize: false,
  standardSize: '',
  measurements: {
    shirtStyle: 'normal',
  },
  saveMeasurements: false,
  measurementLabel: '',
  selectedMeasurementProfile: undefined,
  specialInstructions: '',
  rushOrder: false,
  customerInfo: {
    fullName: '',
    email: '',
    phone: '',
    whatsapp: '',
  },
  addToCart: false,
};

/**
 * useWizard Hook
 */
export function useWizard(totalSteps: number = 5) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CustomOrderFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = loadDraft();
    if (savedDraft) {
      setFormData(savedDraft);
      setDraftSaved(true);
    }
  }, []);

  // Auto-save draft when formData changes
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (formData.serviceType) {
        // Only save if user has started filling the form
        const saved = saveDraft(formData);
        if (saved) {
          setDraftSaved(true);
        }
      }
    }, 1000); // Debounce by 1 second

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData]);

  // Calculate price breakdown when formData changes
  useEffect(() => {
    if (formData.serviceType) {
      const breakdown = calculatePriceBreakdown(formData);
      setPriceBreakdown(breakdown);
    }
  }, [formData]);

  /**
   * Update form data
   */
  const updateFormData = useCallback((field: keyof CustomOrderFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Update nested form data
   */
  const updateNestedFormData = useCallback((
    parentField: keyof CustomOrderFormData,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [field]: value,
      },
    }));

    // Clear error
    const errorKey = `${parentField}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }, [errors]);

  /**
   * Validate current step
   */
  const validateCurrentStep = useCallback((): boolean => {
    let validation: { valid: boolean; errors: Record<string, string> };

    switch (currentStep) {
      case 1:
        // Step 1: Suit Type Selection
        try {
          const { suitTypeSchema } = require('@/lib/validations/custom-order-schemas');
          suitTypeSchema.parse({ suitType: formData.suitType });
          validation = { valid: true, errors: {} };
        } catch (error: any) {
          const errors: Record<string, string> = {};
          if (error.errors) {
            error.errors.forEach((err: any) => {
              errors[err.path[0]] = err.message;
            });
          }
          validation = { valid: false, errors };
        }
        break;
      case 2:
        validation = validateStep.step1({
          serviceType: formData.serviceType,
          designIdea: formData.designIdea,
        });
        break;
      case 3:
        // Step 3: Image Upload
        // Optional for 'fully-custom', required for others (like 'replica')
        const isImageUploadOptional = formData.serviceType === 'fully-custom' || formData.serviceType === 'brand-article';

        if (isImageUploadOptional && formData.referenceImages.length === 0) {
          validation = { valid: true, errors: {} };
        } else {
          validation = validateStep.step2({
            referenceImages: formData.referenceImages,
            serviceType: formData.serviceType,
          });
        }
        break;
      case 4:
        // Step 4: Fabric or Karhai Pattern
        if (formData.suitType === 'karhai') {
          // Validate karhai pattern
          try {
            const { karhaiPatternSchema } = require('@/lib/validations/custom-order-schemas');
            karhaiPatternSchema.parse(formData.karhaiPattern || {});
            validation = { valid: true, errors: {} };
          } catch (error: any) {
            const errors: Record<string, string> = {};
            if (error.errors) {
              error.errors.forEach((err: any) => {
                errors[`karhaiPattern.${err.path[0]}`] = err.message;
              });
            }
            validation = { valid: false, errors };
          }
        } else {
          validation = validateStep.step3({
            fabricSource: formData.fabricSource,
            selectedFabric: formData.selectedFabric,
            fabricDetails: formData.fabricDetails,
          });
        }
        break;
      case 5:
        validation = validateStep.step4({
          useStandardSize: formData.useStandardSize,
          standardSize: formData.standardSize,
          measurements: formData.measurements,
          saveMeasurements: formData.saveMeasurements,
          measurementLabel: formData.measurementLabel,
        });
        break;
      case 6:
        validation = validateStep.step5({
          specialInstructions: formData.specialInstructions,
          rushOrder: formData.rushOrder,
          customerInfo: formData.customerInfo,
        });
        break;
      default:
        validation = { valid: true, errors: {} };
    }

    setErrors(validation.errors);
    return validation.valid;
  }, [currentStep, formData]);

  /**
   * Navigate to next step
   */
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [currentStep, totalSteps, validateCurrentStep]);

  /**
   * Navigate to previous step
   */
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  /**
   * Go to specific step
   */
  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalSteps]);

  /**
   * Save draft manually
   */
  const saveDraftManually = useCallback(async () => {
    setIsSavingDraft(true);
    try {
      const saved = saveDraft(formData);
      if (saved) {
        setDraftSaved(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  }, [formData]);

  /**
   * Clear draft
   */
  const clearDraftManually = useCallback(() => {
    clearDraft();
    setDraftSaved(false);
  }, []);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
    setCurrentStep(1);
    clearDraft();
    setDraftSaved(false);
  }, []);

  return {
    // State
    currentStep,
    totalSteps,
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    isSavingDraft,
    draftSaved,
    priceBreakdown,

    // Actions
    updateFormData,
    updateNestedFormData,
    nextStep,
    prevStep,
    goToStep,
    validateCurrentStep,
    saveDraftManually,
    clearDraftManually,
    resetForm,
  };
}

export default useWizard;

