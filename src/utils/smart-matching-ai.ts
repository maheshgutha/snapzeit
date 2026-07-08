import { apiClient, supabase } from '@/integrations/api/client';

export interface MatchingCriteria {
  eventType?: string;
  location?: string;
  budget?: number;
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'any';
  style?: string[];
  requiredSkills?: string[];
  dateRange?: { start: Date; end: Date };
  latitude?: number;
  longitude?: number;
}

export interface PhotographerMatch {
  photographerId: string;
  name: string;
  score: number; // 0-100
  matchBreakdown: {
    styleMatch: number;
    locationProximity: number;
    priceAlignment: number;
    experienceLevel: number;
    availabilityScore: number;
    reviewScore: number;
  };
  reason: string;
}

/**
 * Calculate distance between two coordinates in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate style match score based on specialty and requested styles
 */
function calculateStyleMatch(specialty: string, requestedStyles: string[]): number {
  if (!requestedStyles || requestedStyles.length === 0) return 50;
  
  const specialtyLower = specialty.toLowerCase();
  const matches = requestedStyles.filter(style => 
    specialtyLower.includes(style.toLowerCase()) || 
    style.toLowerCase().includes(specialtyLower)
  ).length;
  
  return (matches / requestedStyles.length) * 100;
}

/**
 * Calculate price alignment score
 */
function calculatePriceAlignment(photographerPrice: number, clientBudget?: number): number {
  if (!clientBudget) return 50;
  
  const ratio = photographerPrice / clientBudget;
  
  // Ideal: ratio between 0.8 and 1.2 (client's budget matches photographer's rate)
  if (ratio >= 0.8 && ratio <= 1.2) return 100;
  if (ratio >= 0.6 && ratio <= 1.5) return 80;
  if (ratio >= 0.4 && ratio <= 2.0) return 60;
  
  return Math.max(0, 100 - Math.abs(ratio - 1) * 50);
}

/**
 * Calculate experience level score based on review count and rating
 */
function calculateExperienceScore(
  reviewCount: number,
  rating: number,
  requiredLevel: 'beginner' | 'intermediate' | 'advanced' | 'any' = 'any'
): number {
  // Base score on review count (more reviews = more experienced)
  const experienceScore = Math.min((reviewCount / 50) * 100, 100);
  
  // Adjust based on required level
  switch (requiredLevel) {
    case 'beginner':
      return Math.min(experienceScore, 100);
    case 'intermediate':
      return reviewCount >= 5 ? experienceScore : experienceScore * 0.7;
    case 'advanced':
      return reviewCount >= 20 ? experienceScore : experienceScore * 0.5;
    case 'any':
    default:
      return experienceScore;
  }
}

/**
 * Calculate availability score based on existing bookings
 */
async function calculateAvailabilityScore(
  photographerId: string,
  dateRange?: { start: Date; end: Date }
): Promise<number> {
  if (!dateRange) return 75;
  
  try {
    const { data: bookings } = await apiClient
      .from('bookings')
      .select('booking_date')
      .eq('photographer_id', photographerId)
      .gte('booking_date', dateRange.start.toISOString().split('T')[0])
      .lte('booking_date', dateRange.end.toISOString().split('T')[0]);
    
    if (!bookings) return 100;
    
    const daysRequested = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const bookingsInRange = bookings.length;
    
    // Fewer bookings = higher availability score
    return Math.max(0, 100 - (bookingsInRange / daysRequested) * 100);
  } catch (error) {
    console.error('Error calculating availability:', error);
    return 50;
  }
}

/**
 * Calculate review score (normalized rating)
 */
function calculateReviewScore(rating: number, reviewCount: number): number {
  // Normalize 1-5 rating to 0-100
  const ratingScore = ((rating - 1) / 4) * 100;
  
  // Weight by number of reviews (more reviews = more trustworthy)
  const trustWeight = Math.min(reviewCount / 10, 1); // Max weight at 10 reviews
  
  return ratingScore * (0.5 + trustWeight * 0.5);
}

/**
 * Main Smart Matching Algorithm
 * Matches clients with photographers based on multiple criteria
 */
