import { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, Check, Star, Camera, Users, Clock,
  Shield, Award, Zap, Heart, Building, Baby
} from 'lucide-react';

const PRICING_PLANS = [
  {
    name: 'Basic Session',
    price: 199,
    duration: '1 hour',
    photos: '15-20',
    category: 'Portrait',
    features: [
      '1 hour photo session',
      '15-20 edited photos',
      'Online gallery access',
      'Basic retouching included',
      '48-hour delivery'
    ],
    popular: false,
    color: 'from-gray-600 to-gray-700'
  },
  {
    name: 'Professional',
    price: 399,
    duration: '2 hours',
    photos: '40-50',
    category: 'Event',
    features: [
      '2 hour photo session',
      '40-50 edited photos',
      'Online gallery + download',
      'Advanced retouching',
      '24-hour delivery',
      'Print release included'
    ],
    popular: true,
    color: 'from-blue-600 to-purple-600'
  },
  {
    name: 'Premium Package',
    price: 799,
    duration: '4 hours',
    photos: '100+',
    category: 'Wedding',
    features: [
      '4+ hour coverage',
      '100+ edited photos',
      'Premium online gallery',
      'Professional retouching',
      'Same-day preview',
      'Print release + USB',
      'Second photographer option'
    ],
    popular: false,
    color: 'from-purple-600 to-pink-600'
  }
];

const CATEGORY_PRICING = [
  {
    category: 'Wedding Photography',
    icon: Heart,
    priceRange: '$1,500 - $5,000',
    avgPrice: '$2,800',
    description: 'Full day coverage with engagement session',
    features: ['8-10 hours coverage', '500+ photos', 'Two photographers', 'Online gallery']
  },
  {
    category: 'Portrait Photography',
    icon: Users,
    priceRange: '$150 - $500',
    avgPrice: '$300',
    description: 'Individual, family, or group portraits',
    features: ['1-2 hours session', '20-40 photos', 'Studio or location', 'Basic retouching']
  },
  {
    category: 'Event Photography',
    icon: Camera,
    priceRange: '$400 - $1,200',
    avgPrice: '$700',
    description: 'Corporate events and celebrations',
    features: ['2-6 hours coverage', '100+ photos', 'Event documentation', 'Quick turnaround']
  },
  {
    category: 'Corporate Photography',
    icon: Building,
    priceRange: '$300 - $800',
    avgPrice: '$500',
    description: 'Professional headshots and company events',
    features: ['Professional setup', 'Multiple subjects', 'High-res files', 'Commercial license']
  },
  {
    category: 'Maternity & Newborn',
    icon: Baby,
    priceRange: '$250 - $600',
    avgPrice: '$400',
    description: 'Maternity and newborn photography sessions',
    features: ['1-2 hours session', '25-35 photos', 'Props included', 'Gentle approach']
  }
];

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="container relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Transparent
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Clear, upfront pricing for all photography services. No hidden fees, no surprises. Find the perfect package for your needs and budget.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">$199</div>
                <div className="text-sm text-muted-foreground">Starting Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">No</div>
                <div className="text-sm text-muted-foreground">Hidden Fees</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24h</div>
                <div className="text-sm text-muted-foreground">Fast Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">100%</div>
                <div className="text-sm text-muted-foreground">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 space-y-16">
        {/* Popular Packages */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Popular Packages</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our most popular photography packages, designed to meet different needs and budgets.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'border-2 border-primary scale-105' : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                
                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-4`}>
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {plan.category}
                  </Badge>
                  <div className="text-4xl font-bold text-primary mt-4">
                    ${plan.price}
                  </div>
                  <div className="text-muted-foreground">
                    {plan.duration} • {plan.photos} photos
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => setSelectedPlan(plan.name)}
                  >
                    Choose {plan.name}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Category Pricing */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pricing by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore pricing ranges for different types of photography services to find what fits your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORY_PRICING.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border hover:border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="text-primary font-semibold">
                        {category.avgPrice}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{category.category}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{category.description}</p>
                    
                    <div className="text-lg font-semibold text-primary mb-4">
                      {category.priceRange}
                    </div>
                    
                    <ul className="space-y-2">
                      {category.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className="h-3 w-3 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Value Propositions */}
        <section className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose OraSnap?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We provide exceptional value and service with every photography session.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
              <p className="text-muted-foreground text-sm">
                Safe and secure payment processing with buyer protection.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Quality Guarantee</h3>
              <p className="text-muted-foreground text-sm">
                Professional quality guaranteed or your money back.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Quick turnaround times with preview photos within 24 hours.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Top Rated</h3>
              <p className="text-muted-foreground text-sm">
                Only work with highly rated and reviewed photographers.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ready to Book Your Session?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Browse our photographers and find the perfect match for your photography needs and budget.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8">
                <Camera className="h-5 w-5 mr-2" />
                Find Photographers
              </Button>
              <Button size="lg" variant="outline">
                <Clock className="h-5 w-5 mr-2" />
                Get Custom Quote
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">OraSnap</h3>
                <p className="text-gray-400 text-sm">Find and book professional photographers worldwide.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><a href="/photographers" className="hover:text-white">Find Photographers</a></li>
                  <li><a href="/categories" className="hover:text-white">Categories</a></li>
                  <li><a href="/locations" className="hover:text-white">Locations</a></li>
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
              <p>&copy; 2024 OraSnap. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}