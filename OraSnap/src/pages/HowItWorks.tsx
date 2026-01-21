import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Calendar, MessageSquare, Camera, Star, Shield, CreditCard, CheckCircle, ArrowRight, Users, Award, Clock, Heart, MapPin, Zap } from 'lucide-react';

export default function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Search,
      title: 'Browse & Compare',
      desc: 'Explore verified photographers in your area. View portfolios, read reviews, and compare prices to find your perfect match.',
    },
    {
      icon: Calendar,
      title: 'Book Instantly',
      desc: 'Select your preferred date and package. Our instant booking system confirms your session immediately with secure payment.',
    },
    {
      icon: MessageSquare,
      title: 'Plan Together',
      desc: 'Chat directly with your photographer to discuss details, locations, and special requirements for your session.',
    },
    {
      icon: Camera,
      title: 'Capture Moments',
      desc: 'Enjoy your professional photography session. Our photographers bring expertise and creativity to every shoot.',
    },
    {
      icon: Star,
      title: 'Receive & Review',
      desc: 'Get your professionally edited photos delivered on time. Leave a review to help other customers.',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      desc: 'All photographers are background-checked, portfolio-verified, and continuously monitored for quality.',
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      desc: 'Your payment is protected with industry-standard encryption and held safely until work completion.',
    },
    {
      icon: CheckCircle,
      title: 'Quality Guaranteed',
      desc: 'We stand behind every session with our satisfaction guarantee and 24/7 customer support.',
    },
  ];

  const faqs = [
    {
      question: 'How do I book a photographer?',
      answer: "Simply browse our photographers, select one you like, check their availability, and book directly through our platform. You'll receive instant confirmation and can start chatting with your photographer right away.",
    },
    {
      question: 'What types of photography sessions are available?',
      answer: 'Our photographers specialize in various types including weddings, portraits, events, commercial, fashion, sports, product, and food photography. Use our filters to find the perfect match for your needs.',
    },
    {
      question: 'How much does a photography session cost?',
      answer: 'Prices vary by photographer, location, and session type. You can filter by price range on our search page. Most photographers list their hourly rates, and many offer package deals for events like weddings.',
    },
    {
      question: 'Can I reschedule or cancel my booking?',
      answer: "Yes, you can reschedule or cancel your booking through your account. Cancellation policies vary by photographer, so please check the specific terms before booking. Most photographers offer free cancellation up to 48 hours before the session.",
    },
    {
      question: 'How are photographers verified?',
      answer: "All photographers go through our verification process which includes portfolio review, identity verification, and background checks. We also monitor ongoing reviews and ratings to ensure quality standards are maintained.",
    },
    {
      question: 'When will I receive my photos?',
      answer: "Delivery times vary by photographer and session type. Most photographers deliver edited photos within 1-2 weeks for portrait sessions and 4-6 weeks for weddings. You can discuss specific timelines with your photographer before booking.",
    },
    {
      question: 'Is my payment secure?',
      answer: "Absolutely. We use industry-standard encryption and secure payment processing. Your payment is held safely until the session is completed, protecting both you and the photographer.",
    },
    {
      question: 'What if I am not satisfied with my photos?',
      answer: "We stand behind our photographers and their work. If you're not satisfied, contact us within 7 days of receiving your photos. We'll work with you and the photographer to resolve any issues, and offer a refund if necessary.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Modern Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542038784456-1ea8e732a1b2?w=1920&h=1080&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
        
        <div className="container relative z-10 py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 mb-8">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white">Simple & Secure Process</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
              How{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                OraSnap
              </span>{' '}
              Works
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
              Book professional photographers in 5 simple steps. From browsing to receiving your photos.
            </p>

            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <Users className="h-5 w-5 text-blue-400" />
                <span className="text-white font-semibold">2,500+ photographers</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-semibold">4.9★ rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <span className="text-white font-semibold">2hr response</span>
              </div>
            </div>

            <Button 
              size="lg" 
              className="h-14 px-10 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg shadow-xl hover:scale-105 transition-all"
              onClick={() => navigate('/photographers')}
            >
              <Search className="w-5 h-5 mr-2" />
              Start Browsing
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Steps Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10">
        <div className="container">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold mb-4">
              <Zap className="w-4 h-4" />
              <span>5 Simple Steps</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Your Journey to Perfect Photos
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From discovery to delivery, we've made it incredibly simple
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-8 mb-16 last:mb-0 group">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-0.5 h-20 bg-gradient-to-b from-blue-600 to-purple-600 mt-6 opacity-30" />
                  )}
                </div>

                <div className="pb-16 flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">Step {index + 1}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white">Why Choose OraSnap?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We've built the most trusted platform for photography services
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl border hover:shadow-lg transition-all hover:scale-105">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Everything you need to know about booking photographers
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm hover:shadow-md transition-all">
                  <AccordionTrigger className="text-left px-6 py-4 hover:no-underline font-semibold text-gray-900 dark:text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000" />
        </div>
        
        <div className="container text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
              Ready to Capture Your Perfect Moments?
            </h2>
            <p className="mb-10 text-white/90 text-lg md:text-xl max-w-2xl mx-auto">
              Join thousands who trust OraSnap for their photography needs. Start browsing now.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-bold text-lg shadow-xl hover:scale-105 transition-all"
                onClick={() => navigate('/photographers')}
              >
                <Search className="w-5 h-5 mr-2" />
                Browse Photographers
              </Button>
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-xl bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold text-lg hover:scale-105 transition-all"
                onClick={() => navigate('/auth')}
              >
                <Camera className="w-5 h-5 mr-2" />
                Join as Photographer
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white/90 max-w-2xl mx-auto text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>Instant booking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-300" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consistent Footer */}
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
                <li><Link to="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Search className="h-3 w-3" />Find Photographers</Link></li>
                <li><Link to="/#match-section" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Clock className="h-3 w-3" />Quick Match</Link></li>
                <li><Link to="/#hero-section" className="hover:text-blue-600 transition-colors flex items-center gap-2">💰 Pricing Guide</Link></li>
                <li><Link to="/#testimonials" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Star className="h-3 w-3" />Customer Reviews</Link></li>
                <li><Link to="/#cta-section" className="hover:text-blue-600 transition-colors flex items-center gap-2">🎧 24/7 Support</Link></li>
              </ul>
            </div>
            
            {/* For Photographers */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">For Photographers</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><Link to="/auth" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Camera className="h-3 w-3" />Join OraSnap</Link></li>
                <li><Link to="/auth" className="hover:text-blue-600 transition-colors flex items-center gap-2">📊 Dashboard</Link></li>
                <li><Link to="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2">💵 View Earnings</Link></li>
                <li><Link to="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2">📚 Resources</Link></li>
                <li><Link to="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2">👥 Community</Link></li>
              </ul>
            </div>
            
            {/* Popular Categories */}
            <div>
              <h4 className="font-bold mb-4 text-gray-900 dark:text-white">Popular Categories</h4>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <li><Link to="/photographers?category=wedding" className="hover:text-blue-600 transition-colors flex items-center gap-2">💒 Wedding Photography</Link></li>
                <li><Link to="/photographers?category=portrait" className="hover:text-blue-600 transition-colors flex items-center gap-2">👤 Portrait Photography</Link></li>
                <li><Link to="/photographers?category=event" className="hover:text-blue-600 transition-colors flex items-center gap-2">🎉 Event Photography</Link></li>
                <li><Link to="/photographers?specialty=Commercial" className="hover:text-blue-600 transition-colors flex items-center gap-2">🏢 Commercial Photography</Link></li>
                <li><Link to="/photographers?specialty=Fashion" className="hover:text-blue-600 transition-colors flex items-center gap-2">👗 Fashion Photography</Link></li>
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
              <Link to="/photographers" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Browse Photographers</Link>
              <Link to="/auth" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Sign In</Link>
              <Link to="/#hero-section" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">About</Link>
              <Link to="/#cta-section" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
