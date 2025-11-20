import React from 'react';

export interface CheckoutStep {
  number: number;
  title: string;
}

export interface CheckoutStepperProps {
  currentStep: number;
  steps: CheckoutStep[];
}

declare const CheckoutStepper: React.FC<CheckoutStepperProps>;

export default CheckoutStepper;

