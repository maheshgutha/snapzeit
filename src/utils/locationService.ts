interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface PlaceResult {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

class LocationService {
  private static instance: LocationService;
  private cache = new Map<string, any>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  private getCacheKey(query: string, type: string): string {
    return `${type}_${query.toLowerCase()}`;
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  async searchLocations(query: string, limit = 5): Promise<string[]> {
    if (!query || query.length < 2) return [];

    const cacheKey = this.getCacheKey(query, 'search');
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached.timestamp)) {
      return cached.data;
    }

    // Return fallback immediately for better UX
    const fallback = this.getFallbackLocations(query);
    if (fallback.length > 0) {
      this.cache.set(cacheKey, { data: fallback, timestamp: Date.now() });
      return fallback;
    }

    try {
      // Only fetch from API if no fallback found
      const results = await Promise.race([
        this.fetchFromNominatim(query, limit),
        new Promise<string[]>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]);
      
      if (results.length > 0) {
        this.cache.set(cacheKey, { data: results, timestamp: Date.now() });
        return results;
      }
    } catch (error) {
      console.error('Location API timeout or error:', error);
    }

    return fallback;
  }

  private async fetchFromNominatim(query: string, limit: number): Promise<string[]> {
    const url = `https://nominatim.openstreetmap.org/search?` +
      `format=json&q=${encodeURIComponent(query)}&` +
      `addressdetails=1&limit=${limit}&` +
      `accept-language=en&countrycodes=&` +
      `bounded=0&dedupe=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SnapZeiT/1.0 (photography platform)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: LocationResult[] = await response.json();
    
    return data
      .filter(item => item.display_name && item.address)
      .map(item => this.formatLocationName(item))
      .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
      .slice(0, limit);
  }

  private formatLocationName(item: LocationResult): string {
    const { address } = item;
    const parts: string[] = [];

    // Add city/town/village
    const locality = address.city || address.town || address.village;
    if (locality) parts.push(locality);

    // Add state if different from city
    if (address.state && address.state !== locality) {
      parts.push(address.state);
    }

    // Add country
    if (address.country) {
      parts.push(address.country);
    }

    return parts.join(', ');
  }

  private getFallbackLocations(query: string): string[] {
    const fallbackData = [
      'New York, NY, United States', 'Los Angeles, CA, United States', 'Chicago, IL, United States',
      'Houston, TX, United States', 'Phoenix, AZ, United States', 'Philadelphia, PA, United States',
      'San Antonio, TX, United States', 'San Diego, CA, United States', 'Dallas, TX, United States',
      'London, England, United Kingdom', 'Manchester, England, United Kingdom', 'Birmingham, England, United Kingdom',
      'Paris, France', 'Lyon, France', 'Marseille, France', 'Berlin, Germany', 'Munich, Germany', 'Hamburg, Germany',
      'Tokyo, Japan', 'Osaka, Japan', 'Kyoto, Japan', 'Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia',
      'Toronto, Canada', 'Vancouver, Canada', 'Montreal, Canada', 'Mumbai, India', 'Delhi, India', 'Bangalore, India',
      'Dubai, UAE', 'Singapore', 'Hong Kong', 'Barcelona, Spain', 'Madrid, Spain', 'Rome, Italy', 'Milan, Italy',
      'Amsterdam, Netherlands', 'Stockholm, Sweden', 'Copenhagen, Denmark', 'Oslo, Norway', 'Zurich, Switzerland',
      'Vienna, Austria', 'Prague, Czech Republic', 'Warsaw, Poland', 'Budapest, Hungary', 'Athens, Greece',
      'Istanbul, Turkey', 'Moscow, Russia', 'St. Petersburg, Russia', 'Cairo, Egypt', 'Lagos, Nigeria',
      'Johannesburg, South Africa', 'Cape Town, South Africa', 'São Paulo, Brazil', 'Rio de Janeiro, Brazil',
      'Mexico City, Mexico', 'Buenos Aires, Argentina', 'Santiago, Chile', 'Lima, Peru', 'Bogotá, Colombia'
    ];

    const lowerQuery = query.toLowerCase();
    return fallbackData
      .filter(location => location.toLowerCase().includes(lowerQuery))
      .slice(0, 5);
  }

  async getCurrentLocation(): Promise<{ country: string; city: string } | null> {
    try {
      // Try to get user's location via IP
      const response = await fetch('https://ipapi.co/json/', {
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          country: data.country_name || 'United States',
          city: data.city || 'New York'
        };
      }
    } catch (error) {
      // Expected when offline or the geo API is blocked — the default below covers it.
      console.warn('Geolocation unavailable, using default location');
    }

    // Fallback to default
    return { country: 'United States', city: 'New York' };
  }

  getCountries(): Array<{ code: string; name: string; currency: string }> {
    return [
      { code: 'US', name: 'United States', currency: 'USD' },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
      { code: 'CA', name: 'Canada', currency: 'CAD' },
      { code: 'AU', name: 'Australia', currency: 'AUD' },
      { code: 'DE', name: 'Germany', currency: 'EUR' },
      { code: 'FR', name: 'France', currency: 'EUR' },
      { code: 'IT', name: 'Italy', currency: 'EUR' },
      { code: 'ES', name: 'Spain', currency: 'EUR' },
      { code: 'NL', name: 'Netherlands', currency: 'EUR' },
      { code: 'SE', name: 'Sweden', currency: 'SEK' },
      { code: 'NO', name: 'Norway', currency: 'NOK' },
      { code: 'DK', name: 'Denmark', currency: 'DKK' },
      { code: 'CH', name: 'Switzerland', currency: 'CHF' },
      { code: 'JP', name: 'Japan', currency: 'JPY' },
      { code: 'KR', name: 'South Korea', currency: 'KRW' },
      { code: 'CN', name: 'China', currency: 'CNY' },
      { code: 'IN', name: 'India', currency: 'INR' },
      { code: 'SG', name: 'Singapore', currency: 'SGD' },
      { code: 'HK', name: 'Hong Kong', currency: 'HKD' },
      { code: 'AE', name: 'United Arab Emirates', currency: 'AED' },
      { code: 'BR', name: 'Brazil', currency: 'BRL' },
      { code: 'MX', name: 'Mexico', currency: 'MXN' },
      { code: 'AR', name: 'Argentina', currency: 'ARS' },
      { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
      { code: 'EG', name: 'Egypt', currency: 'EGP' },
      { code: 'NG', name: 'Nigeria', currency: 'NGN' },
      { code: 'KE', name: 'Kenya', currency: 'KES' },
      { code: 'RU', name: 'Russia', currency: 'RUB' },
      { code: 'TR', name: 'Turkey', currency: 'TRY' },
      { code: 'SA', name: 'Saudi Arabia', currency: 'SAR' },
    ];
  }

  getCitiesByCountry(countryCode: string): string[] {
    const cityData: Record<string, string[]> = {
      'US': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'],
      'GB': ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff'],
      'CA': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'],
      'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Newcastle', 'Canberra', 'Sunshine Coast', 'Wollongong'],
      'DE': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'],
      'FR': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'],
      'IN': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'],
      'JP': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kawasaki', 'Kyoto', 'Saitama'],
      'CN': ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Hangzhou', 'Wuhan', 'Dongguan', 'Tianjin', 'Suzhou'],
    };

    return cityData[countryCode] || [];
  }
}

export const locationService = LocationService.getInstance();
export default locationService;