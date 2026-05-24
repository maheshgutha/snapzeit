// Predictive Analytics for Demand Forecasting per Market
export interface MarketData {
  country: string;
  city: string;
  month: number;
  year: number;
  bookings: number;
  revenue: number;
  avgPrice: number;
  photographerCount: number;
  searchVolume: number;
}

export interface DemandForecast {
  period: string;
  predictedBookings: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: number;
  factors: string[];
}

export interface MarketInsights {
  country: string;
  currentDemand: 'high' | 'medium' | 'low';
  growthRate: number;
  peakSeasons: string[];
  recommendedPricing: number;
  competitorAnalysis: {
    avgPrice: number;
    marketShare: number;
    topCompetitors: string[];
  };
}

// Historical data for ML model (mock data - in production, use real data)
const HISTORICAL_DATA: MarketData[] = [
  // US Market
  { country: 'US', city: 'New York', month: 1, year: 2024, bookings: 450, revenue: 125000, avgPrice: 278, photographerCount: 89, searchVolume: 12500 },
  { country: 'US', city: 'New York', month: 2, year: 2024, bookings: 380, revenue: 98000, avgPrice: 258, photographerCount: 91, searchVolume: 9800 },
  { country: 'US', city: 'Los Angeles', month: 1, year: 2024, bookings: 520, revenue: 145000, avgPrice: 279, photographerCount: 112, searchVolume: 15200 },
  
  // India Market
  { country: 'IN', city: 'Mumbai', month: 1, year: 2024, bookings: 680, revenue: 85000, avgPrice: 125, photographerCount: 156, searchVolume: 28500 },
  { country: 'IN', city: 'Delhi', month: 1, year: 2024, bookings: 590, revenue: 72000, avgPrice: 122, photographerCount: 134, searchVolume: 24200 },
  
  // UK Market
  { country: 'GB', city: 'London', month: 1, year: 2024, bookings: 320, revenue: 89000, avgPrice: 278, photographerCount: 67, searchVolume: 8900 },
];

// Seasonal patterns by country and event type
const SEASONAL_PATTERNS = {
  'US': {
    'wedding': [0.6, 0.7, 0.9, 1.2, 1.8, 2.1, 1.9, 1.7, 1.5, 1.3, 0.8, 0.5],
    'portrait': [0.8, 0.9, 1.1, 1.2, 1.3, 1.1, 0.9, 0.8, 1.0, 1.2, 1.4, 1.6],
    'event': [1.2, 1.0, 1.1, 1.3, 1.4, 1.2, 0.8, 0.7, 1.0, 1.3, 1.5, 1.8]
  },
  'IN': {
    'wedding': [1.8, 1.9, 1.6, 1.2, 0.8, 0.6, 0.7, 0.8, 1.0, 1.4, 1.7, 2.0],
    'portrait': [1.1, 1.2, 1.3, 1.4, 1.2, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3],
    'event': [1.3, 1.4, 1.2, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.3, 1.5, 1.6]
  },
  'GB': {
    'wedding': [0.5, 0.6, 0.8, 1.1, 1.5, 1.8, 2.0, 1.9, 1.6, 1.2, 0.7, 0.4],
    'portrait': [0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.3],
    'event': [1.1, 1.0, 1.2, 1.3, 1.4, 1.3, 1.1, 0.9, 1.0, 1.2, 1.4, 1.5]
  }
};

// Predictive model using simple linear regression with seasonality
export const forecastDemand = (
  country: string,
  city: string,
  eventType: string,
  monthsAhead: number = 3
): DemandForecast[] => {
  const historicalData = HISTORICAL_DATA.filter(d => d.country === country && d.city === city);
  const seasonalPattern = SEASONAL_PATTERNS[country as keyof typeof SEASONAL_PATTERNS]?.[eventType as keyof typeof SEASONAL_PATTERNS['US']] || 
                         Array(12).fill(1);
  
  if (historicalData.length < 2) {
    return Array(monthsAhead).fill(null).map((_, i) => ({
      period: getMonthName(new Date().getMonth() + i + 1),
      predictedBookings: 100,
      confidence: 0.3,
      trend: 'stable' as const,
      seasonality: 1,
      factors: ['Insufficient historical data']
    }));
  }
  
  // Calculate trend
  const avgBookings = historicalData.reduce((sum, d) => sum + d.bookings, 0) / historicalData.length;
  const trend = historicalData.length > 1 ? 
    (historicalData[historicalData.length - 1].bookings - historicalData[0].bookings) / historicalData.length : 0;
  
  const forecasts: DemandForecast[] = [];
  
  for (let i = 1; i <= monthsAhead; i++) {
    const futureMonth = (new Date().getMonth() + i) % 12;
    const seasonalMultiplier = seasonalPattern[futureMonth];
    
    const baseBookings = avgBookings + (trend * i);
    const seasonalBookings = baseBookings * seasonalMultiplier;
    
    const confidence = Math.max(0.4, Math.min(0.95, 1 - (i * 0.1) - (Math.abs(trend) * 0.05)));
    
    const factors = [];
    if (seasonalMultiplier > 1.3) factors.push('Peak season');
    if (seasonalMultiplier < 0.8) factors.push('Off season');
    if (trend > 10) factors.push('Growing market');
    if (trend < -10) factors.push('Declining market');
    
    forecasts.push({
      period: getMonthName(futureMonth + 1),
      predictedBookings: Math.round(seasonalBookings),
      confidence: Math.round(confidence * 100) / 100,
      trend: trend > 5 ? 'increasing' : trend < -5 ? 'decreasing' : 'stable',
      seasonality: Math.round(seasonalMultiplier * 100) / 100,
      factors
    });
  }
  
  return forecasts;
};

