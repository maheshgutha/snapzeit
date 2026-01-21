import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, Search, Users, Camera, Star, Filter,
  Globe, Navigation, Compass, Map
} from 'lucide-react';
import { updatePageSEO, seoData, generateLocationSEO } from '@/utils/seo';
import Breadcrumb from '@/components/Breadcrumb';

const POPULAR_LOCATIONS = [
  // Major Cities
  { name: 'New York City', country: 'USA', photographers: 245, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400' },
  { name: 'London', country: 'UK', photographers: 189, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400' },
  { name: 'Paris', country: 'France', photographers: 167, image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400' },
  { name: 'Tokyo', country: 'Japan', photographers: 134, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400' },
  
  // Tourist Destinations - Europe
  { name: 'Rome', country: 'Italy', photographers: 156, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400' },
  { name: 'Barcelona', country: 'Spain', photographers: 112, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400' },
  { name: 'Amsterdam', country: 'Netherlands', photographers: 89, image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400' },
  { name: 'Prague', country: 'Czech Republic', photographers: 76, image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400' },
  
  // Tourist Destinations - Asia Pacific
  { name: 'Bali', country: 'Indonesia', photographers: 143, image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400' },
  { name: 'Bangkok', country: 'Thailand', photographers: 98, image: 'https://images.unsplash.com/photo-1563492065-1a83d0c8b6d8?w=400' },
  { name: 'Sydney', country: 'Australia', photographers: 98, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Singapore', country: 'Singapore', photographers: 87, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400' },
  
  // Tourist Destinations - Americas
  { name: 'Los Angeles', country: 'USA', photographers: 198, image: 'https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=400' },
  { name: 'Miami', country: 'USA', photographers: 134, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400' },
  { name: 'Cancun', country: 'Mexico', photographers: 67, image: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400' },
  { name: 'Rio de Janeiro', country: 'Brazil', photographers: 89, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400' },
  
  // Tourist Destinations - Middle East & Africa
  { name: 'Dubai', country: 'UAE', photographers: 87, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  { name: 'Istanbul', country: 'Turkey', photographers: 76, image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=400' },
  { name: 'Cape Town', country: 'South Africa', photographers: 54, image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=400' },
  { name: 'Marrakech', country: 'Morocco', photographers: 43, image: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=400' },
  
  // Tourist Destinations - India
  { name: 'Mumbai', country: 'India', photographers: 156, image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400' },
  { name: 'Goa', country: 'India', photographers: 89, image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400' },
  { name: 'Jaipur', country: 'India', photographers: 67, image: 'https://images.unsplash.com/photo-1599661046827-dacde6976549?w=400' },
  { name: 'Kerala', country: 'India', photographers: 54, image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400' },
];

const REGIONS = [
  { name: 'North America', locations: 45, photographers: 1250 },
  { name: 'Europe', locations: 67, photographers: 1890 },
  { name: 'Asia Pacific', locations: 38, photographers: 980 },
  { name: 'Middle East', locations: 12, photographers: 340 },
  { name: 'Africa', locations: 18, photographers: 290 },
  { name: 'South America', locations: 22, photographers: 450 },
];

export default function Locations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filteredLocations, setFilteredLocations] = useState(POPULAR_LOCATIONS);

  // SEO optimization
  useEffect(() => {
    const locationQuery = searchParams.get('location');
    
    if (locationQuery) {
      const location = POPULAR_LOCATIONS.find(loc => 
        loc.name.toLowerCase() === locationQuery.toLowerCase()
      );
      if (location) {
        const locationSEO = generateLocationSEO(location.name, location.country, location.photographers);
        updatePageSEO(locationSEO);
      }
    } else {
      updatePageSEO({
        ...seoData.locations,
        structuredData: {
          ...seoData.locations.structuredData,
          "mainEntity": POPULAR_LOCATIONS.map(location => ({
            "@type": "Place",
            "name": location.name,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": location.name,
              "addressCountry": location.country
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Photography Services",
              "numberOfItems": location.photographers
            }
          }))
        }
      });
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (searchQuery) {
      const filtered = POPULAR_LOCATIONS.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.country.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(POPULAR_LOCATIONS);
    }
  };

  const handleLocationClick = (location: typeof POPULAR_LOCATIONS[0]) => {
    navigate(`/photographers?location=${encodeURIComponent(location.name)}&country=${encodeURIComponent(location.country)}`);
  };

  const handleRegionClick = (region: typeof REGIONS[0]) => {
    navigate(`/photographers?region=${encodeURIComponent(region.name)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Breadcrumb />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Photographers
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Anywhere in the World
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover talented photographers in your city or explore creative professionals worldwide for your next project.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by city, country, or region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-12 pr-4 h-14 text-lg bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">200+</div>
                <div className="text-sm text-muted-foreground">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50+</div>
                <div className="text-sm text-muted-foreground">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">5K+</div>
                <div className="text-sm text-muted-foreground">Photographers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 space-y-16">
        {/* Popular Locations */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Locations</h2>
              <p className="text-muted-foreground">Top cities with the most talented photographers</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredLocations.slice(0, 12).map((location, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={() => handleLocationClick(location)}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={location.image}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{location.name}</h3>
                    <p className="text-sm opacity-90">{location.country}</p>
                  </div>
                  <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white border-white/30">
                    <Users className="h-3 w-3 mr-1" />
                    {location.photographers}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Camera className="h-4 w-4" />
                      <span>{location.photographers} photographers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Browse by Region */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Region</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore photographers across different continents and discover unique photography styles from around the world.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REGIONS.map((region, index) => (
              <Card 
                key={index} 
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20"
                onClick={() => handleRegionClick(region)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <Badge variant="secondary">{region.locations} cities</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {region.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{region.locations} locations</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{region.photographers} photographers</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Location Search Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Finding the perfect photographer in your area is simple and straightforward.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Search Location</h3>
              <p className="text-muted-foreground">
                Enter your city, region, or browse popular locations to find photographers near you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Navigation className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Browse Profiles</h3>
              <p className="text-muted-foreground">
                View photographer portfolios, ratings, and availability in your selected location.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Book & Connect</h3>
              <p className="text-muted-foreground">
                Contact photographers directly and book your session with confidence.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Can't Find Your Location?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              We're constantly expanding our network. Let us know where you need a photographer and we'll help connect you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                onClick={() => navigate('/contact')}
              >
                <Map className="h-5 w-5 mr-2" />
                Request New Location
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/photographers')}
              >
                <Compass className="h-5 w-5 mr-2" />
                Explore All Photographers
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 rounded-2xl">
          <div className="px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">OraSnap</h3>
                <p className="text-gray-400 text-sm">Find and book professional photographers worldwide.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><button onClick={() => navigate('/photographers')} className="hover:text-white text-left">Find Photographers</button></li>
                  <li><button onClick={() => navigate('/categories')} className="hover:text-white text-left">Categories</button></li>
                  <li><button onClick={() => navigate('/pricing')} className="hover:text-white text-left">Pricing</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><button onClick={() => navigate('/how-it-works')} className="hover:text-white text-left">How It Works</button></li>
                  <li><button onClick={() => navigate('/contact')} className="hover:text-white text-left">Contact Us</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Connect</h4>
                <p className="text-gray-400 text-sm">Follow us for updates and photography tips.</p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2024 OraSnap. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}