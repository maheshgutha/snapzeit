import { apiClient } from '@/integrations/api/client';

export interface DemandForecast {
  forecastDate: Date;
  predictedBookings: number;
  predictedRevenue: number;
  confidenceScore: number;
  seasonalityFactor: number;
  trendDirection: 'up' | 'stable' | 'down';
  insights: string[];
}

export interface PhotographerAnalytics {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  monthlyTrend: { month: string; bookings: number; revenue: number }[];
  topEventTypes: { type: string; count: number }[];
  topLocations: { location: string; count: number }[];
  customerSatisfaction: number;
  returnCustomerRate: number;
  forecast: DemandForecast;
}

/**
 * Calculate simple moving average for trend analysis
 */
function simpleMovingAverage(values: number[], period: number): number[] {
  const result = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      result.push(values[i]);
    } else {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

/**
 * Calculate seasonality factor (peak vs off-season)
 */
function calculateSeasonalityFactor(month: number): number {
  // Higher in peak wedding season (May-October), lower in winter
  const seasonalityFactors = [0.8, 0.85, 0.9, 1.0, 1.2, 1.3, 1.2, 1.15, 0.95, 0.85, 0.8, 0.85];
  return seasonalityFactors[month] || 1.0;
}

/**
 * Generate demand forecast for a photographer
 */
export async function generateDemandForecast(
  photographerId: string,
  forecastDays: number = 90
): Promise<DemandForecast> {
  try {
    // Get historical booking data
    const { data: bookings } = await apiClient
      .from('bookings')
      .select('booking_date, total_amount')
      .eq('photographer_id', photographerId)
      .eq('status', 'completed')
      .order('booking_date', { ascending: false })
      .limit(365); // Get last year of data

    if (!bookings || bookings.length === 0) {
      return {
        forecastDate: new Date(),
        predictedBookings: 0,
        predictedRevenue: 0,
        confidenceScore: 0.3,
        seasonalityFactor: 1.0,
        trendDirection: 'stable',
        insights: ['Insufficient historical data for accurate forecast'],
      };
    }

    // Analyze booking frequency (bookings per week)
    const weeklyBookings = Array(52).fill(0);
    bookings.forEach(booking => {
      const date = new Date(booking.booking_date);
      const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      weeklyBookings[week]++;
    });

    // Calculate moving averages for trend
    const avgBookings = bookings.length / 52; // Average bookings per week
    const movingAvg = simpleMovingAverage(weeklyBookings, 4); // 4-week moving average
    const recentAvg = movingAvg.slice(-4).reduce((a, b) => a + b, 0) / 4;

    // Determine trend
    const lastMonth = movingAvg.slice(-4);
    const prevMonth = movingAvg.slice(-8, -4);
    const lastAvg = lastMonth.reduce((a, b) => a + b, 0) / 4;
    const prevAvg = prevMonth.reduce((a, b) => a + b, 0) / 4;

    let trendDirection: 'up' | 'stable' | 'down' = 'stable';
    if (lastAvg > prevAvg * 1.1) trendDirection = 'up';
    if (lastAvg < prevAvg * 0.9) trendDirection = 'down';

    // Forecast for next 90 days (approximately 13 weeks)
    const forecastWeeks = Math.ceil(forecastDays / 7);
    const currentMonth = new Date().getMonth();
    const seasonalityFactor = calculateSeasonalityFactor(currentMonth);

    const predictedBookings = Math.round(recentAvg * forecastWeeks * seasonalityFactor);

    // Calculate average revenue per booking
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const avgRevenuePerBooking = totalRevenue / bookings.length;

    const predictedRevenue = predictedBookings * avgRevenuePerBooking;

    // Confidence score based on data consistency
    const variance = Math.std(...weeklyBookings);
    const confidenceScore = Math.max(0.5, Math.min(1.0, 1 - variance / (avgBookings * 2)));

    // Generate insights
    const insights: string[] = [];

    if (trendDirection === 'up') {
      insights.push('📈 Booking demand is increasing! Consider adjusting availability.');
    } else if (trendDirection === 'down') {
      insights.push('📉 Booking demand is declining. Consider promotions or new marketing.');
    } else {
      insights.push('📊 Booking demand is stable. Maintain current marketing efforts.');
    }

    if (seasonalityFactor > 1.1) {
      insights.push('🎉 Peak season approaching! Prepare for high demand.');
    } else if (seasonalityFactor < 0.9) {
      insights.push('❄️ Off-season period. Consider offering discounts to attract bookings.');
    }

    if (predictedBookings > recentAvg * forecastWeeks) {
      insights.push('💡 Seasonality suggests strong demand in your event category.');
    }

    insights.push(`Your predicted monthly booking rate: ${Math.round(predictedBookings / (forecastDays / 30))} bookings/month`);

    return {
      forecastDate: new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000),
      predictedBookings,
      predictedRevenue: Math.round(predictedRevenue * 100) / 100,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      seasonalityFactor,
      trendDirection,
      insights,
    };
  } catch (error) {
    console.error('Error generating demand forecast:', error);
    return {
      forecastDate: new Date(),
      predictedBookings: 0,
      predictedRevenue: 0,
      confidenceScore: 0,
      seasonalityFactor: 1.0,
      trendDirection: 'stable',
      insights: ['Error calculating forecast'],
    };
  }
}

/**
 * Get comprehensive photographer analytics
 */
