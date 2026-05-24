// Dynamic Pricing System with Real-time Adjustments
export interface PricingFactors {
  baseDemand: number;
  seasonality: number;
  availability: number;
  competition: number;
  userSegment: string;
  timeToEvent: number;
  marketTrend: number;
}

export interface DynamicPrice {
  originalPrice: number;
  adjustedPrice: number;
  adjustmentFactor: number;
  reasons: string[];
  confidence: number;
}

export const calculateDynamicPrice = (
  basePrice: number,
  factors: PricingFactors
): DynamicPrice => {
  let adjustmentFactor = 1.0;
  const reasons: string[] = [];
  
  // Demand-based adjustment (±30%)
  if (factors.baseDemand > 0.8) {
    adjustmentFactor *= 1.2;
    reasons.push('High demand in your area');
  } else if (factors.baseDemand < 0.4) {
    adjustmentFactor *= 0.85;
    reasons.push('Lower demand - special pricing');
  }
  
  // Seasonality adjustment (±25%)
  if (factors.seasonality > 1.3) {
    adjustmentFactor *= 1.15;
    reasons.push('Peak season premium');
  } else if (factors.seasonality < 0.7) {
    adjustmentFactor *= 0.9;
    reasons.push('Off-season discount');
  }
  
  // Availability scarcity (±20%)
  if (factors.availability < 0.3) {
    adjustmentFactor *= 1.15;
    reasons.push('Limited availability');
  } else if (factors.availability > 0.8) {
    adjustmentFactor *= 0.95;
    reasons.push('Good availability');
  }
  
  // Competition adjustment (±15%)
  if (factors.competition > 0.7) {
    adjustmentFactor *= 0.92;
    reasons.push('Competitive market pricing');
  }
  
  // Time to event urgency (±25%)
  if (factors.timeToEvent < 7) {
    adjustmentFactor *= 1.2;
    reasons.push('Rush booking premium');
  } else if (factors.timeToEvent > 90) {
    adjustmentFactor *= 0.9;
    reasons.push('Early booking discount');
  }
  
  // User segment pricing
  if (factors.userSegment === 'premium') {
    adjustmentFactor *= 1.1;
  } else if (factors.userSegment === 'budget') {
    adjustmentFactor *= 0.9;
    reasons.push('Budget-friendly pricing');
  }
  
  // Market trend adjustment (±10%)
  if (factors.marketTrend > 0.1) {
    adjustmentFactor *= 1.05;
    reasons.push('Growing market rates');
  }
  
  // Cap adjustments to reasonable bounds
  adjustmentFactor = Math.max(0.7, Math.min(1.5, adjustmentFactor));
  
  const adjustedPrice = Math.round(basePrice * adjustmentFactor);
  const confidence = Math.min(0.95, 0.6 + (reasons.length * 0.08));
  
  return {
    originalPrice: basePrice,
    adjustedPrice,
    adjustmentFactor,
    reasons,
    confidence
  };
};

export const getPricingFactors = async (
  photographerId: string,
  location: string,
  eventDate: Date,
  eventType: string
): Promise<PricingFactors> => {
  // Mock real-time data - in production, fetch from APIs
  const daysDiff = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    baseDemand: 0.6 + Math.random() * 0.4, // 0.6-1.0
    seasonality: getSeasonalityFactor(eventDate, eventType),
    availability: 0.3 + Math.random() * 0.5, // 0.3-0.8
    competition: 0.5 + Math.random() * 0.3, // 0.5-0.8
    userSegment: getUserSegment(), // 'budget', 'standard', 'premium'
    timeToEvent: daysDiff,
    marketTrend: -0.05 + Math.random() * 0.2 // -0.05 to 0.15
  };
};

const getSeasonalityFactor = (date: Date, eventType: string): number => {
  const month = date.getMonth();
  
  // Wedding seasonality (peak: May-September)
  if (eventType === 'wedding') {
    const weddingSeasonality = [0.6, 0.7, 0.9, 1.2, 1.6, 1.8, 1.7, 1.5, 1.3, 1.1, 0.8, 0.5];
    return weddingSeasonality[month];
  }
  
  // Portrait seasonality (peak: spring/fall)
  if (eventType === 'portrait') {
    const portraitSeasonality = [0.8, 0.9, 1.2, 1.3, 1.1, 0.9, 0.8, 0.8, 1.0, 1.2, 1.1, 1.0];
    return portraitSeasonality[month];
  }
  
  return 1.0; // Default
};

const getUserSegment = (): string => {
  // Mock user segmentation - in production, use ML model
  const segments = ['budget', 'standard', 'premium'];
  return segments[Math.floor(Math.random() * segments.length)];
};

export const getCompetitorPricing = async (location: string, eventType: string): Promise<{
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  competitorCount: number;
}> => {
  // Mock competitor data - in production, scrape or use API
  const basePrice = eventType === 'wedding' ? 2000 : eventType === 'portrait' ? 400 : 800;
  
  return {
    avgPrice: basePrice + (Math.random() - 0.5) * 400,
    minPrice: basePrice * 0.7,
    maxPrice: basePrice * 1.8,
    competitorCount: 15 + Math.floor(Math.random() * 20)
  };
};

export const optimizePriceForConversion = (
  basePrice: number,
  userBehavior: {
    viewTime: number;
    previousBookings: number;
    priceComparisons: number;
  }
): number => {
  let optimizedPrice = basePrice;
  
  // Price-sensitive user (lots of comparisons)
  if (userBehavior.priceComparisons > 5) {
    optimizedPrice *= 0.95;
  }
  
  // Engaged user (long view time)
  if (userBehavior.viewTime > 300) { // 5 minutes
    optimizedPrice *= 1.02;
  }
  
  // Repeat customer
  if (userBehavior.previousBookings > 0) {
    optimizedPrice *= 0.97; // Loyalty discount
  }
  
  return Math.round(optimizedPrice);
};

// Real-time price monitoring
export const monitorPricePerformance = (
  photographerId: string,
  priceHistory: { price: number; bookings: number; date: Date }[]
) => {
  if (priceHistory.length < 7) return null;
  
  const recent = priceHistory.slice(-7);
  const avgBookings = recent.reduce((sum, day) => sum + day.bookings, 0) / 7;
  const avgPrice = recent.reduce((sum, day) => sum + day.price, 0) / 7;
  
  return {
    avgBookingsPerDay: avgBookings,
    avgPrice,
    recommendation: avgBookings < 0.5 ? 'decrease_price' : avgBookings > 2 ? 'increase_price' : 'maintain',
    elasticity: calculatePriceElasticity(priceHistory)
  };
};

const calculatePriceElasticity = (history: any[]): number => {
  if (history.length < 10) return -1; // Default elasticity
  
  // Simple elasticity calculation
  const recent = history.slice(-5);
  const older = history.slice(-10, -5);
  
  const priceChange = (recent[0].price - older[0].price) / older[0].price;
  const demandChange = (recent.reduce((s, d) => s + d.bookings, 0) - older.reduce((s, d) => s + d.bookings, 0)) / older.reduce((s, d) => s + d.bookings, 0);
  
  return priceChange !== 0 ? demandChange / priceChange : -1;
};

export default {
  calculateDynamicPrice,
  getPricingFactors,
  getCompetitorPricing,
  optimizePriceForConversion,
  monitorPricePerformance
};