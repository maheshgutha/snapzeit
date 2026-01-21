// Predictive Availability System for Photographer Schedules
export interface AvailabilityPattern {
  photographerId: string;
  weeklyPattern: number[]; // 0-6 (Sun-Sat), 0-1 availability score
  monthlyTrends: number[]; // 0-11 (Jan-Dec), booking frequency
  seasonalFactors: {
    peak: string[];
    low: string[];
  };
  bookingLead: number; // Average days between booking and event
  responseTime: number; // Average hours to respond
}

export interface PredictedAvailability {
  date: Date;
  probability: number;
  confidence: number;
  factors: string[];
  alternativeDates: Date[];
}

// Mock historical booking data for ML model
const BOOKING_PATTERNS: { [photographerId: string]: AvailabilityPattern } = {
  'photographer1': {
    photographerId: 'photographer1',
    weeklyPattern: [0.3, 0.8, 0.9, 0.9, 0.9, 0.2, 0.1], // Less available weekends
    monthlyTrends: [0.6, 0.7, 0.8, 0.9, 1.0, 1.0, 0.9, 0.8, 0.9, 0.8, 0.7, 0.5], // Wedding season
    seasonalFactors: { peak: ['May', 'June', 'July', 'August', 'September'], low: ['January', 'February'] },
    bookingLead: 45,
    responseTime: 4
  },
  'photographer2': {
    photographerId: 'photographer2',
    weeklyPattern: [0.7, 0.9, 0.9, 0.9, 0.8, 0.6, 0.4], // Portrait photographer
    monthlyTrends: [0.8, 0.8, 0.9, 1.0, 0.9, 0.7, 0.6, 0.7, 0.8, 0.9, 0.9, 0.8],
    seasonalFactors: { peak: ['March', 'April', 'October', 'November'], low: ['July', 'August'] },
    bookingLead: 21,
    responseTime: 2
  }
};

