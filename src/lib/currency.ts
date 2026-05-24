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
