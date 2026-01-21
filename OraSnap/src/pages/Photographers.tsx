import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import PhotographerCard from '@/components/PhotographerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Search, SlidersHorizontal, X, MapPin, CalendarIcon, Camera, Globe, Filter, Users, Star, Award, Heart, MessageCircle, Clock } from 'lucide-react';
import { COUNTRIES } from '@/lib/currency';
import { updatePageSEO, seoData } from '@/utils/seo';
import { detectUserCountry, updateInternationalSEO, generateCountrySEO, formatPrice } from '@/utils/international-seo';
import Breadcrumb from '@/components/Breadcrumb';

interface Photographer {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio: string | null;
  price_per_hour: number;
  experience_years: number;
  rating: number;
  review_count: number;
  avatar_url: string | null;
  portfolio: string[];
  tags: string[];
  currency?: string;
  country?: string;
}

const SPECIALTIES = [
  'Wedding', 'Portrait', 'Event', 'Commercial', 'Fashion', 'Sports', 'Product', 'Food',
  'Maternity', 'Newborn', 'Family', 'Corporate', 'Travel', 'Architecture'
];

const STYLE_TAGS = [
  'Natural Light', 'Studio', 'Outdoor', 'Candid', 'Editorial', 'Documentary',
  'Fine Art', 'Vintage', 'Modern', 'Minimalist', 'Dramatic', 'Lifestyle',
  'Black & White', 'Cinematic', 'Creative', 'Traditional'
];

// Filter presets for quick access
const FILTER_PRESETS = [
  { name: 'Wedding Photographers', specialty: 'Wedding', icon: '💒' },
  { name: 'Portrait Specialists', specialty: 'Portrait', icon: '👤' },
  { name: 'Budget Friendly', priceMax: 100, icon: '💰' },
  { name: 'Premium Photographers', priceMin: 200, icon: '⭐' },
];

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Get unique countries from the COUNTRIES list
const COUNTRY_OPTIONS = COUNTRIES.filter(c => c.code !== 'OTHER').map(c => c.name);