export async function smartMatchPhotographers(
  criteria: MatchingCriteria,
  limit: number = 10
): Promise<PhotographerMatch[]> {
  try {
    // Build query based on criteria
    let query = supabase
      .from('photographers')
      .select('*')
      .eq('status', 'approved')
      .eq('is_blocked', false);

    // Filter by event type if provided
    if (criteria.eventType) {
      query = query.ilike('specialty', `%${criteria.eventType}%`);
    }

    // Filter by location if provided
    if (criteria.location) {
      query = query.ilike('location', `%${criteria.location}%`);
    }

    // Price filter with buffer
    if (criteria.budget) {
      const minPrice = criteria.budget * 0.5;
      const maxPrice = criteria.budget * 1.5;
      query = query.gte('price_per_hour', minPrice).lte('price_per_hour', maxPrice);
    }

    const { data: photographers, error } = await query;

    if (error) {
      console.error('Error fetching photographers:', error);
      return [];
    }

    if (!photographers || photographers.length === 0) {
      return [];
    }

    // Calculate match scores for each photographer
    const matches: PhotographerMatch[] = [];

    for (const photographer of photographers) {
      // Calculate individual scores
      const styleMatch = calculateStyleMatch(photographer.specialty, criteria.style || []);
      const priceAlignment = calculatePriceAlignment(photographer.price_per_hour, criteria.budget);
      const experienceScore = calculateExperienceScore(
        photographer.review_count || 0,
        photographer.rating || 3,
        criteria.experience
      );
      const availabilityScore = await calculateAvailabilityScore(photographer.id, criteria.dateRange);
      const reviewScore = calculateReviewScore(photographer.rating || 3, photographer.review_count || 0);

      // Calculate location proximity
      let locationProximity = 50;
      if (criteria.latitude && criteria.longitude && photographer.location) {
        // For now, use a simple distance-based scoring
        // In production, geocode photographer location
        locationProximity = criteria.location && photographer.location.toLowerCase().includes(criteria.location.toLowerCase()) ? 100 : 40;
      }

      // Weighted average of all scores
      const weights = {
        styleMatch: 0.25,
        locationProximity: 0.2,
        priceAlignment: 0.2,
        experienceLevel: 0.15,
        availabilityScore: 0.1,
        reviewScore: 0.1,
      };

      const totalScore =
        styleMatch * weights.styleMatch +
        locationProximity * weights.locationProximity +
        priceAlignment * weights.priceAlignment +
        experienceScore * weights.experienceLevel +
        availabilityScore * weights.availabilityScore +
        reviewScore * weights.reviewScore;

      // Generate human-readable reason
      const reasons = [];
      if (styleMatch > 80) reasons.push('specialty matches your needs');
      if (priceAlignment > 80) reasons.push('price fits your budget');
      if (availabilityScore > 80) reasons.push('available for your dates');
      if (reviewScore > 80) reasons.push('highly rated');

      const reason = reasons.length > 0 ? reasons.join(', ') : 'good overall fit';

      matches.push({
        photographerId: photographer.id,
        name: photographer.name,
        score: Math.round(totalScore),
        matchBreakdown: {
          styleMatch: Math.round(styleMatch),
          locationProximity: Math.round(locationProximity),
          priceAlignment: Math.round(priceAlignment),
          experienceLevel: Math.round(experienceScore),
          availabilityScore: Math.round(availabilityScore),
          reviewScore: Math.round(reviewScore),
        },
        reason,
      });
    }

    // Sort by score (highest first) and return top N
    return matches.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error('Error in smart matching:', error);
    return [];
  }
}

/**
 * Get similar photographers based on a given photographer
 */
export async function getSimilarPhotographers(
  photographerId: string,
  limit: number = 5
): Promise<PhotographerMatch[]> {
  try {
    // Get the reference photographer
    const { data: refPhotographer, error: refError } = await supabase
      .from('photographers')
      .select('*')
      .eq('id', photographerId)
      .single();

    if (refError || !refPhotographer) {
      console.error('Error fetching reference photographer:', refError);
      return [];
    }

    // Find photographers with similar specialty and location
    const criteria: MatchingCriteria = {
      eventType: refPhotographer.specialty,
      location: refPhotographer.location,
      style: [refPhotographer.specialty],
    };

    const matches = await smartMatchPhotographers(criteria, limit + 1);

    // Remove the reference photographer from results
    return matches.filter(m => m.photographerId !== photographerId).slice(0, limit);
  } catch (error) {
    console.error('Error getting similar photographers:', error);
    return [];
  }
}

/**
 * Rank photographers by a specific criterion
 */
export async function rankPhotographersByCriterion(
  criterion: 'rating' | 'price' | 'reviews' | 'recent',
  location?: string,
  limit: number = 10
): Promise<PhotographerMatch[]> {
  try {
    let query = supabase
      .from('photographers')
      .select('*')
      .eq('status', 'approved')
      .eq('is_blocked', false);

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    const { data: photographers, error } = await query;

    if (error || !photographers) {
      return [];
    }

    // Sort by criterion
    let sorted = photographers;
    switch (criterion) {
      case 'rating':
        sorted = photographers.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price':
        sorted = photographers.sort((a, b) => a.price_per_hour - b.price_per_hour);
        break;
      case 'reviews':
        sorted = photographers.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'recent':
        sorted = photographers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    // Convert to match format
    return sorted.slice(0, limit).map(p => ({
      photographerId: p.id,
      name: p.name,
      score: criterion === 'rating' ? (p.rating || 3) * 20 : 75,
      matchBreakdown: {
        styleMatch: 50,
        locationProximity: 50,
        priceAlignment: 50,
        experienceLevel: 50,
        availabilityScore: 50,
        reviewScore: calculateReviewScore(p.rating || 3, p.review_count || 0),
      },
      reason: `Top ${criterion} match in area`,
    }));
  } catch (error) {
    console.error('Error ranking photographers:', error);
    return [];
  }
}
