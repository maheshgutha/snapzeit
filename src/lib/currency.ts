// Supported currencies with their symbols and formatting
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]['code'];

export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find(c => c.code === code);
  return currency?.symbol || code;
}

export function formatPrice(amount: number, currencyCode: string = 'USD'): string {
  const symbol = getCurrencySymbol(currencyCode);
  
  // For currencies without decimal places
  if (['JPY', 'KRW', 'IDR'].includes(currencyCode)) {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

// Static exchange rates (relative to USD) used as the fallback until live
// rates load. refreshExchangeRates() overwrites these at app startup.
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 82.5,
  AUD: 1.54,
  CAD: 1.36,
  JPY: 156.7,
  CNY: 7.2,
  BRL: 5.25,
  MXN: 17.1,
  AED: 3.67,
  SGD: 1.35,
  CHF: 0.9,
  ZAR: 18.0,
  SEK: 10.5,
  NZD: 1.7,
  KRW: 1350,
  THB: 34.5,
  PHP: 56.0,
  IDR: 15600,
};

const RATES_CACHE_KEY = 'snapzeit_fx_rates';
const RATES_MAX_AGE_MS = 24 * 60 * 60 * 1000; // refresh daily

// Fetch live USD-based rates (open.er-api.com — free, no API key) and merge
// them into EXCHANGE_RATES. Falls back silently to the static table offline.
export async function refreshExchangeRates(): Promise<void> {
  try {
    const cached = localStorage.getItem(RATES_CACHE_KEY);
    if (cached) {
      const { at, rates } = JSON.parse(cached);
      if (rates && Date.now() - at < RATES_MAX_AGE_MS) {
        Object.assign(EXCHANGE_RATES, rates);
        return;
      }
    }

    const resp = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!resp.ok) return;
    const json = await resp.json();
    if (json?.result === 'success' && json.rates) {
      Object.assign(EXCHANGE_RATES, json.rates);
      localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ at: Date.now(), rates: json.rates }));
    }
  } catch (e) {
    // Offline or blocked: static fallback rates remain in effect.
  }
}

export function convertAmount(amount: number, from: string, to: string) {
  const fromRate = EXCHANGE_RATES[from] || 1;
  const toRate = EXCHANGE_RATES[to] || 1;
  // Convert from 'from' to USD, then to 'to'
  const inUsd = amount / fromRate;
  const converted = inUsd * toRate;
  return converted;
}

// Detect user's country from browser locale (e.g., en-US -> US)
export function detectUserCountryCode(): string {
  try {
    if (typeof navigator !== 'undefined') {
      const locale = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-US';
      const parts = locale.split('-');
      if (parts.length === 2) return parts[1].toUpperCase();
    }
  } catch (e) {
    // ignore
  }
  return 'US';
}

export function getUserCurrency(): string {
  const countryCode = detectUserCountryCode();
  const found = COUNTRIES.find(c => c.code === countryCode);
  return found?.currency || 'USD';
}

// Convert an amount from `fromCurrency` to user's currency and format it.
export function formatPriceLocal(amount: number, fromCurrency: string = 'USD') {
  const toCurrency = getUserCurrency();
  if (!fromCurrency) fromCurrency = 'USD';
  if (fromCurrency === toCurrency) return formatPrice(amount, fromCurrency);
  const converted = convertAmount(amount, fromCurrency, toCurrency);
  return formatPrice(Number(converted.toFixed(2)), toCurrency);
}

// Common countries with their default currencies
export const COUNTRIES = [
  { name: 'United States', code: 'US', currency: 'USD' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP' },
  { name: 'Canada', code: 'CA', currency: 'CAD' },
  { name: 'Australia', code: 'AU', currency: 'AUD' },
  { name: 'Germany', code: 'DE', currency: 'EUR' },
  { name: 'France', code: 'FR', currency: 'EUR' },
  { name: 'Italy', code: 'IT', currency: 'EUR' },
  { name: 'Spain', code: 'ES', currency: 'EUR' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR' },
  { name: 'India', code: 'IN', currency: 'INR' },
  { name: 'Japan', code: 'JP', currency: 'JPY' },
  { name: 'China', code: 'CN', currency: 'CNY' },
  { name: 'Brazil', code: 'BR', currency: 'BRL' },
  { name: 'Mexico', code: 'MX', currency: 'MXN' },
  { name: 'United Arab Emirates', code: 'AE', currency: 'AED' },
  { name: 'Singapore', code: 'SG', currency: 'SGD' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR' },
  { name: 'Sweden', code: 'SE', currency: 'SEK' },
  { name: 'New Zealand', code: 'NZ', currency: 'NZD' },
  { name: 'South Korea', code: 'KR', currency: 'KRW' },
  { name: 'Thailand', code: 'TH', currency: 'THB' },
  { name: 'Philippines', code: 'PH', currency: 'PHP' },
  { name: 'Indonesia', code: 'ID', currency: 'IDR' },
  { name: 'Other', code: 'OTHER', currency: 'USD' },
] as const;