export default function Photographers() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [allPhotographers, setAllPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') || '');
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [sortBy, setSortBy] = useState('rating');
  const [currency, setCurrency] = useState('USD');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Debounced search
  const debouncedSearch = useDebounce(search, 300);

  // Country to currency mapping
  const countryCurrencyMap: { [key: string]: string } = {
    'Afghanistan': 'AFN', 'Albania': 'ALL', 'Algeria': 'DZD', 'Argentina': 'ARS',
    'Australia': 'AUD', 'Austria': 'EUR', 'Bangladesh': 'BDT', 'Belgium': 'EUR',
    'Brazil': 'BRL', 'Canada': 'CAD', 'Chile': 'CLP', 'China': 'CNY',
    'Colombia': 'COP', 'Czech Republic': 'CZK', 'Denmark': 'DKK', 'Egypt': 'EGP',
    'Finland': 'EUR', 'France': 'EUR', 'Germany': 'EUR', 'Greece': 'EUR',
    'Hungary': 'HUF', 'Iceland': 'ISK', 'India': 'INR', 'Indonesia': 'IDR',
    'Ireland': 'EUR', 'Israel': 'ILS', 'Italy': 'EUR', 'Japan': 'JPY',
    'Malaysia': 'MYR', 'Mexico': 'MXN', 'Netherlands': 'EUR', 'New Zealand': 'NZD',
    'Norway': 'NOK', 'Pakistan': 'PKR', 'Philippines': 'PHP', 'Poland': 'PLN',
    'Portugal': 'EUR', 'Russia': 'RUB', 'Saudi Arabia': 'SAR', 'Singapore': 'SGD',
    'South Africa': 'ZAR', 'South Korea': 'KRW', 'Spain': 'EUR', 'Sweden': 'SEK',
    'Switzerland': 'CHF', 'Thailand': 'THB', 'Turkey': 'TRY', 'Ukraine': 'UAH',
    'United Arab Emirates': 'AED', 'United Kingdom': 'GBP', 'United States': 'USD', 'Vietnam': 'VND'
  };

  // Currency symbols
  const currencySymbols: { [key: string]: string } = {
    'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'AUD': 'A$', 'CAD': 'C$',
    'CHF': 'CHF', 'CNY': '¥', 'INR': '₹', 'BRL': 'R$', 'KRW': '₩', 'SGD': 'S$',
    'HKD': 'HK$', 'SEK': 'kr', 'NOK': 'kr', 'DKK': 'kr', 'PLN': 'zł',
    'CZK': 'Kč', 'HUF': 'Ft', 'RUB': '₽', 'TRY': '₺', 'ZAR': 'R',
    'MXN': '$', 'THB': '฿', 'MYR': 'RM', 'PHP': '₱', 'IDR': 'Rp',
    'VND': '₫', 'PKR': '₨', 'EGP': 'E£', 'SAR': 'SR', 'AED': 'د.إ',
    'ILS': '₪', 'AFN': '؋', 'ALL': 'L', 'DZD': 'د.ج', 'ARS': '$',
    'BDT': '৳', 'CLP': '$', 'COP': '$', 'ISK': 'kr', 'NZD': 'NZ$',
    'UAH': '₴'
  };

  // Get unique countries from photographers data
  const availableCountries = [...new Set(allPhotographers.map(p => p.country).filter(Boolean))] as string[];
  
  // Get unique cities from photographers in the selected country
  const availableCities = [...new Set(
    allPhotographers
      .filter(p => !country || p.country === country)
      .map(p => p.location)
      .filter(Boolean)
  )] as string[];

  const locationFilter = [city, country].filter(Boolean).join(', ');

  const activeFiltersCount = [
    specialty, 
    country, 
    city, 
    priceRange[0] > 0 || (priceRange[1] > 0 && priceRange[1] !== 500), 
    selectedStyle,
    selectedDate
  ].filter(Boolean).length;

  // SEO optimization with international support
  useEffect(() => {
    const userCountry = detectUserCountry();
    const searchQuery = searchParams.get('search');
    const categoryQuery = searchParams.get('category');
    const locationQuery = searchParams.get('location');
    
    let seoConfig = generateCountrySEO(userCountry, 'photographers');
    
    if (searchQuery) {
      seoConfig.title = `${searchQuery} Photographers in ${userCountry.name} | OraSnap`;
      seoConfig.description = `Find professional ${searchQuery} photographers in ${userCountry.name}. Prices in ${userCountry.currency}. Verified profiles, instant booking.`;
    } else if (categoryQuery) {
      seoConfig.title = `${categoryQuery} Photographers in ${userCountry.name} | OraSnap`;
      seoConfig.description = `Book professional ${categoryQuery} photographers in ${userCountry.name}. View portfolios, compare prices in ${userCountry.currency}.`;
    } else if (locationQuery) {
      seoConfig.title = `Photographers in ${locationQuery}, ${userCountry.name} | OraSnap`;
      seoConfig.description = `Find photographers in ${locationQuery}. Professional photography services. Prices in ${userCountry.currency}.`;
    }
    
    updateInternationalSEO({
      ...seoConfig,
      structuredData: {
        ...seoData.photographers.structuredData,
        "areaServed": {
          "@type": "Country",
          "name": userCountry.name
        },
        "currenciesAccepted": userCountry.currency,
        "numberOfItems": photographers.length,
        "mainEntity": photographers.slice(0, 10).map(p => ({
          "@type": "LocalBusiness",
          "name": p.name,
          "description": `Professional ${p.specialty} in ${p.location}`,
          "priceRange": formatPrice(p.price_per_hour, userCountry) + '/hour',
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": p.rating,
            "reviewCount": p.review_count
          }
        }))
      }
    }, userCountry);
  }, [searchParams, photographers]);

  // Fetch all photographers on mount
  useEffect(() => {
    fetchAllPhotographers();
  }, []);

  // Apply filters when any filter changes
  useEffect(() => {
    applyFilters();
  }, [specialty, country, city, priceRange, selectedStyle, selectedDate, sortBy, allPhotographers, debouncedSearch]);

  // Generate search suggestions
  useEffect(() => {
    if (search.length >= 2) {
      const suggestions = [
        ...SPECIALTIES.filter(s => s.toLowerCase().includes(search.toLowerCase())),
        ...allPhotographers
          .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 3)
          .map(p => p.name),
        ...allPhotographers
          .filter(p => p.location.toLowerCase().includes(search.toLowerCase()))
          .slice(0, 3)
          .map(p => p.location)
      ].slice(0, 5);
      setSearchSuggestions([...new Set(suggestions)]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [search, allPhotographers]);

  const fetchAllPhotographers = async () => {
    setLoading(true);
    
    const { data, error } = await supabase.rpc('get_public_photographers');

    if (!error && data) {
      setAllPhotographers(data as Photographer[]);
    }
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...allPhotographers];
      
    if (specialty) {
      filtered = filtered.filter(p => 
        p.specialty.toLowerCase().includes(specialty.toLowerCase())
      );
    }
    
    // Filter by country (using the country field)
    if (country) {
      filtered = filtered.filter(p => p.country === country);
    }
    
    // Filter by city/location
    if (city) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(city.toLowerCase())
      );
    }
    
    // Price range filtering - improved logic
    if (priceRange[0] > 0) {
      filtered = filtered.filter(p => p.price_per_hour >= priceRange[0]);
    }
    if (priceRange[1] < 500) {
      filtered = filtered.filter(p => p.price_per_hour <= priceRange[1]);
    }
    
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.specialty.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower) ||
        p.tags?.some(t => t.toLowerCase().includes(searchLower))
      );
    }
    
    if (selectedStyle) {
      filtered = filtered.filter(p => 
        p.tags?.some(t => t.toLowerCase().includes(selectedStyle.toLowerCase()))
      );
    }

    // Sorting
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_low') {
      filtered.sort((a, b) => a.price_per_hour - b.price_per_hour);
    } else if (sortBy === 'price_high') {
      filtered.sort((a, b) => b.price_per_hour - a.price_per_hour);
    } else if (sortBy === 'experience') {
      filtered.sort((a, b) => b.experience_years - a.experience_years);
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => b.review_count - a.review_count);
    }
    
    setPhotographers(filtered);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Apply filters immediately when search is submitted
    applyFilters();
    
    // Show feedback to user
    if (search.trim()) {
      const resultCount = photographers.length;
      setTimeout(() => {
        if (resultCount === 0) {
          alert(`No results found for "${search}". Try different keywords or adjust your filters.`);
        }
      }, 500);
    }
  };

  const clearFilters = () => {
    setSpecialty('');
    setCountry('');
    setCity('');
    setPriceRange([0, 500]);
    setSelectedStyle('');
    setSelectedDate(undefined);
    setSearch('');
    setSearchParams({});
  };

  const handleCountryChange = (val: string) => {
    const selectedCountry = val === "all" ? "" : val;
    setCountry(selectedCountry);
    setCity('');
    
    // Update currency based on country selection
    if (selectedCountry && countryCurrencyMap[selectedCountry]) {
      setCurrency(countryCurrencyMap[selectedCountry]);
    } else {
      setCurrency('USD'); // Default to USD
    }
  };

  const handleCityChange = (val: string) => {
    setCity(val === "all" ? "" : val);
  };

  const toggleFavorite = (photographerId: string) => {
    setFavorites(prev => 
      prev.includes(photographerId) 
        ? prev.filter(id => id !== photographerId)
        : [...prev, photographerId]
    );
  };

  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    if (preset.specialty) setSpecialty(preset.specialty);
    if (preset.priceMin) setPriceRange([preset.priceMin, priceRange[1]]);
    if (preset.priceMax) setPriceRange([priceRange[0], preset.priceMax]);
  };

  const FiltersContent = () => (
    <div className="space-y-5">
      {/* Date Filter */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Available Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                !selectedDate && "text-gray-500"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Any date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Photography Type */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Photography Type</Label>
        <Select value={specialty || "all"} onValueChange={(val) => setSpecialty(val === "all" ? "" : val)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {SPECIALTIES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Style */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Style</Label>
        <Select value={selectedStyle || "all"} onValueChange={(val) => setSelectedStyle(val === "all" ? "" : val)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All styles" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">All styles</SelectItem>
            {STYLE_TAGS.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Location</Label>
        <Select value={country || "all"} onValueChange={handleCountryChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="all">All countries</SelectItem>
            <SelectItem value="United States">United States</SelectItem>
            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
            <SelectItem value="Germany">Germany</SelectItem>
            <SelectItem value="France">France</SelectItem>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="Japan">Japan</SelectItem>
            <SelectItem value="Brazil">Brazil</SelectItem>
            <SelectItem value="China">China</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Price Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              {currencySymbols[currency] || '$'}
            </span>
            <Input
              type="number"
              min="0"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="pl-6 h-9 text-sm"
              placeholder="Min"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              {currencySymbols[currency] || '$'}
            </span>
            <Input
              type="number"
              min="0"
              value={priceRange[1] === 500 ? '' : priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], e.target.value ? Number(e.target.value) : 500])}
              className="pl-6 h-9 text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters */}
      {activeFiltersCount > 0 && (
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="w-full h-9 text-sm"
        >
          Clear filters ({activeFiltersCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="container">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold mb-4">
              <Camera className="w-4 h-4" />
              <span>Professional Photographers</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Find Your Perfect Photographer
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Browse verified professionals, compare portfolios, and book instantly
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border hover:scale-105 transition-transform">
              <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{allPhotographers.length}+</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Photographers</p>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border hover:scale-105 transition-transform">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">4.9</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Avg Rating</p>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border hover:scale-105 transition-transform">
              <MapPin className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">{availableCountries.length}+</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Countries</p>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border hover:scale-105 transition-transform">
              <Award className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Verified</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Search & Filter Bar - Enhanced */}
        <div className="flex flex-col gap-4 mb-8">
          {/* Filter Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">Quick filters:</span>
            {FILTER_PRESETS.map((preset, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
                className="h-8 text-xs hover:scale-105 transition-all"
              >
                <span className="mr-1">{preset.icon}</span>
                {preset.name}
              </Button>
            ))}
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search photographers, styles, locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                className="pl-12 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mt-2 shadow-lg z-50">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm first:rounded-t-xl last:rounded-b-xl"
                      onClick={() => {
                        setSearch(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </form>

            <div className="flex gap-3">
              {/* Sort Select - Enhanced */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="rating">⭐ {t('photographers.rating')}</SelectItem>
                  <SelectItem value="reviews">💬 {t('photographers.reviews')}</SelectItem>
                  <SelectItem value="price_low">💰 {t('photographers.priceAsc')}</SelectItem>
                  <SelectItem value="price_high">💎 {t('photographers.priceDesc')}</SelectItem>
                  <SelectItem value="experience">🏆 {t('photographers.experience')}</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filters - Enhanced */}
              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 md:hidden relative bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl hover:scale-105 transition-all">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-blue-600 to-purple-600">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-white dark:bg-gray-900">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Active Filters Tags - Enhanced */}
        {(specialty || locationFilter || search || selectedStyle || selectedDate) && (
          <div className="flex flex-wrap gap-2 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100 mr-2">Active filters:</span>
            {search && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 bg-white dark:bg-gray-800 hover:scale-105 transition-all">
                🔍 Search: {search}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSearch('')} />
              </Badge>
            )}
            {selectedDate && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 bg-white dark:bg-gray-800 hover:scale-105 transition-all">
                <CalendarIcon className="h-3 w-3" />
                {format(selectedDate, "MMM d, yyyy")}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedDate(undefined)} />
              </Badge>
            )}
            {specialty && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 bg-white dark:bg-gray-800 hover:scale-105 transition-all">
                📷 {specialty}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSpecialty('')} />
              </Badge>
            )}
            {selectedStyle && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 bg-white dark:bg-gray-800 hover:scale-105 transition-all">
                🎨 {selectedStyle}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedStyle('')} />
              </Badge>
            )}
            {locationFilter && (
              <Badge variant="secondary" className="gap-1 px-3 py-1 bg-white dark:bg-gray-800 hover:scale-105 transition-all">
                <MapPin className="h-3 w-3" />
                {locationFilter}
                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => { setCountry(''); setCity(''); }} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50">
              Clear all
            </Button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-2xl border shadow-lg p-6">
              <h3 className="font-bold mb-6 text-gray-900 dark:text-white text-lg">Filters</h3>
              <FiltersContent />
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-96 rounded-3xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
                ))}
              </div>
            ) : photographers.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">No photographers found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                  Try adjusting your filters or search terms to find more photographers.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" onClick={clearFilters} className="hover:scale-105 transition-all">
                    <X className="h-4 w-4 mr-2" />
                    Clear filters
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all">
                    <Search className="h-4 w-4 mr-2" />
                    Browse all
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Showing <span className="font-semibold text-blue-600">{photographers.length}</span> photographer{photographers.length !== 1 ? 's' : ''}
                      {selectedDate && ` available on ${format(selectedDate, "MMMM d, yyyy")}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Award className="h-4 w-4" />
                      <span>All verified</span>
                    </div>
                    {favorites.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-pink-600">
                        <Heart className="h-4 w-4" />
                        <span>{favorites.length} saved</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {photographers.map(photographer => (
                    <div key={photographer.id} className="relative group">
                      <PhotographerCard photographer={photographer} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Meaningful Footer */}
      <footer className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container">
          {/* Main Footer Content */}
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">OraSnap</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md leading-relaxed">
                The world's largest marketplace for professional photography services. Connect with verified photographers, book instantly, and capture your perfect moments.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">2,500+ Photographers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">4.9 Average Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold">50+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold">100% Verified</span>
                </div>
              </div>
            </div>
            
            {/* For Customers */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">For Customers</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="/" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Search className="h-3 w-3" />Find Photographers</a></li>
                <li><a href="/#match-section" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Clock className="h-3 w-3" />Quick Match</a></li>
                <li><a href="/#hero-section" className="hover:text-blue-600 transition-colors flex items-center gap-2">💰 Pricing Guide</a></li>
                <li><a href="/#testimonials" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Star className="h-3 w-3" />Customer Reviews</a></li>
                <li><a href="/#cta-section" className="hover:text-blue-600 transition-colors flex items-center gap-2">🎧 24/7 Support</a></li>
              </ul>
            </div>
            
            {/* For Photographers */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">For Photographers</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="/auth" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Camera className="h-3 w-3" />Join OraSnap</a></li>
                <li><a href="/auth" className="hover:text-blue-600 transition-colors flex items-center gap-2">📊 Dashboard</a></li>
                <li><a href="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2">💵 View Earnings</a></li>
                <li><a href="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2">📚 Resources</a></li>
                <li><a href="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2">👥 Community</a></li>
              </ul>
            </div>
            
            {/* Popular Categories */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Popular Categories</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="/photographers?category=wedding" className="hover:text-blue-600 transition-colors flex items-center gap-2">💒 Wedding Photography</a></li>
                <li><a href="/photographers?category=portrait" className="hover:text-blue-600 transition-colors flex items-center gap-2">👤 Portrait Photography</a></li>
                <li><a href="/photographers?category=event" className="hover:text-blue-600 transition-colors flex items-center gap-2">🎉 Event Photography</a></li>
                <li><a href="/photographers?specialty=Commercial" className="hover:text-blue-600 transition-colors flex items-center gap-2">🏢 Commercial Photography</a></li>
                <li><a href="/photographers?specialty=Fashion" className="hover:text-blue-600 transition-colors flex items-center gap-2">👗 Fashion Photography</a></li>
              </ul>
            </div>
          </div>
          
          {/* Trust & Security Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-6 w-6 text-green-600" />
                </div>
                <h5 className="font-semibold mb-1">Verified Professionals</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Background checked & portfolio verified</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">🔒</span>
                </div>
                <h5 className="font-semibold mb-1">Secure Payments</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Money held safely until work completed</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <h5 className="font-semibold mb-1">24/7 Support</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Always here to help you succeed</p>
              </div>
            </div>
          </div>
          
          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                © 2024 OraSnap. All rights reserved.
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>Made with</span>
                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                <span>for photographers worldwide</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="/" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Browse Photographers</a>
              <a href="/auth" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Sign In</a>
              <a href="/#hero-section" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">About</a>
              <a href="/#cta-section" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
