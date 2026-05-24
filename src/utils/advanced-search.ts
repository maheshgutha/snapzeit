import { apiClient } from '@/integrations/api/client';

export interface SearchFilters {
  location?: string;
  category?: string;
  eventType?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'reviews' | 'newest' | 'availability';
  availability?: {
    startDate: Date;
    endDate: Date;
  };
  verificationStatus?: 'all' | 'verified' | 'pending' | 'unverified';
  specializations?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
  pageSize?: number;
  page?: number;
}

export interface PhotographerSearchResult {
  id: string;
  name: string;
  specialty: string;
  location: string;
  pricePerHour: number;
  rating: number;
  reviewCount: number;
  verificationStatus: string;
  availableDates: string[];
  portfolioImages: string[];
  bio: string;
}

/**
 * Advanced search for photographers with multiple filters
 */
export async function searchPhotographers(filters: SearchFilters): Promise<PhotographerSearchResult[]> {
  try {
    let query = apiClient
      .from('photographers')
      .select(
        `
        id,
        name,
        specialty,
        location,
        price_per_hour,
        rating,
        review_count,
        verification_status,
        portfolio_images,
        bio
      `,
        { count: 'exact' }
      )
      .eq('status', 'approved')
      .eq('is_blocked', false);

    // Location filter
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    // Category/Specialty filter
    if (filters.category || filters.eventType) {
      const searchTerm = filters.category || filters.eventType;
      query = query.ilike('specialty', `%${searchTerm}%`);
    }

    // Price range filter
    if (filters.minPrice) {
      query = query.gte('price_per_hour', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price_per_hour', filters.maxPrice);
    }

    // Rating filter
    if (filters.minRating && filters.minRating > 0) {
      query = query.gte('rating', filters.minRating);
    }

    // Verification status filter
    if (filters.verificationStatus && filters.verificationStatus !== 'all') {
      query = query.eq('verification_status', filters.verificationStatus);
    }

    // Specializations filter
    if (filters.specializations && filters.specializations.length > 0) {
      const specialtyFilter = filters.specializations.map(s => `specialty.ilike.%${s}%`).join(',');
      // Note: This is a simplified approach. In production, use proper OR logic
      query = query.ilike('specialty', `%${filters.specializations[0]}%`);
    }

    // Sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          query = query.order('rating', { ascending: false });
          break;
        case 'price_asc':
          query = query.order('price_per_hour', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price_per_hour', { ascending: false });
          break;
        case 'reviews':
          query = query.order('review_count', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('rating', { ascending: false });
      }
    }

    // Pagination
    const pageSize = filters.pageSize || 10;
    const page = filters.page || 1;
    const offset = (page - 1) * pageSize;

    query = query.range(offset, offset + pageSize - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Handle availability filter (requires separate query)
    let results = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      specialty: p.specialty,
      location: p.location,
      pricePerHour: p.price_per_hour,
      rating: p.rating || 0,
      reviewCount: p.review_count || 0,
      verificationStatus: p.verification_status,
      availableDates: [],
      portfolioImages: p.portfolio_images || [],
      bio: p.bio || '',
    }));

    // Filter by availability if provided
    if (filters.availability) {
      results = await filterByAvailability(results, filters.availability);
    }

    return results;
  } catch (error) {
    console.error('Error searching photographers:', error);
    return [];
  }
}

/**
 * Filter photographers by availability
 */
async function filterByAvailability(
  photographers: PhotographerSearchResult[],
  dateRange: { startDate: Date; endDate: Date }
): Promise<PhotographerSearchResult[]> {
  try {
    const availablePhotographers = [];

    for (const photographer of photographers) {
      // Check bookings for this photographer during requested dates
      const { data: bookings } = await supabase
        .from('bookings')
        .select('booking_date')
        .eq('photographer_id', photographer.id)
        .gte('booking_date', dateRange.startDate.toISOString().split('T')[0])
        .lte('booking_date', dateRange.endDate.toISOString().split('T')[0])
        .eq('status', 'confirmed');

      const bookedDates = new Set((bookings || []).map(b => b.booking_date));

      // Get all dates in range
      const allDates = [];
      let currentDate = new Date(dateRange.startDate);
      while (currentDate <= dateRange.endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (!bookedDates.has(dateStr)) {
          allDates.push(dateStr);
        }
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }

      // Only include if some dates are available
      if (allDates.length > 0) {
        photographer.availableDates = allDates;
        availablePhotographers.push(photographer);
      }
    }

    return availablePhotographers;
  } catch (error) {
    console.error('Error filtering by availability:', error);
    return photographers;
  }
}

