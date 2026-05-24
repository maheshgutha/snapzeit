// AI-Powered Matching System for Smart Photographer Recommendations
export interface UserPreferences {
  budget: number;
  location: string;
  style: string[];
  eventType: string;
  date: Date;
  duration: number;
  guestCount?: number;
  previousBookings?: string[];
}

export interface PhotographerProfile {
  id: string;
  name: string;
  rating: number;
  price: number;
  location: string;
  styles: string[];
  availability: Date[];
  experience: number;
  reviewCount: number;
  specialties: string[];
  responseTime: number;
  completionRate: number;
}

export interface MatchScore {
  photographerId: string;
  score: number;
  reasons: string[];
  confidence: 'high' | 'medium' | 'low';
  priceMatch: number;
  styleMatch: number;
  locationMatch: number;
  availabilityMatch: number;
}

// AI Matching Algorithm
export const calculateMatchScore = (
  user: UserPreferences,
  photographer: PhotographerProfile
): MatchScore => {
  let totalScore = 0;
  const reasons: string[] = [];
  
  // Price compatibility (30% weight)
  const priceMatch = Math.max(0, 100 - Math.abs(photographer.price - user.budget) / user.budget * 100);
  totalScore += priceMatch * 0.3;
  if (priceMatch > 80) reasons.push('Perfect price match');
  
  // Style compatibility (25% weight)
  const styleOverlap = user.style.filter(s => photographer.styles.includes(s)).length;
  const styleMatch = (styleOverlap / user.style.length) * 100;
  totalScore += styleMatch * 0.25;
  if (styleMatch > 70) reasons.push('Matching photography style');
  
  // Location proximity (20% weight)
  const locationMatch = photographer.location === user.location ? 100 : 
                       photographer.location.includes(user.location.split(',')[0]) ? 80 : 50;
  totalScore += locationMatch * 0.2;
  if (locationMatch === 100) reasons.push('Same location');
  
  // Availability (15% weight)
  const availabilityMatch = photographer.availability.some(date => 
    Math.abs(date.getTime() - user.date.getTime()) < 7 * 24 * 60 * 60 * 1000
  ) ? 100 : 0;
  totalScore += availabilityMatch * 0.15;
  if (availabilityMatch === 100) reasons.push('Available on your date');
  
  // Quality metrics (10% weight)
  const qualityScore = (photographer.rating * 20) + 
                      Math.min(photographer.experience * 5, 50) + 
                      Math.min(photographer.completionRate, 30);
  totalScore += qualityScore * 0.1;
  if (photographer.rating >= 4.8) reasons.push('Highly rated photographer');
  
  const confidence = totalScore >= 80 ? 'high' : totalScore >= 60 ? 'medium' : 'low';
  
  return {
    photographerId: photographer.id,
    score: Math.round(totalScore),
    reasons,
    confidence,
    priceMatch: Math.round(priceMatch),
    styleMatch: Math.round(styleMatch),
    locationMatch: Math.round(locationMatch),
    availabilityMatch: Math.round(availabilityMatch)
  };
};

// Smart Recommendations Engine
export const getSmartRecommendations = async (
  userPreferences: UserPreferences,
  photographers: PhotographerProfile[]
): Promise<MatchScore[]> => {
  // Calculate match scores for all photographers
  const matches = photographers.map(photographer => 
    calculateMatchScore(userPreferences, photographer)
  );
  
  // Sort by score and apply ML-based ranking adjustments
  const rankedMatches = matches
    .sort((a, b) => b.score - a.score)
    .map((match, index) => ({
      ...match,
      // Boost score for photographers with recent bookings
      score: match.score + (photographers.find(p => p.id === match.photographerId)?.responseTime < 2 ? 5 : 0)
    }))
    .slice(0, 10); // Top 10 recommendations
  
  return rankedMatches;
};

// Learning from user interactions
export const updateMatchingModel = (
  userId: string,
  selectedPhotographerId: string,
  userPreferences: UserPreferences,
  satisfaction: number
) => {
  // Store interaction data for ML model improvement
  const interaction = {
    userId,
    selectedPhotographerId,
    preferences: userPreferences,
    satisfaction,
    timestamp: new Date()
  };
  
  // In production, send to ML pipeline
  localStorage.setItem(`interaction_${Date.now()}`, JSON.stringify(interaction));
};

// Personalized recommendations based on history
export const getPersonalizedRecommendations = (
  userId: string,
  currentPreferences: UserPreferences,
  photographers: PhotographerProfile[]
): MatchScore[] => {
  // Get user's booking history
  const history = getUserBookingHistory(userId);
  
  // Adjust preferences based on past behavior
  const adjustedPreferences = {
    ...currentPreferences,
    style: [...currentPreferences.style, ...getPreferredStyles(history)],
    budget: adjustBudgetBasedOnHistory(currentPreferences.budget, history)
  };
  
  return photographers
    .map(photographer => calculateMatchScore(adjustedPreferences, photographer))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

// Helper functions
const getUserBookingHistory = (userId: string) => {
  // Mock function - in production, fetch from database
  return JSON.parse(localStorage.getItem(`user_history_${userId}`) || '[]');
};

const getPreferredStyles = (history: any[]) => {
  const styleFrequency: { [key: string]: number } = {};
  history.forEach(booking => {
    booking.styles?.forEach((style: string) => {
      styleFrequency[style] = (styleFrequency[style] || 0) + 1;
    });
  });
  
  return Object.entries(styleFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([style]) => style);
};

const adjustBudgetBasedOnHistory = (currentBudget: number, history: any[]) => {
  if (history.length === 0) return currentBudget;
  
  const avgPastBudget = history.reduce((sum, booking) => sum + booking.price, 0) / history.length;
  return Math.round((currentBudget + avgPastBudget) / 2);
};

export default {
  calculateMatchScore,
  getSmartRecommendations,
  updateMatchingModel,
  getPersonalizedRecommendations
};