// Market insights and recommendations
export const getMarketInsights = (country: string, city: string): MarketInsights => {
  const marketData = HISTORICAL_DATA.filter(d => d.country === country && d.city === city);
  const recentData = marketData.slice(-3); // Last 3 months
  
  if (recentData.length === 0) {
    return {
      country,
      currentDemand: 'medium',
      growthRate: 0,
      peakSeasons: ['Summer'],
      recommendedPricing: 200,
      competitorAnalysis: {
        avgPrice: 200,
        marketShare: 0.1,
        topCompetitors: ['Unknown']
      }
    };
  }
  
  const avgBookings = recentData.reduce((sum, d) => sum + d.bookings, 0) / recentData.length;
  const avgPrice = recentData.reduce((sum, d) => sum + d.avgPrice, 0) / recentData.length;
  
  // Determine current demand level
  const currentDemand = avgBookings > 500 ? 'high' : avgBookings > 300 ? 'medium' : 'low';
  
  // Calculate growth rate
  const growthRate = recentData.length > 1 ? 
    ((recentData[recentData.length - 1].bookings - recentData[0].bookings) / recentData[0].bookings) * 100 : 0;
  
  // Identify peak seasons
  const seasonalPattern = SEASONAL_PATTERNS[country as keyof typeof SEASONAL_PATTERNS]?.['wedding'] || Array(12).fill(1);
  const peakMonths = seasonalPattern
    .map((value, index) => ({ month: index, value }))
    .filter(item => item.value > 1.4)
    .map(item => getMonthName(item.month + 1));
  
  return {
    country,
    currentDemand,
    growthRate: Math.round(growthRate * 100) / 100,
    peakSeasons: peakMonths.length > 0 ? peakMonths : ['Summer'],
    recommendedPricing: Math.round(avgPrice * (currentDemand === 'high' ? 1.1 : currentDemand === 'low' ? 0.9 : 1)),
    competitorAnalysis: {
      avgPrice: Math.round(avgPrice),
      marketShare: 0.15, // Mock data
      topCompetitors: ['Competitor A', 'Competitor B'] // Mock data
    }
  };
};

// Price optimization based on demand forecast
export const optimizePricing = (
  basePrice: number,
  demandForecast: DemandForecast,
  marketInsights: MarketInsights
): number => {
  let optimizedPrice = basePrice;
  
  // Adjust for demand level
  if (demandForecast.predictedBookings > 400) {
    optimizedPrice *= 1.15; // High demand - increase price
  } else if (demandForecast.predictedBookings < 200) {
    optimizedPrice *= 0.9; // Low demand - decrease price
  }
  
  // Adjust for seasonality
  if (demandForecast.seasonality > 1.3) {
    optimizedPrice *= 1.1; // Peak season premium
  } else if (demandForecast.seasonality < 0.8) {
    optimizedPrice *= 0.95; // Off-season discount
  }
  
  // Adjust for market growth
  if (marketInsights.growthRate > 20) {
    optimizedPrice *= 1.05; // Growing market
  }
  
  return Math.round(optimizedPrice);
};

// Helper function
const getMonthName = (month: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[(month - 1) % 12];
};

// Demand alerts for business decisions
export const getDemandAlerts = (country: string, city: string) => {
  const forecast = forecastDemand(country, city, 'wedding', 2);
  const insights = getMarketInsights(country, city);
  
  const alerts = [];
  
  if (forecast[0]?.predictedBookings > 500) {
    alerts.push({ type: 'opportunity', message: 'High demand expected - consider increasing prices' });
  }
  
  if (insights.growthRate > 30) {
    alerts.push({ type: 'growth', message: 'Rapid market growth - expand photographer network' });
  }
  
  if (forecast[0]?.seasonality > 1.5) {
    alerts.push({ type: 'seasonal', message: 'Peak season approaching - ensure photographer availability' });
  }
  
  return alerts;
};

export default {
  forecastDemand,
  getMarketInsights,
  optimizePricing,
  getDemandAlerts
};