export async function getPhotographerAnalytics(
  photographerId: string
): Promise<PhotographerAnalytics> {
  try {
    // Get all completed bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('booking_date, total_amount, event_type, location')
      .eq('photographer_id', photographerId)
      .eq('status', 'completed');

    if (!bookings || bookings.length === 0) {
      const forecast = await generateDemandForecast(photographerId);
      return {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        monthlyTrend: [],
        topEventTypes: [],
        topLocations: [],
        customerSatisfaction: 0,
        returnCustomerRate: 0,
        forecast,
      };
    }

    // Calculate basic metrics
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
    const averageBookingValue = totalRevenue / bookings.length;

    // Monthly trend
    const monthlyData: Record<string, { bookings: number; revenue: number }> = {};
    bookings.forEach(b => {
      const month = new Date(b.booking_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { bookings: 0, revenue: 0 };
      }
      monthlyData[month].bookings++;
      monthlyData[month].revenue += b.total_amount || 0;
    });

    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        bookings: data.bookings,
        revenue: Math.round(data.revenue * 100) / 100,
      }))
      .slice(-12); // Last 12 months

    // Top event types
    const eventTypeCount: Record<string, number> = {};
    bookings.forEach(b => {
      eventTypeCount[b.event_type] = (eventTypeCount[b.event_type] || 0) + 1;
    });

    const topEventTypes = Object.entries(eventTypeCount)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top locations
    const locationCount: Record<string, number> = {};
    bookings.forEach(b => {
      locationCount[b.location] = (locationCount[b.location] || 0) + 1;
    });

    const topLocations = Object.entries(locationCount)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Customer satisfaction (from reviews)
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('photographer_id', photographerId)
      .eq('moderation_status', 'approved');

    const customerSatisfaction = reviews && reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 20) // Convert to 0-100
      : 0;

    // Return customer rate (customers who booked more than once)
    const { data: repeatCustomers } = await supabase
      .from('bookings')
      .select('user_id')
      .eq('photographer_id', photographerId)
      .eq('status', 'completed');

    const userIds = repeatCustomers?.map(b => b.user_id) || [];
    const uniqueCustomers = new Set(userIds).size;
    const returnCustomerRate = uniqueCustomers > 0 ? ((userIds.length - uniqueCustomers) / userIds.length) * 100 : 0;

    // Generate forecast
    const forecast = await generateDemandForecast(photographerId);

    return {
      totalBookings: bookings.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageBookingValue: Math.round(averageBookingValue * 100) / 100,
      monthlyTrend,
      topEventTypes,
      topLocations,
      customerSatisfaction: Math.round(customerSatisfaction),
      returnCustomerRate: Math.round(returnCustomerRate),
      forecast,
    };
  } catch (error) {
    console.error('Error getting photographer analytics:', error);
    return {
      totalBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      monthlyTrend: [],
      topEventTypes: [],
      topLocations: [],
      customerSatisfaction: 0,
      returnCustomerRate: 0,
      forecast: {
        forecastDate: new Date(),
        predictedBookings: 0,
        predictedRevenue: 0,
        confidenceScore: 0,
        seasonalityFactor: 1,
        trendDirection: 'stable',
        insights: ['Error loading analytics'],
      },
    };
  }
}

/**
 * Get revenue insights and recommendations
 */
export async function getRevenueInsights(
  photographerId: string
): Promise<{
  recommendations: string[];
  opportunities: string[];
  warnings: string[];
}> {
  try {
    const analytics = await getPhotographerAnalytics(photographerId);
    const recommendations: string[] = [];
    const opportunities: string[] = [];
    const warnings: string[] = [];

    // Revenue insights
    if (analytics.averageBookingValue < 200) {
      recommendations.push('💰 Consider increasing your rates. Your average booking is below market rate.');
      opportunities.push('Upsell additional packages or services to increase average booking value.');
    }

    if (analytics.totalBookings < 4) {
      warnings.push('⚠️ Limited booking history. More data needed for accurate forecasting.');
      recommendations.push('Focus on marketing to increase visibility and booking volume.');
    }

    // Event type insights
    if (analytics.topEventTypes.length > 0) {
      const mainEventType = analytics.topEventTypes[0].type;
      opportunities.push(`Your strongest category is ${mainEventType}. Consider specializing further.`);
    }

    // Seasonal insights
    if (analytics.forecast.trendDirection === 'up') {
      opportunities.push('📈 Demand is increasing! Adjust availability and pricing accordingly.');
    } else if (analytics.forecast.trendDirection === 'down') {
      recommendations.push('📉 Demand is declining. Consider promotional offers or new service offerings.');
    }

    // Satisfaction insights
    if (analytics.customerSatisfaction > 85) {
      opportunities.push('⭐ You have excellent customer satisfaction! Encourage reviews and referrals.');
    } else if (analytics.customerSatisfaction > 0 && analytics.customerSatisfaction < 70) {
      warnings.push('⚠️ Customer satisfaction is below 70%. Review recent feedback and address issues.');
    }

    // Return customer insights
    if (analytics.returnCustomerRate > 30) {
      opportunities.push('🎁 High return customer rate! Create loyalty programs to maximize repeat bookings.');
    }

    if (opportunities.length === 0) {
      opportunities.push('Continue building your portfolio and customer base.');
    }

    return { recommendations, opportunities, warnings };
  } catch (error) {
    console.error('Error getting revenue insights:', error);
    return {
      recommendations: ['Unable to load recommendations'],
      opportunities: [],
      warnings: [],
    };
  }
}

// Helper function for standard deviation (if not available)
if (!Math.std) {
  (Math as any).std = function(values: number[]): number {
    if (values.length === 0) return 0;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
  };
}