/**
 * Get photographers by location with distance calculation
 */
export async function searchPhotographersByLocation(
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  filters?: Partial<SearchFilters>
): Promise<PhotographerSearchResult[]> {
  try {
    // Get all photographers (in production, use PostGIS for better distance calculation)
    const baseFilters: SearchFilters = {
      ...filters,
      pageSize: 1000, // Get more results for distance filtering
    };

    let photographers = await searchPhotographers(baseFilters);

    // Filter by distance (simplified - would be better with PostGIS in SQL)
    photographers = photographers.filter(p => {
      // Simple heuristic: if location contains common city name distance is probably ok
      // In production, geocode locations for accurate distance calculation
      return true; // Placeholder
    });

    return photographers;
  } catch (error) {
    console.error('Error searching by location:', error);
    return [];
  }
}

/**
 * Get photographers by category with sub-categories
 */
export async function searchPhotographersByCategory(
  category: string,
  subCategories?: string[]
): Promise<PhotographerSearchResult[]> {
  try {
    const filters: SearchFilters = {
      category,
      specializations: subCategories,
      sortBy: 'rating',
    };

    return await searchPhotographers(filters);
  } catch (error) {
    console.error('Error searching by category:', error);
    return [];
  }
}

/**
 * Get trending photographers (most recently booked)
 */
export async function getTrendingPhotographers(limit: number = 10): Promise<PhotographerSearchResult[]> {
  try {
    // Get most recently booked photographers
    const { data, error } = await supabase
      .from('bookings')
      .select('photographer_id, photographers(id, name, specialty, location, price_per_hour, rating, review_count, verification_status, portfolio_images, bio)')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const uniquePhotographers = new Map();
    (data || []).forEach(booking => {
      const p = (booking.photographers as any);
      if (p && !uniquePhotographers.has(p.id)) {
        uniquePhotographers.set(p.id, {
          id: p.id,
          name: p.name,
          specialty: p.specialty,
          location: p.location,
          pricePerHour: p.price_per_hour,
          rating: p.rating || 0,
          reviewCount: p.review_count || 0,
          verificationStatus: p.verification_status,
          availableDates: [],
          portfolioImages: p.portfolio_images || [],
          bio: p.bio || '',
        });
      }
    });

    return Array.from(uniquePhotographers.values()).slice(0, limit);
  } catch (error) {
    console.error('Error getting trending photographers:', error);
    return [];
  }
}

/**
 * Get top-rated photographers
 */
export async function getTopRatedPhotographers(limit: number = 10): Promise<PhotographerSearchResult[]> {
  try {
    const filters: SearchFilters = {
      minRating: 4,
      sortBy: 'rating',
      pageSize: limit,
    };

    return await searchPhotographers(filters);
  } catch (error) {
    console.error('Error getting top-rated photographers:', error);
    return [];
  }
}

/**
 * Get affordable photographers (budget tier)
 */
export async function getAffordablePhotographers(
  maxPrice: number = 100,
  limit: number = 10
): Promise<PhotographerSearchResult[]> {
  try {
    const filters: SearchFilters = {
      maxPrice,
      sortBy: 'rating',
      pageSize: limit,
    };

    return await searchPhotographers(filters);
  } catch (error) {
    console.error('Error getting affordable photographers:', error);
    return [];
  }
}

/**
 * Export search results as CSV
 */
export function exportSearchResultsAsCSV(results: PhotographerSearchResult[]): string {
  let csv = 'Name,Specialty,Location,Price/Hour,Rating,Reviews,Verification Status\n';

  results.forEach(p => {
    csv += `"${p.name}","${p.specialty}","${p.location}","$${p.pricePerHour}","${p.rating}","${p.reviewCount}","${p.verificationStatus}"\n`;
  });

  return csv;
}

/**
 * Download search results as CSV
 */
export function downloadSearchResults(results: PhotographerSearchResult[]): void {
  const csv = exportSearchResultsAsCSV(results);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `photographer-search-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
