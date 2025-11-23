# TypeScript Migration Guide
## Laraib Creative E-Commerce Platform

---

## Overview

This guide provides step-by-step instructions for migrating all JSX files to TypeScript (TSX) with proper type definitions.

---

## Phase 1: Context Files Migration

### 1. AuthContext.jsx → AuthContext.tsx

**Status:** ✅ COMPLETED (See SECURITY_IMPROVEMENTS.md)

### 2. ThemeContext.jsx → ThemeContext.tsx

**Current File:** `frontend/src/context/ThemeContext.jsx`

**Migration Steps:**

```typescript
// frontend/src/context/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ 
  children, 
  defaultTheme = 'system' 
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    // Check system preference
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    }
  }, []);

  // Update theme
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
    } else {
      setIsDark(newTheme === 'dark');
    }

    // Update document class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    handleSetTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme,
    isDark,
    setTheme: handleSetTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## Phase 2: Checkout Components Migration

### 1. CheckoutStepper.jsx → CheckoutStepper.tsx

```typescript
// frontend/src/components/checkout/CheckoutStepper.tsx
'use client';

import type { CheckoutStepperProps } from '@/types/checkout-components';

export default function CheckoutStepper({ 
  currentStep, 
  steps 
}: CheckoutStepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          {/* Step Circle */}
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ${
              currentStep >= step.number
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {currentStep > step.number ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              step.number
            )}
          </div>

          {/* Step Title */}
          <div className="ml-3 flex-1">
            <p className={`text-sm font-medium ${
              currentStep >= step.number ? 'text-gray-900' : 'text-gray-600'
            }`}>
              {step.title}
            </p>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 transition-all ${
                currentStep > step.number ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
```

### 2. CustomerInfoForm.jsx → CustomerInfoForm.tsx

**Status:** ✅ COMPLETED (See SECURITY_IMPROVEMENTS.md)

### 3. ShippingAddressForm.jsx → ShippingAddressForm.tsx

```typescript
// frontend/src/components/checkout/ShippingAddressForm.tsx
'use client';

import { useState, useCallback } from 'react';
import { sanitizeInput } from '@/lib/sanitization';
import type { ShippingAddressFormProps } from '@/types/checkout-components';
import type { ShippingAddress } from '@/types/checkout';

export default function ShippingAddressForm({
  formData,
  updateFormData,
  onNext,
  onBack,
  errors = {}
}: ShippingAddressFormProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>(errors);

  const handleChange = useCallback((field: keyof ShippingAddress, value: string) => {
    const sanitized = sanitizeInput(value);
    updateFormData(`shippingAddress.${field}`, sanitized);

    if (localErrors[field]) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [localErrors, updateFormData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    const address = formData.shippingAddress;

    if (!address?.fullAddress?.trim()) {
      newErrors.fullAddress = 'Address is required';
    }

    if (!address?.city?.trim()) {
      newErrors.city = 'City is required';
    }

    if (!address?.province?.trim()) {
      newErrors.province = 'Province is required';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.shippingAddress]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.shippingAddress?.fullAddress ?? ''}
          onChange={(e) => handleChange('fullAddress', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            localErrors.fullAddress ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your full address"
          rows={3}
        />
        {localErrors.fullAddress && (
          <p className="mt-1 text-sm text-red-600">{localErrors.fullAddress}</p>
        )}
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.shippingAddress?.city ?? ''}
          onChange={(e) => handleChange('city', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            localErrors.city ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your city"
        />
        {localErrors.city && (
          <p className="mt-1 text-sm text-red-600">{localErrors.city}</p>
        )}
      </div>

      {/* Province */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Province <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.shippingAddress?.province ?? ''}
          onChange={(e) => handleChange('province', e.target.value)}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            localErrors.province ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="">Select Province</option>
          <option value="punjab">Punjab</option>
          <option value="sindh">Sindh</option>
          <option value="kpk">KPK</option>
          <option value="balochistan">Balochistan</option>
          <option value="gilgit">Gilgit-Baltistan</option>
          <option value="azad-kashmir">Azad Kashmir</option>
        </select>
        {localErrors.province && (
          <p className="mt-1 text-sm text-red-600">{localErrors.province}</p>
        )}
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Postal Code (Optional)
        </label>
        <input
          type="text"
          value={formData.shippingAddress?.postalCode ?? ''}
          onChange={(e) => handleChange('postalCode', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter postal code"
        />
      </div>

      {/* Delivery Instructions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Instructions (Optional)
        </label>
        <textarea
          value={formData.shippingAddress?.deliveryInstructions ?? ''}
          onChange={(e) => handleChange('deliveryInstructions', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="e.g., Ring the bell twice, leave at gate, etc."
          rows={2}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
        >
          Continue to Payment
        </button>
      </div>
    </form>
  );
}
```

### 4. PaymentMethod.jsx → PaymentMethod.tsx

```typescript
// frontend/src/components/checkout/PaymentMethod.tsx
'use client';

import { useState, useCallback } from 'react';
import type { PaymentMethodProps } from '@/types/checkout-components';
import type { PaymentMethod } from '@/types/checkout';

const PAYMENT_METHODS: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: 'bank-transfer',
    label: 'Bank Transfer / Mobile Payment',
    description: 'Transfer via JazzCash, EasyPaisa, or Bank'
  },
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay when your order arrives'
  }
];

export default function PaymentMethod({
  formData,
  updateFormData,
  onNext,
  onBack,
  errors = {},
  total
}: PaymentMethodProps) {
  const [localErrors, setLocalErrors] = useState<Record<string, string>>(errors);

  const handleMethodChange = useCallback((method: PaymentMethod) => {
    updateFormData('payment.method', method);
    if (localErrors.method) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.method;
        return newErrors;
      });
    }
  }, [localErrors, updateFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.payment?.method) {
      setLocalErrors({ method: 'Please select a payment method' });
      return;
    }

    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Payment Method
        </h3>

        <div className="space-y-3">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.value}
              className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.payment?.method === method.value
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment-method"
                value={method.value}
                checked={formData.payment?.method === method.value}
                onChange={() => handleMethodChange(method.value)}
                className="mt-1 w-4 h-4 text-purple-600"
              />
              <div className="ml-3 flex-1">
                <p className="font-medium text-gray-900">{method.label}</p>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
            </label>
          ))}
        </div>

        {localErrors.method && (
          <p className="mt-2 text-sm text-red-600">{localErrors.method}</p>
        )}
      </div>

      {/* Bank Transfer Details */}
      {formData.payment?.method === 'bank-transfer' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Bank Transfer Details</h4>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Bank Name:</span> HBL</p>
            <p><span className="font-medium">Account Number:</span> 1234567890</p>
            <p><span className="font-medium">Account Name:</span> Laraib Creative</p>
            <p><span className="font-medium">Amount:</span> PKR {total.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700"
        >
          Continue to Review
        </button>
      </div>
    </form>
  );
}
```

### 5. OrderReview.jsx → OrderReview.tsx

**Status:** ✅ COMPLETED (See above)

---

## Phase 3: UI Components Migration

### 1. Switch.jsx → Switch.tsx

```typescript
// frontend/src/components/ui/Switch.tsx
'use client';

import { useState, useCallback } from 'react';

interface SwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export default function Switch({
  checked = false,
  onChange,
  disabled = false,
  label,
  className = ''
}: SwitchProps) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleChange = useCallback(() => {
    if (!disabled) {
      const newValue = !isChecked;
      setIsChecked(newValue);
      onChange?.(newValue);
    }
  }, [isChecked, disabled, onChange]);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleChange}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isChecked ? 'bg-purple-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      {label && (
        <label className="text-sm font-medium text-gray-700 cursor-pointer">
          {label}
        </label>
      )}
    </div>
  );
}
```

---

## Phase 4: Custom Hooks Migration

### Create useForm Hook

```typescript
// frontend/src/hooks/useForm.ts
import { useState, useCallback } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit?: (values: T) => Promise<void> | void;
  validate?: (values: T) => Record<string, string>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
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

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();

    // Validate
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    // Submit
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setValues,
    setErrors
  };
}
```

### Create useAsync Hook

```typescript
// frontend/src/hooks/useAsync.ts
import { useState, useCallback, useEffect } from 'react';

type Status = 'idle' | 'pending' | 'success' | 'error';

interface UseAsyncOptions {
  immediate?: boolean;
}

export function useAsync<T, E = string>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncOptions = { immediate: true }
) {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err as E);
      setStatus('error');
      throw err;
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    status,
    data,
    error,
    execute,
    isLoading: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error'
  };
}
```

---

## Migration Checklist

### Frontend Components
- [ ] AuthContext.jsx → AuthContext.tsx
- [ ] ThemeContext.jsx → ThemeContext.tsx
- [ ] CheckoutStepper.jsx → CheckoutStepper.tsx
- [ ] CustomerInfoForm.jsx → CustomerInfoForm.tsx
- [ ] ShippingAddressForm.jsx → ShippingAddressForm.tsx
- [ ] PaymentMethod.jsx → PaymentMethod.tsx
- [ ] OrderReview.jsx → OrderReview.tsx
- [ ] Switch.jsx → Switch.tsx
- [ ] All other JSX files in components/

### Type Definitions
- [ ] Create checkout-components.ts
- [ ] Create form-types.ts
- [ ] Create api-types.ts
- [ ] Create error-types.ts
- [ ] Update existing type files

### Custom Hooks
- [ ] Create useForm.ts
- [ ] Create useAsync.ts
- [ ] Create useLocalStorage.ts
- [ ] Create usePrevious.ts
- [ ] Create useDebounce.ts

### Testing
- [ ] Unit tests for components
- [ ] Integration tests for forms
- [ ] E2E tests for checkout flow

---

## Best Practices

1. **Always define prop interfaces**
   ```typescript
   interface ComponentProps {
     prop1: string;
     prop2?: number;
     onChange: (value: string) => void;
   }
   ```

2. **Use proper event types**
   ```typescript
   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     // ...
   };
   ```

3. **Avoid `any` type**
   ```typescript
   // ❌ Bad
   const handleChange = (value: any) => { };
   
   // ✅ Good
   const handleChange = (value: string) => { };
   ```

4. **Use union types for variants**
   ```typescript
   type ButtonVariant = 'primary' | 'secondary' | 'danger';
   ```

5. **Export types from type files**
   ```typescript
   // types/index.ts
   export * from './checkout';
   export * from './checkout-components';
   export * from './cart';
   ```

---

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution:** Ensure tsconfig.json has correct path mappings
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Props type errors
**Solution:** Always define prop interfaces before component
```typescript
interface Props {
  // Define all props here
}

export default function Component(props: Props) {
  // ...
}
```

### Issue: Event handler type errors
**Solution:** Use proper React event types
```typescript
import type { ChangeEvent, FormEvent } from 'react';

const handleChange = (e: ChangeEvent<HTMLInputElement>) => { };
const handleSubmit = (e: FormEvent<HTMLFormElement>) => { };
```

---

**Status:** Ready for Implementation
**Estimated Time:** 3-4 days
**Priority:** High
