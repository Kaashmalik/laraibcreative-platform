/**
 * Real-time Price Calculator Store
 * Zustand store for custom order price calculation
 */

import { create } from 'zustand';
import api from '@/lib/api';

interface FabricSelection {
  providedBy: 'customer' | 'laraibcreative';
  type?: string;
  color?: string;
  quality?: string;
  metersRequired?: number;
  fabricId?: string;
}

interface EmbroiderySelection {
  type: 'zardozi' | 'aari' | 'sequins' | 'beads' | 'thread' | 'mixed' | 'none';
  complexity: 'simple' | 'moderate' | 'intricate' | 'heavy';
  coverage: 'minimal' | 'partial' | 'full' | 'heavy';
}

interface AddOn {
  name: string;
  price: number;
  description?: string;
}

interface PriceBreakdown {
  basePrice: number;
  fabricCost: number;
  embroideryCost: number;
  addOnsCost: number;
  rushOrderFee: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
}

interface PriceCalculatorState {
  // Order data
  serviceType: 'fully-custom' | 'brand-article-copy' | null;
  fabric: FabricSelection | null;
  embroidery: EmbroiderySelection | null;
  addOns: AddOn[];
  rushOrder: boolean;
  measurements: Record<string, number> | null;

  // Price breakdown
  priceBreakdown: PriceBreakdown | null;
  loading: boolean;
  error: string | null;

  // Actions
  setServiceType: (type: 'fully-custom' | 'brand-article-copy') => void;
  setFabric: (fabric: FabricSelection) => void;
  setEmbroidery: (embroidery: EmbroiderySelection) => void;
  addAddOn: (addOn: AddOn) => void;
  removeAddOn: (name: string) => void;
  setRushOrder: (rush: boolean) => void;
  setMeasurements: (measurements: Record<string, number>) => void;
  calculatePrice: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  serviceType: null,
  fabric: null,
  embroidery: null,
  addOns: [],
  rushOrder: false,
  measurements: null,
  priceBreakdown: null,
  loading: false,
  error: null,
};

export const usePriceCalculator = create<PriceCalculatorState>((set, get) => ({
  ...initialState,

  setServiceType: (type) => {
    set({ serviceType: type });
    get().calculatePrice();
  },

  setFabric: (fabric) => {
    set({ fabric });
    get().calculatePrice();
  },

  setEmbroidery: (embroidery) => {
    set({ embroidery });
    get().calculatePrice();
  },

  addAddOn: (addOn) => {
    set((state) => ({
      addOns: [...state.addOns, addOn]
    }));
    get().calculatePrice();
  },

  removeAddOn: (name) => {
    set((state) => ({
      addOns: state.addOns.filter(addOn => addOn.name !== name)
    }));
    get().calculatePrice();
  },

  setRushOrder: (rush) => {
    set({ rushOrder: rush });
    get().calculatePrice();
  },

  setMeasurements: (measurements) => {
    set({ measurements });
  },

  calculatePrice: async () => {
    const { serviceType, fabric, embroidery, addOns, rushOrder } = get();

    if (!serviceType) {
      set({ priceBreakdown: null, error: null });
      return;
    }

    set({ loading: true, error: null });

    try {
      // Call backend price calculator API
      const response = await api.priceCalculator.calculate({
        serviceType,
        fabric,
        embroidery,
        addOns,
        rushOrder,
      });

      set({
        priceBreakdown: response.data,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Error calculating price:', error);
      set({
        error: error.response?.data?.message || 'Failed to calculate price',
        loading: false,
      });
    }
  },

  reset: () => {
    set(initialState);
  },
}));

