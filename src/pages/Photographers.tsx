import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import Header from '@/components/Header';
import PhotographerCard from '@/components/PhotographerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Search, X, MapPin, CalendarIcon, Camera, Filter, Users, Star, Award, Heart, ChevronLeft, ChevronRight, Clock, Globe } from 'lucide-react';
import { COUNTRIES } from '@/lib/currency';
import { updateInternationalSEO, generateCountrySEO, detectUserCountry } from '@/utils/international-seo';
import { formatPriceLocal } from '@/lib/currency';
import Breadcrumb from '@/components/Breadcrumb';
import { usePhotographers } from '@/hooks/usePhotographers';
import { seoData } from '@/utils/seo';

// Types
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

const FILTER_PRESETS = [
  { name: 'Wedding Photographers', specialty: 'Wedding', icon: '💒' },
  { name: 'Portrait Specialists', specialty: 'Portrait', icon: '👤' },
  { name: 'Budget Friendly', priceMax: 100, icon: '💰' },
  { name: 'Premium Photographers', priceMin: 200, icon: '⭐' },
];

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
     
  }, [value, delay]);
  return debouncedValue;
}

export default function Photographers() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
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

  const debouncedSearch = useDebounce(search, 500);

  // Use the new hook for data fetching
  const { data, isLoading, isError } = usePhotographers({
    page,
    limit: pageSize,
    search: debouncedSearch,
    specialty,
    country,
    city,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
    sortBy
  });

  const photographers = useMemo(() => (data?.photographers as Photographer[]) || [], [data?.photographers]);
  const totalCount = data?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
     
  }, [debouncedSearch, specialty, country, city, priceRange, selectedStyle, sortBy]);

  // SEO Update
  useEffect(() => {
    const userCountry = detectUserCountry();
    const seoConfig = generateCountrySEO(userCountry, 'photographers');

    if (debouncedSearch) {
      seoConfig.title = `${debouncedSearch} Photographers in ${userCountry.name} | SnapZeiT`;
    } else if (specialty) {
      seoConfig.title = `${specialty} Photographers in ${userCountry.name} | SnapZeiT`;
    }

    updateInternationalSEO({
      ...seoConfig,
      structuredData: {
        ...seoData.photographers.structuredData,
        "numberOfItems": totalCount,
        "mainEntity": photographers.slice(0, 5).map(p => ({
          "@type": "LocalBusiness",
          "name": p.name,
          "description": `Professional ${p.specialty} photographer`,
          "priceRange": formatPriceLocal(p.price_per_hour, p.currency || 'USD') + '/hour'
        }))
      }
    }, userCountry);
     
  }, [photographers, totalCount, debouncedSearch, specialty]);

  // Currency Handling
  const countryCurrencyMap: { [key: string]: string } = {
    'United States': 'USD', 'United Kingdom': 'GBP', 'Germany': 'EUR', 'France': 'EUR', 'India': 'INR'
  };
  const currencySymbols: { [key: string]: string } = { 'USD': '$', 'EUR': '€', 'INR': '₹', 'GBP': '£' };

  const handleCountryChange = (val: string) => {
    const selectedCountry = val === "all" ? "" : val;
    setCountry(selectedCountry);
    setCity('');
    if (selectedCountry && countryCurrencyMap[selectedCountry]) {
      setCurrency(countryCurrencyMap[selectedCountry]);
    } else {
      setCurrency('USD');
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
    setPage(1);
  };

  const applyPreset = (preset: typeof FILTER_PRESETS[0]) => {
    if (preset.specialty) setSpecialty(preset.specialty);
    if (preset.priceMin) setPriceRange([preset.priceMin, priceRange[1]]);
    if (preset.priceMax) setPriceRange([priceRange[0], preset.priceMax]);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const FiltersContent = () => (
    <div className="space-y-5">
      <div className="md:hidden">
        <Label className="text-sm font-medium mb-2 block">Search</Label>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10"
        />
      </div>

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

      <div>
        <Label className="text-sm font-medium mb-2 block">Photography Type</Label>
        <Select value={specialty || "all"} onValueChange={(val) => setSpecialty(val === "all" ? "" : val)}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Country</Label>
        <Select value={country || "all"} onValueChange={handleCountryChange}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All countries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All countries</SelectItem>
            {['United States', 'India', 'United Kingdom', 'Canada', 'Germany', 'France'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">City / Location</Label>
        <Input
          placeholder="Filter by city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10"
        />
      </div>

      <div>
        <Label className="text-sm font-medium mb-2 block">Price Range</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceRange[1] === 500 ? '' : priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 500])}
          />
        </div>
      </div>

      {(specialty || country || city || search || priceRange[0] > 0 || priceRange[1] < 500) && (
        <Button variant="outline" onClick={clearFilters} className="w-full">
          Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />

      <section className="py-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="container text-center">
          <h1 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Find Your Perfect Photographer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Browse verified professionals, compare portfolios, and book instantly
          </p>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2 items-center flex">Quick filters:</span>
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
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name, specialty, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] h-12 rounded-xl">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">⭐ {t('photographers.rating')}</SelectItem>
                  <SelectItem value="reviews">💬 {t('photographers.reviews')}</SelectItem>
                  <SelectItem value="price_low">💰 {t('photographers.priceAsc')}</SelectItem>
                  <SelectItem value="price_high">💎 {t('photographers.priceDesc')}</SelectItem>
                </SelectContent>
              </Select>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 md:hidden rounded-xl">
                    <Filter className="h-5 w-5 mr-2" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6"><FiltersContent /></div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {(specialty || country || city || priceRange[0] > 0 || priceRange[1] < 500) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {specialty && <Badge variant="secondary">📷 {specialty} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSpecialty('')} /></Badge>}
            {country && <Badge variant="secondary">🌍 {country} <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setCountry('')} /></Badge>}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 text-xs">Clear all</Button>
          </div>
        )}

        <div className="flex gap-8">
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-2xl border shadow-sm p-6">
              <h3 className="font-bold mb-6">Filters</h3>
              <FiltersContent />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-96 rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-20 text-red-500">
                Failed to load photographers. Please verify database setup.
              </div>
            ) : photographers.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No photographers found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center text-sm text-muted-foreground">
                  <span>Showing {photographers.length} of {totalCount} photographers</span>
                  <span>Page {page} of {totalPages}</span>
                </div>

                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {photographers.map(p => (
                    <PhotographerCard key={p.id} photographer={p} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pNum = i + 1;
                      if (totalPages > 5 && page > 3) {
                        pNum = page - 2 + i;
                      }
                      if (pNum > totalPages) return null;

                      return (
                        <Button
                          key={pNum}
                          variant={page === pNum ? "default" : "outline"}
                          onClick={() => handlePageChange(pNum)}
                          className="w-10 h-10"
                        >
                          {pNum}
                        </Button>
                      );
                    })}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl">SnapZeiT</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md leading-relaxed">
                Connect with verified photographers, book instantly, and capture your perfect moments.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">For Customers</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="/" className="hover:text-blue-600 transition-colors">Find Photographers</a></li>
                <li><a href="/#match-section" className="hover:text-blue-600 transition-colors">Quick Match</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">For Photographers</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="/auth" className="hover:text-blue-600 transition-colors">Join SnapZeiT</a></li>
                <li><a href="/photographers" className="hover:text-blue-600 transition-colors">Resources</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Popular Categories</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><a href="/photographers?category=wedding" className="hover:text-blue-600 transition-colors">Wedding</a></li>
                <li><a href="/photographers?category=portrait" className="hover:text-blue-600 transition-colors">Portrait</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
            <p>© 2026 SnapZeiT. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Globe className="h-4 w-4" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
