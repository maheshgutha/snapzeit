import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, Send, Clock, Camera, Heart, Users, Star, Award } from 'lucide-react';

export default function Contact() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert(`Thank you ${formData.name}! Your message has been sent successfully.\n\nWe'll get back to you within 24 hours at ${formData.email}.`);
    
    setFormData({ name: '', email: '', subject: '', message: '' });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Modern Hero */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=1080&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent" />
        
        <div className="container relative z-10 py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
              Get in{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Touch
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl">
              Have questions? Need help? We're here to assist you 24/7.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold shadow-xl hover:scale-105 transition-all"
                onClick={() => navigate('/photographers')}
              >
                <Camera className="mr-2 h-5 w-5" />
                Browse Photographers
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-12 px-8 rounded-xl bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all"
                onClick={() => navigate('/how-it-works')}
              >
                Learn How It Works
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 container">
        <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Ready to book your perfect photographer? Have questions about our services? We're here to help!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email Support</h3>
                  <p className="text-gray-600 dark:text-gray-300">rabbanibasha590@gmail.com</p>
                  <p className="text-sm text-gray-500">Response within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Developer Contact</h3>
                  <p className="text-gray-600 dark:text-gray-300">Rabbani Basha</p>
                  <p className="text-gray-600 dark:text-gray-300">+91 8367561999</p>
                  <p className="text-sm text-gray-500">Vuyyruru, Krishna District</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Developer Location</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Vuyyruru, Krishna District<br />
                    Andhra Pradesh, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-600 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Business Hours</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Mon-Fri: 9:00 AM - 8:00 PM<br />
                    Sat-Sun: 10:00 AM - 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
                <CardDescription className="text-base">
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="h-12"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-semibold">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="How can we help you?"
                      value={formData.subject}
                      onChange={handleChange}
                      className="h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your photography needs or questions..."
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500 text-right">
                      {formData.message.length}/1000 characters
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:scale-105 transition-all" 
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
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
                <li><Link to="/photographers" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Camera className="h-3 w-3" />Find Photographers</Link></li>
                <li><Link to="/#match-section" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Clock className="h-3 w-3" />Quick Match</Link></li>
                <li><Link to="/#hero-section" className="hover:text-blue-600 transition-colors flex items-center gap-2">💰 Pricing Guide</Link></li>
                <li><Link to="/#testimonials" className="hover:text-blue-600 transition-colors flex items-center gap-2"><Star className="h-3 w-3" />Customer Reviews</Link></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition-colors flex items-center gap-2">🎧 24/7 Support</Link></li>
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
                © 2026 OraSnap. All rights reserved.
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
              <Link to="/contact" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
