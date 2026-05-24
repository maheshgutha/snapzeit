import { useEffect, useState, useRef, Suspense, lazy } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/api/client';
import Header from '@/components/Header';
import PhotographerCard from '@/components/PhotographerCard';
import { PhotographerCardSkeleton } from '@/components/LoadingSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Camera, Calendar, Shield, ArrowRight, Star, Users, CheckCircle, Quote, MapPin, Clock, Award, Zap, Heart, MessageCircle, TrendingUp, Eye, User } from 'lucide-react';
import { updatePageSEO, seoData } from '@/utils/seo';
import { detectUserCountry, updateInternationalSEO, generateCountrySEO, formatPrice, getLocalizedContent } from '@/utils/international-seo';
import { toast } from 'sonner';
import { translatePhotographerProfile } from '@/utils/translation';
import { getCampaignForCountry } from '@/utils/marketing';
import { getSmartRecommendations } from '@/utils/ai-matching';
import { locationService } from '@/utils/locationService';
import FAQ from '@/components/FAQ';
import SmartMatching from '@/components/SmartMatching';
import Footer from '@/components/Footer';

interface LocationResult {
  display_name: string;
  [key: string]: unknown;
}

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

const STYLES = [
  { label: 'Wedding', value: 'Wedding Photography' },
  { label: 'Portrait', value: 'Portrait Photography' },
  { label: 'Event', value: 'Event Photography' },
  { label: 'Commercial', value: 'Commercial Photography' },
  { label: 'Fashion', value: 'Fashion Photography' },
  { label: 'Product', value: 'Product Photography' },
  { label: 'Maternity', value: 'Maternity Photography' },
  { label: 'Newborn', value: 'Newborn Photography' },
  { label: 'Family', value: 'Family Photography' },
  { label: 'Corporate', value: 'Corporate Photography' },
  { label: 'Food', value: 'Food Photography' },
  { label: 'Travel', value: 'Travel Photography' },
];

