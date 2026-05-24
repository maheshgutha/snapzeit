import { apiClient } from '@/integrations/api/client';

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  photographerId: string;
  rating: number;
  comment: string;
  reviewerType: 'customer' | 'photographer';
  isModerated: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

/**
 * Customer reviews photographer
 */
export async function reviewPhotographer(
  bookingId: string,
  photographerId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<Review | null> {
  try {
    // Check booking completion
    const { data: booking } = await apiClient
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .single();

    if (booking?.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('user_id', userId)
      .eq('reviewer_type', 'customer')
      .single();

    if (existingReview) {
      throw new Error('You have already reviewed this photographer for this booking');
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([
        {
          booking_id: bookingId,
          user_id: userId,
          photographer_id: photographerId,
          rating,
          comment,
          reviewer_type: 'customer',
          is_moderated: false,
          moderation_status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update photographer rating
    await updatePhotographerRating(photographerId);

    return {
      id: review.id,
      bookingId: review.booking_id,
      userId: review.user_id,
      photographerId: review.photographer_id,
      rating: review.rating,
      comment: review.comment,
      reviewerType: review.reviewer_type,
      isModerated: review.is_moderated,
      moderationStatus: review.moderation_status,
      createdAt: new Date(review.created_at),
    };
  } catch (error) {
    console.error('Error creating review:', error);
    return null;
  }
}

/**
 * Photographer reviews customer (NEW: Bidirectional)
 */
export async function reviewCustomer(
  bookingId: string,
  customerId: string,
  photographerId: string,
  userId: string, // The photographer ID from auth
  rating: number,
  comment: string
): Promise<Review | null> {
  try {
    // Check booking completion
    const { data: booking } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .single();

    if (booking?.status !== 'completed') {
      throw new Error('Can only review completed bookings');
    }

    // Check if photographer review of customer already exists
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .eq('user_id', userId)
      .eq('reviewer_type', 'photographer')
      .single();

    if (existingReview) {
      throw new Error('You have already reviewed this customer for this booking');
    }

    // Create photographer's review of customer
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([
        {
          booking_id: bookingId,
          user_id: userId, // The photographer
          photographer_id: photographerId,
          rating,
          comment,
          reviewer_type: 'photographer',
          photographer_review_of_customer: true,
          is_moderated: false,
          moderation_status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: review.id,
      bookingId: review.booking_id,
      userId: review.user_id,
      photographerId: review.photographer_id,
      rating: review.rating,
      comment: review.comment,
      reviewerType: review.reviewer_type,
      isModerated: review.is_moderated,
      moderationStatus: review.moderation_status,
      createdAt: new Date(review.created_at),
    };
  } catch (error) {
    console.error('Error creating customer review:', error);
    return null;
  }
}

/**
 * Update photographer's overall rating based on all reviews
 */
async function updatePhotographerRating(photographerId: string): Promise<void> {
  try {
    // Get all approved reviews for this photographer (customer reviews only)
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('photographer_id', photographerId)
      .eq('reviewer_type', 'customer')
      .eq('moderation_status', 'approved');

    if (!reviews || reviews.length === 0) {
      return;
    }

    // Calculate average rating
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update photographer
    await supabase
      .from('photographers')
      .update({
        rating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
        review_count: reviews.length,
      })
      .eq('id', photographerId);
  } catch (error) {
    console.error('Error updating photographer rating:', error);
  }
}

/**
 * Get reviews for a photographer
 */
export async function getPhotographerReviews(
  photographerId: string,
  onlyApproved: boolean = true
): Promise<Review[]> {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('photographer_id', photographerId)
      .eq('reviewer_type', 'customer')
      .order('created_at', { ascending: false });

    if (onlyApproved) {
      query = query.eq('moderation_status', 'approved');
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      bookingId: r.booking_id,
      userId: r.user_id,
      photographerId: r.photographer_id,
      rating: r.rating,
      comment: r.comment,
      reviewerType: r.reviewer_type,
      isModerated: r.is_moderated,
      moderationStatus: r.moderation_status,
      createdAt: new Date(r.created_at),
    }));
  } catch (error) {
    console.error('Error fetching photographer reviews:', error);
    return [];
  }
}

/**
 * Get customer reviews of a photographer
 */
export async function getCustomerReviewsOfPhotographer(
  photographerId: string
): Promise<Review[]> {
  return getPhotographerReviews(photographerId, true);
}

/**
 * Get photographer reviews of customers (NEW: Bidirectional)
 */
export async function getPhotographerReviewsOfCustomers(
  photographerId: string,
  onlyApproved: boolean = true
): Promise<Review[]> {
  try {
    let query = supabase
      .from('reviews')
      .select('*')
      .eq('photographer_id', photographerId)
      .eq('reviewer_type', 'photographer')
      .eq('photographer_review_of_customer', true)
      .order('created_at', { ascending: false });

    if (onlyApproved) {
      query = query.eq('moderation_status', 'approved');
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      bookingId: r.booking_id,
      userId: r.user_id,
      photographerId: r.photographer_id,
      rating: r.rating,
      comment: r.comment,
      reviewerType: r.reviewer_type,
      isModerated: r.is_moderated,
      moderationStatus: r.moderation_status,
      createdAt: new Date(r.created_at),
    }));
  } catch (error) {
    console.error('Error fetching photographer reviews of customers:', error);
    return [];
  }
}

/**
 * Moderate review (Admin only)
 */
export async function moderateReview(
  reviewId: string,
  approved: boolean,
  notes?: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reviews')
      .update({
        is_moderated: true,
        moderation_status: approved ? 'approved' : 'rejected',
      })
      .eq('id', reviewId);

    if (error) throw error;

    // If approved, update photographer rating
    if (approved) {
      const { data: review } = await supabase
        .from('reviews')
        .select('photographer_id')
        .eq('id', reviewId)
        .single();

      if (review) {
        await updatePhotographerRating(review.photographer_id);
      }
    }

    return true;
  } catch (error) {
    console.error('Error moderating review:', error);
    return false;
  }
}

/**
 * Get pending reviews for moderation
 */
export async function getPendingReviewsForModeration(
  limit: number = 20
): Promise<Review[]> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('moderation_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      bookingId: r.booking_id,
      userId: r.user_id,
      photographerId: r.photographer_id,
      rating: r.rating,
      comment: r.comment,
      reviewerType: r.reviewer_type,
      isModerated: r.is_moderated,
      moderationStatus: r.moderation_status,
      createdAt: new Date(r.created_at),
    }));
  } catch (error) {
    console.error('Error fetching pending reviews:', error);
    return [];
  }
}

/**
 * Calculate review statistics for a photographer
 */
export async function getPhotographerReviewStats(
  photographerId: string
): Promise<{
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
  sentimentScore: number;
}> {
  try {
    const reviews = await getPhotographerReviews(photographerId, true);

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach(r => {
      totalRating += r.rating;
      ratingDistribution[r.rating]++;
    });

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Simple sentiment score based on comment sentiment (would use ML in production)
    const sentimentScore = averageRating * 20; // Convert to 0-100 scale

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews: reviews.length,
      ratingDistribution,
      sentimentScore: Math.round(sentimentScore),
    };
  } catch (error) {
    console.error('Error calculating review stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      sentimentScore: 0,
    };
  }
}
