import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, Heart, Users, Building, Utensils, Baby,
  Briefcase, Palette, Music, Flower, Search, ArrowRight
} from 'lucide-react';
import { updatePageSEO, seoData } from '@/utils/seo';
import Breadcrumb from '@/components/Breadcrumb';

const CATEGORIES = [
  {
    id: 'wedding',
    name: 'Wedding Photography',
    icon: Heart,
    description: 'Capture your special day with romantic and timeless wedding photography',
    photographers: 1250,
    avgPrice: '$2,500',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
    popular: true
  },
  {
    id: 'portrait',
    name: 'Portrait Photography',
    icon: Users,
    description: 'Professional headshots and personal portraits for individuals and families',
    photographers: 890,
    avgPrice: '$300',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
    popular: true
  },
  {
    id: 'event',
    name: 'Event Photography',
    icon: Music,
    description: 'Corporate events, parties, and celebrations captured professionally',
    photographers: 670,
    avgPrice: '$800',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
    popular: true
  },
  {
    id: 'maternity',
    name: 'Maternity & Newborn',
    icon: Baby,
    description: 'Beautiful maternity and newborn photography sessions',
    photographers: 450,
    avgPrice: '$400',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600',
    popular: false
  },
  {
    id: 'corporate',
    name: 'Corporate Photography',
    icon: Briefcase,
    description: 'Professional business photography for companies and executives',
    photographers: 320,
    avgPrice: '$600',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
    popular: false
  },
  {
    id: 'product',
    name: 'Product Photography',
    icon: Palette,
    description: 'High-quality product shots for e-commerce and marketing',
    photographers: 280,
    avgPrice: '$250',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600',
    popular: false
  },
  {
    id: 'real-estate',
    name: 'Real Estate Photography',
    icon: Building,
    description: 'Professional property photography for real estate listings',
    photographers: 190,
    avgPrice: '$350',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600',
    popular: false
  },
  {
    id: 'food',
    name: 'Food Photography',
    icon: Utensils,
    description: 'Mouth-watering food photography for restaurants and brands',
    photographers: 150,
    avgPrice: '$400',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600',
    popular: false
  }
];

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // SEO optimization
  useEffect(() => {
    updatePageSEO({
      ...seoData.categories,
      structuredData: {
        ...seoData.categories.structuredData,
        "mainEntity": CATEGORIES.map(category => ({
          "@type": "Service",
          "name": category.name,
          "description": category.description,
          "provider": {
            "@type": "Organization",
            "name": "SnapZeit"
          },
          "areaServed": "Worldwide",
          "availableChannel": {
            "@type": "ServiceChannel",
            "serviceUrl": `https://snapzeit.com/photographers?category=${category.id}`
          }
        }))
      }
    });
  }, []);

  const filteredCategories = CATEGORIES.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularCategories = filteredCategories.filter(cat => cat.popular);
  const otherCategories = filteredCategories.filter(cat => !cat.popular);

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
                <Camera className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Photography
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Categories
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Find the perfect photographer for your specific needs. Browse our specialized categories and connect with experts in each field.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search photography categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 h-14 text-lg bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg focus:shadow-xl transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 space-y-16">
        {/* Popular Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Popular Categories</h2>
              <p className="text-muted-foreground">Most requested photography services</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {popularCategories.length} categories
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={category.id} 
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-primary/20"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-4 left-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                      Popular
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{category.photographers} photographers</span>
                        <span>From {category.avgPrice}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* All Categories */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">All Categories</h2>
              <p className="text-muted-foreground">Complete list of photography specializations</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {otherCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card 
                  key={category.id} 
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 border hover:border-primary/20"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {category.photographers}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {category.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">From {category.avgPrice}</span>
                      <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Find Your Photographer?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Browse photographers in your chosen category and book your perfect session today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                <Search className="h-5 w-5 mr-2" />
                Browse All Photographers
              </Button>
              <Button size="lg" variant="outline">
                <Camera className="h-5 w-5 mr-2" />
                Join as Photographer
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">SnapZeit</h3>
                <p className="text-gray-400 text-sm">Find and book professional photographers worldwide.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/photographers" className="hover:text-white">Find Photographers</a></li>
                  <li><a href="/locations" className="hover:text-white">Locations</a></li>
                  <li><a href="/pricing" className="hover:text-white">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/how-it-works" className="hover:text-white">How It Works</a></li>
                  <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Connect</h4>
                <p className="text-gray-400 text-sm">Follow us for updates and photography tips.</p>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>&copy; 2024 SnapZeit. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}