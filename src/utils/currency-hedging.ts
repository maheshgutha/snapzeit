// Currency hedging and exchange rate management
export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
  volatility: 'low' | 'medium' | 'high';
}

export interface HedgingStrategy {
  baseCurrency: string;
  targetCurrency: string;
  hedgePercentage: number;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  autoAdjust: boolean;
}

// Mock exchange rates - in production, use real-time API
const EXCHANGE_RATES: ExchangeRate[] = [
  { from: 'USD', to: 'EUR', rate: 0.92, lastUpdated: new Date(), volatility: 'low' },
  { from: 'USD', to: 'GBP', rate: 0.79, lastUpdated: new Date(), volatility: 'medium' },
  { from: 'USD', to: 'INR', rate: 83.12, lastUpdated: new Date(), volatility: 'high' },
  { from: 'USD', to: 'JPY', rate: 149.50, lastUpdated: new Date(), volatility: 'medium' },
  { from: 'USD', to: 'BRL', rate: 5.18, lastUpdated: new Date(), volatility: 'high' },
  { from: 'USD', to: 'AUD', rate: 1.52, lastUpdated: new Date(), volatility: 'medium' },
  { from: 'USD', to: 'CAD', rate: 1.36, lastUpdated: new Date(), volatility: 'low' },
  { from: 'USD', to: 'AED', rate: 3.67, lastUpdated: new Date(), volatility: 'low' }
];

// Hedging strategies by country risk profile
const HEDGING_STRATEGIES: { [key: string]: HedgingStrategy } = {
  'US': { baseCurrency: 'USD', targetCurrency: 'USD', hedgePercentage: 0, riskLevel: 'conservative', autoAdjust: false },
  'GB': { baseCurrency: 'USD', targetCurrency: 'GBP', hedgePercentage: 75, riskLevel: 'conservative', autoAdjust: true },
  'DE': { baseCurrency: 'USD', targetCurrency: 'EUR', hedgePercentage: 80, riskLevel: 'conservative', autoAdjust: true },
  'IN': { baseCurrency: 'USD', targetCurrency: 'INR', hedgePercentage: 60, riskLevel: 'moderate', autoAdjust: true },
  'JP': { baseCurrency: 'USD', targetCurrency: 'JPY', hedgePercentage: 70, riskLevel: 'moderate', autoAdjust: true },
  'BR': { baseCurrency: 'USD', targetCurrency: 'BRL', hedgePercentage: 50, riskLevel: 'aggressive', autoAdjust: true },
  'AU': { baseCurrency: 'USD', targetCurrency: 'AUD', hedgePercentage: 65, riskLevel: 'moderate', autoAdjust: true }
};

export const getExchangeRate = (from: string, to: string): number => {
  if (from === to) return 1;
  
  const rate = EXCHANGE_RATES.find(r => r.from === from && r.to === to);
  if (rate) return rate.rate;
  
  // Try reverse rate
  const reverseRate = EXCHANGE_RATES.find(r => r.from === to && r.to === from);
  if (reverseRate) return 1 / reverseRate.rate;
  
  return 1; // Fallback
};

export const calculateHedgedPrice = (basePrice: number, fromCurrency: string, toCurrency: string): number => {
  const strategy = HEDGING_STRATEGIES[toCurrency] || HEDGING_STRATEGIES['US'];
  const exchangeRate = getExchangeRate(fromCurrency, toCurrency);
  
  let convertedPrice = basePrice * exchangeRate;
  
  // Apply hedging adjustment based on volatility
  const rate = EXCHANGE_RATES.find(r => r.from === fromCurrency && r.to === toCurrency);
  if (rate && strategy.hedgePercentage > 0) {
    const volatilityAdjustment = {
      'low': 0.02,
      'medium': 0.05,
      'high': 0.08
    }[rate.volatility];
    
    const hedgeAdjustment = (strategy.hedgePercentage / 100) * volatilityAdjustment;
    convertedPrice *= (1 + hedgeAdjustment);
  }
  
  return Math.round(convertedPrice);
};

export const getCurrencyRisk = (currency: string): 'low' | 'medium' | 'high' => {
  const rate = EXCHANGE_RATES.find(r => r.to === currency);
  return rate?.volatility || 'medium';
};

export const shouldAdjustPricing = (currency: string): boolean => {
  const strategy = HEDGING_STRATEGIES[currency];
  return strategy?.autoAdjust || false;
};

// Price adjustment recommendations
export const getPricingRecommendation = (currency: string) => {
  const risk = getCurrencyRisk(currency);
  const strategy = HEDGING_STRATEGIES[currency];
  
  return {
    riskLevel: risk,
    hedgePercentage: strategy?.hedgePercentage || 0,
    recommendation: risk === 'high' ? 'Consider increasing prices by 5-10%' :
                   risk === 'medium' ? 'Monitor exchange rates weekly' :
                   'Maintain current pricing',
    autoAdjust: strategy?.autoAdjust || false
  };
};

export default {
  getExchangeRate,
  calculateHedgedPrice,
  getCurrencyRisk,
  shouldAdjustPricing,
  getPricingRecommendation
};