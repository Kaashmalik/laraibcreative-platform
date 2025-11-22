/**
 * Currency Switcher Component
 * Switch between PKR, USD, SAR
 */

'use client';

import { useState, useEffect } from 'react';
import { DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const currencies = {
  PKR: { symbol: 'Rs.', name: 'Pakistani Rupee', rate: 1 },
  USD: { symbol: '$', name: 'US Dollar', rate: 0.0036 }, // Approximate
  SAR: { symbol: 'SR', name: 'Saudi Riyal', rate: 0.013 }, // Approximate
};

export type Currency = keyof typeof currencies;

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('PKR');

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('currency') as Currency;
    if (saved && currencies[saved]) {
      setCurrency(saved);
    }
  }, []);

  const changeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    // Trigger re-render
    window.dispatchEvent(new Event('currencychange'));
  };

  const convert = (amount: number, from: Currency = 'PKR'): number => {
    if (from === currency) return amount;
    const fromRate = currencies[from].rate;
    const toRate = currencies[currency].rate;
    return (amount * toRate) / fromRate;
  };

  const format = (amount: number, from: Currency = 'PKR'): string => {
    const converted = convert(amount, from);
    const { symbol } = currencies[currency];
    return `${symbol} ${converted.toLocaleString('en-US', {
      minimumFractionDigits: currency === 'PKR' ? 0 : 2,
      maximumFractionDigits: currency === 'PKR' ? 0 : 2,
    })}`;
  };

  return { currency, changeCurrency, convert, format, currencies };
}

export default function CurrencySwitcher() {
  const { currency, changeCurrency, currencies: currencyList } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      <DollarSign className="w-4 h-4" />
      <select
        value={currency}
        onChange={(e) => changeCurrency(e.target.value as Currency)}
        className="bg-transparent border-none outline-none cursor-pointer"
      >
        {Object.entries(currencyList).map(([code, info]) => (
          <option key={code} value={code}>
            {code} - {info.name}
          </option>
        ))}
      </select>
    </div>
  );
}

