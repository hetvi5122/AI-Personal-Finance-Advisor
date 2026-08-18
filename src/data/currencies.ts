import { Currency, CurrencyCode } from '../types';

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 0.012 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 1.08 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 1.28 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.0065 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rateToUSD: 0.73 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 0.65 },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 0.75 },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rateToUSD: 0.27 },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'INR';

/**
 * Format an amount in the specified currency code.
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'INR'): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.INR;
  
  // Format based on currency locale standards
  const localeMap: Record<CurrencyCode, string> = {
    USD: 'en-US',
    INR: 'en-IN',
    EUR: 'de-DE',
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CAD: 'en-CA',
    AUD: 'en-AU',
    SGD: 'en-SG',
    AED: 'ar-AE',
  };

  const locale = localeMap[currencyCode] || 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
  }).format(amount);
}

/**
 * Convert an amount from one currency to another using fixed approximate rates.
 */
export function convertCurrency(
  amount: number,
  fromCode: CurrencyCode,
  toCode: CurrencyCode
): number {
  if (fromCode === toCode) return amount;
  const fromRate = CURRENCIES[fromCode]?.rateToUSD || 1;
  const toRate = CURRENCIES[toCode]?.rateToUSD || 1;
  const amountInUSD = amount * fromRate;
  return amountInUSD / toRate;
}
