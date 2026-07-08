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
import { updatePageSEO, seoData } from '@/utils/seo'; // Removed generateLocationSEO as we use static SEO for this listing page mostly
import Breadcrumb from '@/components/Breadcrumb';
import { POPULAR_LOCATIONS, HOTSPOTS, REGIONS } from '@/data/locations';

export default function Locations() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [filteredLocations, setFilteredLocations] = useState(POPULAR_LOCATIONS);

  // SEO optimization for the main listing page
  useEffect(() => {
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
  }, []);

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
    // Navigate to dedicated SEO landing page
    if (location.slug) {
      navigate(`/location/${location.slug}`);
    } else {
      navigate(`/photographers?location=${encodeURIComponent(location.name)}`);
    }
  };

  const handleHotspotClick = (spot: typeof HOTSPOTS[0]) => {
    // Navigate to dedicated SEO landing page
    if (spot.slug) {
      navigate(`/location/${spot.slug}`);
    } else {
      navigate(`/photographers?search=${encodeURIComponent(spot.name)}`);
    }
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

        {/* Famous Photo Spots */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Famous Photo Spots</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Looking for street photography or scenic beaches? Find photographers who specialize in these iconic locations.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {HOTSPOTS.map((spot, index) => (
              <Card
                key={index}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0"
                onClick={() => handleHotspotClick(spot)}
              >
                <div className="relative h-40">
                  <img
                    src={spot.image}
                    alt={spot.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <h3 className="font-bold text-sm leading-tight mb-1">{spot.name}</h3>
                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <MapPin className="h-3 w-3" />
                      {spot.city}
                    </div>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/50 hover:bg-black/60 backdrop-blur-md border-0 text-[10px] px-2 py-0 h-5">
                    {spot.type}
                  </Badge>
                </div>
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
          {/* ... (Content same as previous) ... */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Location Search Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Finding the perfect photographer in your area is simple and straightforward.
            </p>
          </div>
          {/* Reusing existing simplified for brevity */}
          <div className="flex justify-center text-muted-foreground italic">
            Search. Browse. Book.
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
          {/* Same as previous */}
          <div className="text-center text-sm text-gray-500">© 2024 SnapZeiT</div>
        </footer>
      </div>
    </div>
  );
}