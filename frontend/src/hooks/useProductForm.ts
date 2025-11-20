/**
 * useProductForm Hook
 * Manages product form state with Zod validation and react-hook-form
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, type ProductFormData } from '@/lib/validations/product-schemas';
import { useEffect, useCallback } from 'react';
// Import from utils.js (JavaScript file)
// @ts-ignore - JavaScript file, no types
import { generateSlug } from '@/lib/utils.js';
import type { Product } from '@/types/product';

interface UseProductFormOptions {
  initialData?: Product | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDraftSave?: (data: Partial<ProductFormData>) => void;
}

export function useProductForm({ initialData, onSubmit, onDraftSave }: UseProductFormOptions) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      description: '',
      designCode: '',
      category: '',
      pricing: {
        basePrice: 0,
        currency: 'PKR',
      },
      images: [],
      fabric: {
        type: '',
      },
      inventory: {
        trackInventory: false,
        stockQuantity: 0,
        lowStockThreshold: 5,
      },
      availability: {
        status: 'made-to-order',
      },
      productType: 'both',
      sizeAvailability: {
        availableSizes: [],
        customSizesAvailable: false,
      },
      isActive: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      seo: {},
      tags: [],
      features: [],
      whatsIncluded: [],
      availableColors: [],
    },
    mode: 'onChange', // Validate on change for better UX
  });

  // Load initial data
  useEffect(() => {
    if (initialData) {
      const formData: Partial<ProductFormData> = {
        title: initialData.title || '',
        description: initialData.description || '',
        designCode: initialData.designCode || '',
        category: typeof initialData.category === 'string' 
          ? initialData.category 
          : initialData.category?._id || '',
        shortDescription: initialData.shortDescription || '',
        sku: initialData.sku || initialData.inventory?.sku || '',
        images: Array.isArray(initialData.images) 
          ? initialData.images.map((img, index) => ({
              url: typeof img === 'string' ? img : img.url || '',
              publicId: typeof img === 'object' ? img.publicId : undefined,
              altText: typeof img === 'object' ? img.altText : initialData.title || '',
              displayOrder: index,
            }))
          : [],
        primaryImage: initialData.primaryImage || initialData.image || '',
        pricing: (initialData.pricing as any) || {
          basePrice: initialData.price || 0,
          currency: 'PKR',
        },
        fabric: (initialData.fabric as any) || { type: '' },
        inventory: (initialData.inventory as any) || {
          trackInventory: false,
          stockQuantity: initialData.stockQuantity || 0,
          lowStockThreshold: 5,
        },
        availability: (initialData.availability as any) || {
          status: initialData.inStock ? 'in-stock' : 'made-to-order',
        },
        productType: initialData.productType || 'both',
        sizeAvailability: (initialData.sizeAvailability as any) || {
          availableSizes: [],
          customSizesAvailable: false,
        },
        isActive: initialData.isActive !== undefined ? initialData.isActive : true,
        isFeatured: initialData.isFeatured || false,
        isNewArrival: initialData.isNewArrival || false,
        isBestSeller: initialData.isBestSeller || false,
        seo: initialData.seo || {},
        tags: initialData.tags || [],
        features: initialData.features || [],
        whatsIncluded: initialData.whatsIncluded || [],
        availableColors: (initialData.availableColors as any) || [],
        occasion: (initialData.occasion as any) || undefined,
        subcategory: initialData.subcategory || '',
        adminNotes: initialData.adminNotes || '',
      };

      form.reset(formData as ProductFormData);
    }
  }, [initialData, form]);

  // Auto-generate slug from title
  const title = form.watch('title');
  useEffect(() => {
    if (title && !initialData) {
      const slug = generateSlug(title);
      form.setValue('slug', slug, { shouldValidate: false });
    }
  }, [title, initialData, form]);

  // Handle form submission
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  });

  // Auto-save draft
  const debouncedDraftSave = useCallback(
    (() => {
      let timeout: NodeJS.Timeout;
      return (data: Partial<ProductFormData>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          if (onDraftSave) {
            onDraftSave(data);
          }
        }, 2000); // Save draft after 2 seconds of inactivity
      };
    })(),
    [onDraftSave]
  );

  // Watch form changes for draft save
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (form.formState.isDirty) {
        debouncedDraftSave(data as Partial<ProductFormData>);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedDraftSave]);

  return {
    ...form,
    handleSubmit,
    isSubmitting: form.formState.isSubmitting,
    isValid: form.formState.isValid,
    errors: form.formState.errors,
    isDirty: form.formState.isDirty,
  };
}