export const predictAvailability = (
  photographerId: string,
  requestedDate: Date,
  eventType: string = 'wedding'
): PredictedAvailability => {
  const pattern = BOOKING_PATTERNS[photographerId] || BOOKING_PATTERNS['photographer1'];
  const dayOfWeek = requestedDate.getDay();
  const month = requestedDate.getMonth();
  const daysFromNow = Math.ceil((requestedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  let probability = 0.5; // Base probability
  const factors: string[] = [];
  
  // Day of week factor
  const dayAvailability = pattern.weeklyPattern[dayOfWeek];
  probability *= dayAvailability;
  if (dayAvailability < 0.3) {
    factors.push('Typically busy on this day of week');
  } else if (dayAvailability > 0.8) {
    factors.push('Usually available on this day');
  }
  
  // Seasonal factor
  const monthlyTrend = pattern.monthlyTrends[month];
  probability *= monthlyTrend;
  const monthName = new Date(2024, month).toLocaleString('default', { month: 'long' });
  if (pattern.seasonalFactors.peak.includes(monthName)) {
    factors.push('Peak season - high demand');
  } else if (pattern.seasonalFactors.low.includes(monthName)) {
    factors.push('Off-season - better availability');
  }
  
  // Lead time factor
  const leadTimeFactor = Math.min(1, daysFromNow / pattern.bookingLead);
  probability *= (0.5 + leadTimeFactor * 0.5);
  if (daysFromNow < 14) {
    factors.push('Short notice booking');
  } else if (daysFromNow > 90) {
    factors.push('Advance booking - good availability');
  }
  
  // Event type adjustment
  if (eventType === 'wedding' && dayOfWeek === 6) { // Saturday wedding
    probability *= 0.7; // Saturdays are popular for weddings
    factors.push('Saturday wedding - high demand');
  }
  
  // Confidence calculation
  const confidence = Math.min(0.95, 0.6 + (factors.length * 0.1));
  
  // Generate alternative dates
  const alternativeDates = generateAlternativeDates(requestedDate, pattern);
  
  return {
    date: requestedDate,
    probability: Math.max(0.05, Math.min(0.95, probability)),
    confidence,
    factors,
    alternativeDates
  };
};

const generateAlternativeDates = (requestedDate: Date, pattern: AvailabilityPattern): Date[] => {
  const alternatives: Date[] = [];
  const baseDate = new Date(requestedDate);
  
  // Check nearby dates with better availability
  for (let i = -7; i <= 7; i++) {
    if (i === 0) continue; // Skip requested date
    
    const altDate = new Date(baseDate);
    altDate.setDate(baseDate.getDate() + i);
    
    const dayOfWeek = altDate.getDay();
    const availability = pattern.weeklyPattern[dayOfWeek];
    
    if (availability > 0.7) {
      alternatives.push(altDate);
    }
  }
  
  return alternatives.slice(0, 3); // Return top 3 alternatives
};

export const forecastPhotographerSchedule = (
  photographerId: string,
  daysAhead: number = 30
): { date: Date; availability: number; bookingProbability: number }[] => {
  const pattern = BOOKING_PATTERNS[photographerId] || BOOKING_PATTERNS['photographer1'];
  const forecast = [];
  
  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const prediction = predictAvailability(photographerId, date);
    const bookingProbability = 1 - prediction.probability; // Inverse of availability
    
    forecast.push({
      date,
      availability: prediction.probability,
      bookingProbability
    });
  }
  
  return forecast;
};

export const optimizeBookingTiming = (
  photographerId: string,
  preferredDate: Date,
  flexibility: number = 7 // days
): {
  recommendedDate: Date;
  availabilityScore: number;
  savings: number;
  reason: string;
} => {
  const baseDate = new Date(preferredDate);
  let bestOption = {
    date: baseDate,
    score: 0,
    savings: 0,
    reason: 'Original date'
  };
  
  // Check dates within flexibility range
  for (let i = -flexibility; i <= flexibility; i++) {
    const testDate = new Date(baseDate);
    testDate.setDate(baseDate.getDate() + i);
    
    const prediction = predictAvailability(photographerId, testDate);
    
    // Calculate score (availability + pricing benefits)
    let score = prediction.probability;
    let savings = 0;
    let reason = 'Better availability';
    
    // Weekend vs weekday pricing
    const dayOfWeek = testDate.getDay();
    if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Monday-Thursday
      savings = 0.15; // 15% weekday discount
      reason = 'Weekday discount available';
      score += 0.2;
    }
    
    // Off-season benefits
    const month = testDate.getMonth();
    if ([0, 1, 11].includes(month)) { // Jan, Feb, Dec
      savings += 0.1; // Additional 10% off-season discount
      reason = 'Off-season pricing';
      score += 0.15;
    }
    
    if (score > bestOption.score) {
      bestOption = {
        date: testDate,
        score,
        savings,
        reason
      };
    }
  }
  
  return {
    recommendedDate: bestOption.date,
    availabilityScore: bestOption.score,
    savings: bestOption.savings,
    reason: bestOption.reason
  };
};

export const getPhotographerWorkload = (photographerId: string): {
  currentLoad: 'low' | 'medium' | 'high';
  nextAvailableDate: Date;
  busyPeriods: { start: Date; end: Date; reason: string }[];
  responseTimeEstimate: number;
} => {
  const pattern = BOOKING_PATTERNS[photographerId] || BOOKING_PATTERNS['photographer1'];
  const forecast = forecastPhotographerSchedule(photographerId, 60);
  
  // Calculate current workload
  const next14Days = forecast.slice(0, 14);
  const avgAvailability = next14Days.reduce((sum, day) => sum + day.availability, 0) / 14;
  
  let currentLoad: 'low' | 'medium' | 'high';
  if (avgAvailability > 0.7) currentLoad = 'low';
  else if (avgAvailability > 0.4) currentLoad = 'medium';
  else currentLoad = 'high';
  
  // Find next available date
  const nextAvailable = forecast.find(day => day.availability > 0.8);
  const nextAvailableDate = nextAvailable ? nextAvailable.date : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  // Identify busy periods
  const busyPeriods = [];
  let busyStart = null;
  
  forecast.forEach(day => {
    if (day.availability < 0.3) {
      if (!busyStart) busyStart = day.date;
    } else {
      if (busyStart) {
        busyPeriods.push({
          start: busyStart,
          end: day.date,
          reason: 'High booking demand'
        });
        busyStart = null;
      }
    }
  });
  
  // Adjust response time based on workload
  const responseTimeEstimate = pattern.responseTime * (currentLoad === 'high' ? 2 : currentLoad === 'medium' ? 1.5 : 1);
  
  return {
    currentLoad,
    nextAvailableDate,
    busyPeriods,
    responseTimeEstimate
  };
};

export default {
  predictAvailability,
  forecastPhotographerSchedule,
  optimizeBookingTiming,
  getPhotographerWorkload
};