export default function Index() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // SEO optimization with international support and marketing
  useEffect(() => {
    const userCountry = detectUserCountry();
    const localizedContent = getLocalizedContent(userCountry);
    const marketingCampaign = getCampaignForCountry(userCountry.code);
    const internationalSEO = generateCountrySEO(userCountry, '');

    updateInternationalSEO({
      ...seoData.home,
      title: marketingCampaign.campaigns.hero.title + ` | OraSnap ${userCountry.name}`,
      description: `${marketingCampaign.campaigns.hero.subtitle} Prices in ${userCountry.currency}. ${userCountry.culturalPrefs.join(', ')} photography styles.`,
      keywords: `${internationalSEO.keywords}, ${userCountry.culturalPrefs.join(', ')}, ${userCountry.currency} pricing, ${marketingCampaign.campaigns.cultural.event}`,
      structuredData: {
        ...seoData.home.structuredData,
        "mainEntity": {
          "@type": "Organization",
          "name": "OraSnap",
          "description": "Professional photographer booking platform",
          "url": "https://orasnap.com",
          "logo": "https://orasnap.com/assets/orasnap-logo.png",
          "areaServed": {
            "@type": "Country",
            "name": userCountry.name
          },
          "currenciesAccepted": userCountry.currency,
          "paymentAccepted": userCountry.paymentMethods.join(', '),
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": userCountry.supportPhone,
            "contactType": "customer service",
            "availableLanguage": [userCountry.language]
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "10000",
            "bestRating": "5",
            "worstRating": "1"
          }
        }
      }
    }, userCountry);
  }, []);

  // Match form state
  const [selectedStyle, setSelectedStyle] = useState('Wedding Photography');
  const [eventType, setEventType] = useState('Wedding');
  const [budget, setBudget] = useState(5000);
  const [duration, setDuration] = useState(2);
  const [country, setCountry] = useState('India');
  const [currency, setCurrency] = useState('INR');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const [matchResults, setMatchResults] = useState<Photographer[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [showSmartMatching, setShowSmartMatching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [liveActivity, setLiveActivity] = useState({ bookings: 0, photographers: 0 });
  const [isVisible, setIsVisible] = useState(false);

  // Country to currency mapping
  const countryCurrencyMap: { [key: string]: string } = {
    'Afghanistan': 'AFN', 'Albania': 'ALL', 'Algeria': 'DZD', 'Argentina': 'ARS', 'Armenia': 'AMD',
    'Australia': 'AUD', 'Austria': 'EUR', 'Azerbaijan': 'AZN', 'Bahrain': 'BHD', 'Bangladesh': 'BDT',
    'Belarus': 'BYN', 'Belgium': 'EUR', 'Bolivia': 'BOB', 'Bosnia and Herzegovina': 'BAM', 'Botswana': 'BWP',
    'Brazil': 'BRL', 'Brunei': 'BND', 'Bulgaria': 'BGN', 'Cambodia': 'KHR', 'Canada': 'CAD',
    'Chile': 'CLP', 'China': 'CNY', 'Colombia': 'COP', 'Costa Rica': 'CRC', 'Croatia': 'HRK',
    'Czech Republic': 'CZK', 'Denmark': 'DKK', 'Dominican Republic': 'DOP', 'Ecuador': 'USD', 'Egypt': 'EGP',
    'Estonia': 'EUR', 'Ethiopia': 'ETB', 'Finland': 'EUR', 'France': 'EUR', 'Georgia': 'GEL',
    'Germany': 'EUR', 'Ghana': 'GHS', 'Greece': 'EUR', 'Guatemala': 'GTQ', 'Honduras': 'HNL',
    'Hong Kong': 'HKD', 'Hungary': 'HUF', 'Iceland': 'ISK', 'India': 'INR', 'Indonesia': 'IDR',
    'Iran': 'IRR', 'Iraq': 'IQD', 'Ireland': 'EUR', 'Israel': 'ILS', 'Italy': 'EUR',
    'Jamaica': 'JMD', 'Japan': 'JPY', 'Jordan': 'JOD', 'Kazakhstan': 'KZT', 'Kenya': 'KES',
    'Kuwait': 'KWD', 'Kyrgyzstan': 'KGS', 'Laos': 'LAK', 'Latvia': 'EUR', 'Lebanon': 'LBP',
    'Libya': 'LYD', 'Lithuania': 'EUR', 'Luxembourg': 'EUR', 'Malaysia': 'MYR', 'Mexico': 'MXN',
    'Moldova': 'MDL', 'Mongolia': 'MNT', 'Morocco': 'MAD', 'Myanmar': 'MMK', 'Nepal': 'NPR',
    'Netherlands': 'EUR', 'New Zealand': 'NZD', 'Nicaragua': 'NIO', 'Nigeria': 'NGN', 'North Korea': 'KPW',
    'North Macedonia': 'MKD', 'Norway': 'NOK', 'Oman': 'OMR', 'Pakistan': 'PKR', 'Panama': 'PAB',
    'Paraguay': 'PYG', 'Peru': 'PEN', 'Philippines': 'PHP', 'Poland': 'PLN', 'Portugal': 'EUR',
    'Qatar': 'QAR', 'Romania': 'RON', 'Russia': 'RUB', 'Saudi Arabia': 'SAR', 'Serbia': 'RSD',
    'Singapore': 'SGD', 'Slovakia': 'EUR', 'Slovenia': 'EUR', 'South Africa': 'ZAR', 'South Korea': 'KRW',
    'Spain': 'EUR', 'Sri Lanka': 'LKR', 'Sweden': 'SEK', 'Switzerland': 'CHF', 'Syria': 'SYP',
    'Taiwan': 'TWD', 'Tajikistan': 'TJS', 'Tanzania': 'TZS', 'Thailand': 'THB', 'Tunisia': 'TND',
    'Turkey': 'TRY', 'Turkmenistan': 'TMT', 'Uganda': 'UGX', 'Ukraine': 'UAH', 'United Arab Emirates': 'AED',
    'United Kingdom': 'GBP', 'United States': 'USD', 'Uruguay': 'UYU', 'Uzbekistan': 'UZS', 'Venezuela': 'VES',
    'Vietnam': 'VND', 'Yemen': 'YER', 'Zambia': 'ZMW', 'Zimbabwe': 'ZWL'
  };

  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    const countryData = locationService.getCountries().find(c => c.name === selectedCountry);
    if (countryData) {
      setCurrency(countryData.currency);
    }
  };

  // Initialize user location
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const currentLocation = await locationService.getCurrentLocation();
        if (currentLocation) {
          setCountry(currentLocation.country);
          setLocation(currentLocation.city);
          const selectedCountry = locationService.getCountries().find(c => c.name === currentLocation.country);
          if (selectedCountry) {
            setCurrency(selectedCountry.currency);
          }
        }
      } catch (error) {
        console.error('Failed to initialize location:', error);
      }
    };

    initializeLocation();
  }, []);

  // Live activity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivity(prev => ({
        bookings: Math.floor(Math.random() * 10) + 1,
        photographers: Math.floor(Math.random() * 5) + 2
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Intersection observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    const heroRef = document.getElementById('hero-section');
    if (heroRef) observer.observe(heroRef);
    return () => observer.disconnect();
  }, []);
  // Search suggestions
  const fetchSearchSuggestions = async (query: string) => {
    if (query.length >= 2) {
      const suggestions = ['Wedding Photography', 'Portrait Photography', 'Event Photography', 'Commercial Photography']
        .filter(s => s.toLowerCase().includes(query.toLowerCase()));
      setSearchSuggestions(suggestions);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    fetchSearchSuggestions(value);
  };
  const fetchLocationSuggestions = async (query: string) => {
    setLocationLoading(true);
    try {
      const suggestions = await locationService.searchLocations(query, 5);
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Location search error:', error);
      toast.error('Failed to load location suggestions');
      setLocationSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchLocationSuggestions(value);
      }, 300);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    setLocationSuggestions([]);
    if (locationInputRef.current) {
      locationInputRef.current.blur();
    }
  };

  // Enhanced match search with AI recommendations
  const handleFindMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatchLoading(true);

    try {
      const { data } = await supabase.rpc('get_public_photographers');
      if (data) {
        let filtered = (data as Photographer[]).filter(p => {
          const specialtyMatch = !selectedStyle || p.specialty.toLowerCase().includes(selectedStyle.toLowerCase());
          const countryMatch = !country || p.country?.toLowerCase() === country.toLowerCase();
          const locationMatch = !location || p.location.toLowerCase().includes(location.toLowerCase());
          const totalCost = p.price_per_hour * duration;
          const budgetMatch = totalCost <= budget;
          return specialtyMatch && countryMatch && locationMatch && budgetMatch;
        });

        filtered = filtered.sort((a, b) => b.rating - a.rating);
        setMatchResults(filtered);

        // Show AI matching for better results
        if (filtered.length > 3) {
          setShowSmartMatching(true);
        }

        if (filtered.length > 0) {
          toast.success(`Found ${filtered.length} matches! AI recommendations shown below.`);
        } else {
          toast.error('No photographers found. Try adjusting filters.');
        }
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      toast.error('Failed to find matches. Please try again.');
    } finally {
      setMatchLoading(false);
    }
  };

  useEffect(() => {
    const fetchPhotographers = async () => {
      try {
        const { data, error } = await supabase.rpc('get_public_photographers');
        if (error) {
          console.error('Error fetching photographers:', error);
          toast.error('Failed to load photographers');
          return;
        }
        if (data) {
          const sorted = (data as Photographer[])
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);
          setPhotographers(sorted);
        }
      } catch (error) {
        console.error('Error fetching photographers:', error);
        toast.error('Failed to load photographers');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotographers();
  }, []);

  const features = [
    { icon: Search, titleKey: 'features.browse.title', descKey: 'features.browse.desc' },
    { icon: Calendar, titleKey: 'features.book.title', descKey: 'features.book.desc' },
    { icon: Shield, titleKey: 'features.pay.title', descKey: 'features.pay.desc' },
  ];

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Bride',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: "Our wedding photographer was absolutely amazing! They captured every special moment perfectly. The booking process was so easy and the quality exceeded our expectations.",
    },
    {
      name: 'Michael Chen',
      role: 'Business Owner',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: "I needed professional headshots for my team quickly. Found a great photographer on OraSnap, booked within minutes, and had the photos delivered the next week. Highly recommend!",
    },
    {
      name: 'Emily Rodriguez',
      role: 'Event Planner',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 5,
      text: "As an event planner, I use OraSnap for all my clients. The variety of photographers and the easy booking system saves me so much time. The quality is consistently excellent.",
    },
  ];

  return (
    <div className="min-h-screen bg-background" role="main" aria-label="OraSnap Photography Platform">
      <Header />

      {/* Hero Section - Simplified & More Engaging */}
      <section id="hero-section" className="relative min-h-screen flex items-center overflow-hidden" aria-labelledby="hero-title">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&h=1080&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />

        {/* Live Activity Badge - Enhanced */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:top-6 md:right-6 bg-white/15 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20 shadow-2xl animate-pulse">
          <div className="flex items-center gap-2 text-sm text-white font-semibold">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            <span>{liveActivity.bookings} booked in last hour</span>
          </div>
        </div>

        <div className="container relative z-10 py-20">
          <div className={`max-w-4xl transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 mb-8">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Trusted by 10,000+ customers</span>
            </div>

            {/* Main Headline - SEO Optimized */}
            <h1 id="hero-title" className="text-5xl md:text-7xl font-black mb-6 text-white leading-tight">
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>{' '}
              <br />{t('hero.titleEnd')}
            </h1>

            <h2 className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl font-medium">
              {t('hero.subtitle')}
            </h2>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-white font-semibold">{t('hero.photographersCount')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold">{t('hero.averageRating')}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span className="text-white font-semibold">{t('hero.verified')}</span>
              </div>
            </div>

            {/* Enhanced Search */}
            <form
              onSubmit={(e) => { e.preventDefault(); navigate(`/photographers?search=${searchQuery}`); }}
              className="relative flex gap-3 max-w-2xl mb-8"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                <Input
                  placeholder={t('hero.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-12 h-14 rounded-xl bg-white/15 backdrop-blur-md border-white/20 text-white placeholder:text-white/60 text-lg font-medium shadow-xl"
                />
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border border-white/20 rounded-xl mt-2 shadow-2xl z-50">
                    {searchSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors text-gray-800 font-medium first:rounded-t-xl last:rounded-b-xl"
                        onClick={() => {
                          setSearchQuery(suggestion);
                          setShowSearchSuggestions(false);
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button type="submit" size="lg" className="h-14 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-xl hover:scale-105 transition-all">
                {t('hero.search')}
              </Button>
            </form>

            {/* Quick Categories */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all"
                onClick={() => navigate('/photographers?category=wedding')}
              >
                <Heart className="w-4 h-4 mr-2" />
                Wedding
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all"
                onClick={() => navigate('/photographers?category=portrait')}
              >
                <User className="w-4 h-4 mr-2" />
                Portrait
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all"
                onClick={() => navigate('/photographers?category=event')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section - Simplified */}
      <section className="py-12 bg-white dark:bg-gray-900 border-b">
        <div className="container">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Trusted by leading brands</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">TechCrunch</span>
            </div>
            <div className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Award className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">Best Platform 2024</span>
            </div>
            <div className="flex items-center gap-2 hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">SSL Secured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Match Section - Enhanced & Simplified */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="container">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold mb-4">
              <Zap className="w-4 h-4" />
              <span>Quick Match</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {t('match.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('match.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border hover:border-blue-500/30 transition-all hover:scale-105 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">{t('match.instantMatching')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('match.aiPowered')}</p>
              </div>
              <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border hover:border-emerald-500/30 transition-all hover:scale-105 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">{t('match.locationBased')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('match.nearYou')}</p>
              </div>
              <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border hover:border-pink-500/30 transition-all hover:scale-105 hover:shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold mb-2">{t('match.perfectFit')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{t('match.styleAndBudget')}</p>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="h-14 px-10 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all"
                onClick={() => {
                  document.getElementById('match-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Zap className="w-5 h-5 mr-2" />
                {t('match.startQuickMatch')}
              </Button>
              <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm">{t('match.noSignupRequired')}</p>
            </div>
          </div>
        </div>
      </section>
      {/* Match Form - Enhanced UX */}
      <section id="match-section" className="container py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Find Your Perfect Match</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Tell us your needs and we'll match you instantly
          </p>
        </div>
        <form onSubmit={handleFindMatch} className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Photography Style</Label>
                <div className="grid grid-cols-2 gap-3">
                  {STYLES.slice(0, 6).map(style => (
                    <Button
                      key={style.value}
                      type="button"
                      variant={selectedStyle === style.value ? 'default' : 'outline'}
                      className="h-12 text-sm font-semibold hover:scale-105 transition-all"
                      onClick={() => { setSelectedStyle(style.value); setEventType(style.label); }}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {STYLES.slice(6).map(style => (
                    <Button
                      key={style.value}
                      type="button"
                      variant={selectedStyle === style.value ? 'default' : 'outline'}
                      className="h-10 text-xs font-semibold hover:scale-105 transition-all"
                      onClick={() => { setSelectedStyle(style.value); setEventType(style.label); }}
                    >
                      {style.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Duration: {duration} {duration === 1 ? 'hour' : 'hours'}</Label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1hr</span>
                  <span>12hrs</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <Label className="text-base font-semibold mb-3 block">Country</Label>
                <select
                  value={country}
                  onChange={e => handleCountryChange(e.target.value)}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {locationService.getCountries().map(c => (
                    <option key={c.code} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Location</Label>
                <div className="relative">
                  <Input
                    ref={locationInputRef}
                    placeholder="Enter city or area"
                    value={location}
                    onChange={e => handleLocationChange(e.target.value)}
                    className="h-12 pl-4 focus:ring-2 focus:ring-blue-500"
                    autoComplete="off"
                  />
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <ul className="absolute z-10 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-48 overflow-auto">
                      {locationLoading ? (
                        <li className="p-3 text-sm text-gray-500 dark:text-gray-400">Loading...</li>
                      ) : (
                        locationSuggestions.map((suggestion, idx) => (
                          <li
                            key={idx}
                            className="p-3 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                            onMouseDown={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Budget (total)</Label>
                <div className="flex gap-3">
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                    <option value="AUD">AUD</option>
                    <option value="CAD">CAD</option>
                    <option value="CHF">CHF</option>
                    <option value="CNY">CNY</option>
                    <option value="INR">INR</option>
                    <option value="BRL">BRL</option>
                    <option value="KRW">KRW</option>
                    <option value="SGD">SGD</option>
                    <option value="HKD">HKD</option>
                    <option value="SEK">SEK</option>
                    <option value="NOK">NOK</option>
                    <option value="DKK">DKK</option>
                    <option value="PLN">PLN</option>
                    <option value="CZK">CZK</option>
                    <option value="HUF">HUF</option>
                    <option value="RUB">RUB</option>
                    <option value="TRY">TRY</option>
                    <option value="ZAR">ZAR</option>
                    <option value="MXN">MXN</option>
                    <option value="THB">THB</option>
                    <option value="MYR">MYR</option>
                    <option value="PHP">PHP</option>
                    <option value="IDR">IDR</option>
                    <option value="VND">VND</option>
                    <option value="PKR">PKR</option>
                    <option value="EGP">EGP</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                    <option value="ILS">ILS</option>
                    <option value="TWD">TWD</option>
                    <option value="AFN">AFN</option>
                    <option value="ALL">ALL</option>
                    <option value="DZD">DZD</option>
                    <option value="ARS">ARS</option>
                    <option value="AMD">AMD</option>
                    <option value="AZN">AZN</option>
                    <option value="BHD">BHD</option>
                    <option value="BDT">BDT</option>
                    <option value="BYN">BYN</option>
                    <option value="BOB">BOB</option>
                    <option value="BAM">BAM</option>
                    <option value="BWP">BWP</option>
                    <option value="BND">BND</option>
                    <option value="BGN">BGN</option>
                    <option value="KHR">KHR</option>
                    <option value="CLP">CLP</option>
                    <option value="COP">COP</option>
                    <option value="CRC">CRC</option>
                    <option value="HRK">HRK</option>
                    <option value="DOP">DOP</option>
                    <option value="ETB">ETB</option>
                    <option value="GEL">GEL</option>
                    <option value="GHS">GHS</option>
                    <option value="GTQ">GTQ</option>
                    <option value="HNL">HNL</option>
                    <option value="ISK">ISK</option>
                    <option value="IRR">IRR</option>
                    <option value="IQD">IQD</option>
                    <option value="JMD">JMD</option>
                    <option value="JOD">JOD</option>
                    <option value="KZT">KZT</option>
                    <option value="KES">KES</option>
                    <option value="KWD">KWD</option>
                    <option value="KGS">KGS</option>
                    <option value="LAK">LAK</option>
                    <option value="LBP">LBP</option>
                    <option value="LYD">LYD</option>
                    <option value="MDL">MDL</option>
                    <option value="MNT">MNT</option>
                    <option value="MAD">MAD</option>
                    <option value="MMK">MMK</option>
                    <option value="NPR">NPR</option>
                    <option value="NZD">NZD</option>
                    <option value="NIO">NIO</option>
                    <option value="NGN">NGN</option>
                    <option value="KPW">KPW</option>
                    <option value="MKD">MKD</option>
                    <option value="OMR">OMR</option>
                    <option value="PAB">PAB</option>
                    <option value="PYG">PYG</option>
                    <option value="PEN">PEN</option>
                    <option value="QAR">QAR</option>
                    <option value="RON">RON</option>
                    <option value="RSD">RSD</option>
                    <option value="LKR">LKR</option>
                    <option value="SYP">SYP</option>
                    <option value="TJS">TJS</option>
                    <option value="TZS">TZS</option>
                    <option value="TND">TND</option>
                    <option value="TMT">TMT</option>
                    <option value="UGX">UGX</option>
                    <option value="UAH">UAH</option>
                    <option value="UYU">UYU</option>
                    <option value="UZS">UZS</option>
                    <option value="VES">VES</option>
                    <option value="YER">YER</option>
                    <option value="ZMW">ZMW</option>
                    <option value="ZWL">ZWL</option>
                  </select>
                  <Input
                    type="number"
                    min={100}
                    step={50}
                    value={budget}
                    onChange={e => setBudget(Number(e.target.value))}
                    className="flex-1 h-12 focus:ring-2 focus:ring-blue-500"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              type="submit"
              className="w-full md:w-auto h-12 px-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:scale-105 transition-all"
              disabled={matchLoading}
            >
              {matchLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Find Your Match
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* AI Smart Matching Results */}
        {showSmartMatching && matchResults.length > 0 && (
          <div className="mt-8">
            <SmartMatching
              userPreferences={{
                budget,
                location: `${location}, ${country}`,
                style: [selectedStyle],
                eventType: eventType,
                date: selectedDate || new Date(),
                duration
              }}
              photographers={matchResults}
              onSelectPhotographer={(id) => navigate(`/photographer/${id}`)}
            />
          </div>
        )}

        {/* Results */}
        {matchResults.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold mb-6 text-center">Perfect Matches Found!</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchResults.map(p => (
                <div key={p.id} className="hover:scale-105 transition-transform">
                  <PhotographerCard photographer={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* How It Works - Simplified */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('features.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              {t('features.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">{t('features.browse.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('features.browse.desc')}</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-bold mb-2">{t('features.book.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('features.book.desc')}</p>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-5 w-5 text-pink-600" />
              </div>
              <h3 className="font-bold mb-2">{t('features.pay.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('features.pay.desc')}</p>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-2xl mx-auto">
            <div className="text-center p-3">
              <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Verified Pros</p>
            </div>
            <div className="text-center p-3">
              <Shield className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Secure Payments</p>
            </div>
            <div className="text-center p-3">
              <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">24/7 Support</p>
            </div>
            <div className="text-center p-3">
              <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Quality Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Photographers - Enhanced */}
      <section className="py-16 container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('featured.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300">{t('featured.subtitle')}</p>
          </div>
          <Link to="/photographers">
            <Button variant="outline" className="hover:scale-105 transition-all">
              {t('featured.viewAll')} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Pricing info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">Transparent Pricing</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Starting from $150/hour • No hidden fees</p>
          </div>
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
            View Pricing
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <PhotographerCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photographers.map((p, index) => (
              <div key={p.id} className="relative group hover:scale-105 transition-transform">
                <PhotographerCard photographer={p} />
                {index === 0 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    ⭐ Most Popular
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </section>

      {/* Testimonials - Simplified */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t('testimonials.title')}</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              {t('testimonials.subtitle')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed text-sm">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ limit={6} />

      {/* CTA Section - Simplified & Powerful */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>

        <div className="container text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              {t('cta.readyToCapture')}
            </h2>
            <p className="mb-10 text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
              {t('cta.joinThousands')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button
                size="lg"
                className="h-14 px-10 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg shadow-xl hover:scale-105 transition-all"
                onClick={() => navigate('/photographers')}
              >
                <Search className="w-5 h-5 mr-2" />
                {t('nav.findPhotographers')}
              </Button>
              <Button
                size="lg"
                className="h-14 px-10 rounded-xl bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold text-lg hover:scale-105 transition-all"
                onClick={() => navigate('/photographer/register')}
              >
                <Camera className="w-5 w-5 mr-2" />
                Become a Photographer
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/90 max-w-2xl mx-auto text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>{t('common.noSetupFees')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>{t('common.instantBooking')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>{t('common.securePayments')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>{t('common.support247')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
