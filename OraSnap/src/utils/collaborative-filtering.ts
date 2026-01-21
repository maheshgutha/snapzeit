// Collaborative Filtering for "Users like you also booked" recommendations
export interface UserProfile {
  id: string;
  bookingHistory: string[];
  preferences: {
    style: string[];
    budget: number;
    location: string;
    eventTypes: string[];
  };
  demographics: {
    age?: number;
    location?: string;
    eventFrequency?: number;
  };
}

export interface Recommendation {
  photographerId: string;
  score: number;
  reason: string;
  similarUsers: number;
}

// Mock user data for collaborative filtering
const USER_PROFILES: UserProfile[] = [
  {
    id: 'user1',
    bookingHistory: ['photographer1', 'photographer3', 'photographer5'],
    preferences: { style: ['candid', 'natural'], budget: 2000, location: 'New York', eventTypes: ['wedding'] },
    demographics: { age: 28, location: 'New York', eventFrequency: 2 }
  },
  {
    id: 'user2', 
    bookingHistory: ['photographer1', 'photographer2', 'photographer4'],
    preferences: { style: ['artistic', 'modern'], budget: 1500, location: 'Los Angeles', eventTypes: ['portrait'] },
    demographics: { age: 32, location: 'Los Angeles', eventFrequency: 3 }
  }
];

export const calculateUserSimilarity = (user1: UserProfile, user2: UserProfile): number => {
  let similarity = 0;
  
  // Booking history similarity (Jaccard index)
  const intersection = user1.bookingHistory.filter(p => user2.bookingHistory.includes(p));
  const union = [...new Set([...user1.bookingHistory, ...user2.bookingHistory])];
  const bookingSimilarity = intersection.length / union.length;
  
  // Style preference similarity
  const styleIntersection = user1.preferences.style.filter(s => user2.preferences.style.includes(s));
  const styleUnion = [...new Set([...user1.preferences.style, ...user2.preferences.style])];
  const styleSimilarity = styleIntersection.length / Math.max(styleUnion.length, 1);
  
  // Budget similarity (normalized difference)
  const budgetDiff = Math.abs(user1.preferences.budget - user2.preferences.budget);
  const budgetSimilarity = Math.max(0, 1 - budgetDiff / Math.max(user1.preferences.budget, user2.preferences.budget));
  
  // Location similarity
  const locationSimilarity = user1.preferences.location === user2.preferences.location ? 1 : 0;
  
  // Weighted combination
  similarity = (bookingSimilarity * 0.4) + (styleSimilarity * 0.3) + (budgetSimilarity * 0.2) + (locationSimilarity * 0.1);
  
  return similarity;
};

export const getCollaborativeRecommendations = (
  currentUserId: string,
  currentPreferences: any,
  allPhotographers: any[]
): Recommendation[] => {
  const currentUser: UserProfile = {
    id: currentUserId,
    bookingHistory: JSON.parse(localStorage.getItem(`user_history_${currentUserId}`) || '[]'),
    preferences: {
      style: currentPreferences.style || [],
      budget: currentPreferences.budget || 1000,
      location: currentPreferences.location || '',
      eventTypes: [currentPreferences.eventType || 'portrait']
    },
    demographics: {}
  };
  
  // Find similar users
  const similarUsers = USER_PROFILES
    .map(user => ({
      user,
      similarity: calculateUserSimilarity(currentUser, user)
    }))
    .filter(item => item.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);
  
  // Get photographer recommendations from similar users
  const photographerScores: { [id: string]: { score: number; users: number } } = {};
  
  similarUsers.forEach(({ user, similarity }) => {
    user.bookingHistory.forEach(photographerId => {
      if (!currentUser.bookingHistory.includes(photographerId)) {
        if (!photographerScores[photographerId]) {
          photographerScores[photographerId] = { score: 0, users: 0 };
        }
        photographerScores[photographerId].score += similarity;
        photographerScores[photographerId].users += 1;
      }
    });
  });
  
  // Convert to recommendations
  const recommendations: Recommendation[] = Object.entries(photographerScores)
    .map(([photographerId, data]) => ({
      photographerId,
      score: data.score / data.users, // Average similarity score
      reason: `${data.users} similar users also booked this photographer`,
      similarUsers: data.users
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  
  return recommendations;
};

export const getItemBasedRecommendations = (
  photographerId: string,
  allBookings: any[]
): string[] => {
  // Find photographers frequently booked together
  const coBookings: { [id: string]: number } = {};
  
  allBookings.forEach(booking => {
    if (booking.photographerId === photographerId) {
      // Find other photographers this user has booked
      const userBookings = allBookings.filter(b => b.userId === booking.userId && b.photographerId !== photographerId);
      userBookings.forEach(otherBooking => {
        coBookings[otherBooking.photographerId] = (coBookings[otherBooking.photographerId] || 0) + 1;
      });
    }
  });
  
  return Object.entries(coBookings)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([id]) => id);
};

export const updateUserProfile = (userId: string, booking: any) => {
  const history = JSON.parse(localStorage.getItem(`user_history_${userId}`) || '[]');
  history.push({
    photographerId: booking.photographerId,
    style: booking.style,
    eventType: booking.eventType,
    budget: booking.price,
    timestamp: new Date()
  });
  localStorage.setItem(`user_history_${userId}`, JSON.stringify(history));
};

export default {
  calculateUserSimilarity,
  getCollaborativeRecommendations,
  getItemBasedRecommendations,
  updateUserProfile
};