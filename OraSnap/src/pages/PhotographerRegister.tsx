import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SocialLogin } from '@/components/SocialLogin';
import { toast } from 'sonner';
import { Camera, ArrowLeft, Globe, Star, Users, Award } from 'lucide-react';
import { CURRENCIES, COUNTRIES, getCurrencySymbol } from '@/lib/currency';
import { validateEmail, validatePassword, validateName, validatePhone, validatePrice } from '@/utils/formValidation';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { locationService } from '@/utils/locationService';

const SPECIALTIES = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Fashion', 'Family', 'Maternity', 'Corporate'];
const POPULAR_TAGS = ['Natural Light', 'Studio', 'Outdoor', 'Candid', 'Editorial', 'Fine Art', 'Vintage', 'Modern'];

export default function PhotographerRegister() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(!user);
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.name || '',
    email: user?.email || '',
    password: '',
    phone: '',
    specialty: 'Wedding',
    location: '',
    country: 'United States',
    currency: 'USD',
    bio: '',
    pricePerHour: '150',
    experienceYears: '2',
    tags: [] as string[],
    portfolio: '',
    avatar_url: '',
  });
  
  const [errors, setErrors] = useState({
    name: '', email: '', password: '', phone: '', location: '', pricePerHour: ''
  });

  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'location') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      if (value.length >= 2) {
        debounceRef.current = setTimeout(() => {
          fetchLocationSuggestions(value);
        }, 300);
      } else {
        setLocationSuggestions([]);
        setShowSuggestions(false);
      }
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    setLocationLoading(true);
    try {
      const suggestions = await locationService.searchLocations(query, 5);
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Location search error:', error);
      setLocationSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setFormData(prev => ({ ...prev, location: suggestion }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
    if (locationInputRef.current) {
      locationInputRef.current.blur();
    }
  };

  const validateForm = () => {
    const nameValidation = validateName(formData.name);
    const emailValidation = validateEmail(formData.email);
    const passwordValidation = isNewUser ? validatePassword(formData.password) : { isValid: true, message: '' };
    const phoneValidation = validatePhone(formData.phone);
    const priceValidation = validatePrice(formData.pricePerHour);
    const locationValid = formData.location.length >= 2;
    
    setErrors({
      name: nameValidation.message,
      email: emailValidation.message,
      password: passwordValidation.message,
      phone: phoneValidation.message,
      location: locationValid ? '' : 'Location is required',
      pricePerHour: priceValidation.message
    });
    
    return nameValidation.isValid && emailValidation.isValid && passwordValidation.isValid && 
           phoneValidation.isValid && priceValidation.isValid && locationValid;
  };

  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    setLoading(true);

    try {
      let userId = user?.id;
      
      // Create account if new user
      if (isNewUser) {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              user_type: 'photographer'
            }
          }
        });

        if (error) {
          toast.error(error.message);
          return;
        }
        
        userId = data.user?.id;
      }

      if (!userId) {
        toast.error('Authentication error');
        return;
      }

      const portfolioArray = formData.portfolio
        .split('\n')
        .map(url => url.trim())
        .filter(url => url.length > 0);

      // Create photographer profile
      const { error: profileError } = await supabase.from('photographers').insert({
        id: userId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialty: formData.specialty,
        location: formData.location,
        country: formData.country,
        currency: formData.currency,
        bio: formData.bio,
        price_per_hour: parseFloat(formData.pricePerHour),
        experience_years: parseInt(formData.experienceYears) || 2,
        tags: formData.tags,
        portfolio: portfolioArray,
        avatar_url: formData.avatar_url || null,
        rating: 5.0,
        review_count: 0,
        status: 'pending',
      });

      if (profileError) {
        toast.error(profileError.message);
        return;
      }

      // Add photographer role
      const { error: roleError } = await supabase.from('user_roles').insert({
        user_id: userId,
        role: 'photographer',
      });

      if (roleError) {
        console.error('Role assignment error:', roleError);
      }

      toast.success('Photographer profile created successfully!');
      navigate('/photographer/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900 dark:to-pink-900">
      <Header />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container relative z-10">
          <Button variant="ghost" onClick={() => navigate('/auth')} className="mb-8 hover:bg-white/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
          
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Camera className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 bg-clip-text text-transparent">
              Join as Photographer
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Showcase your talent to thousands of clients worldwide
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
            <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2,500+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Photographers</p>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">4.9</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
            </div>
            <div className="text-center p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.5M+</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Earned by Photographers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="pb-20 container">
        <Card className="max-w-4xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="text-center pb-8 pt-10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Create Your Profile
            </CardTitle>
            <CardDescription className="text-lg">
              {isNewUser ? 'Create your account and photographer profile' : 'Complete your photographer profile'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-10">
            {/* Google OAuth Option */}
            {isNewUser && (
              <>
                <SocialLogin onSuccess={() => navigate('/photographer/onboarding')} isPhotographer={true} className="mb-8" />
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">Or continue with email</span>
                  </div>
                </div>
              </>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input
                    placeholder="Your professional name"
                    value={formData.name}
                    onChange={(e) => {
                      handleChange('name', e.target.value);
                      if (errors.name) setErrors({...errors, name: ''});
                    }}
                    className={errors.name ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => {
                      handleChange('email', e.target.value);
                      if (errors.email) setErrors({...errors, email: ''});
                    }}
                    className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                    disabled={!isNewUser}
                    required
                  />
                  {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
                </div>
              </div>

              {/* Password for new users */}
              {isNewUser && (
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      handleChange('password', e.target.value);
                      if (errors.password) setErrors({...errors, password: ''});
                    }}
                    className={errors.password ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {errors.password && <p className="text-red-600 text-sm">{errors.password}</p>}
                  {formData.password && <PasswordStrengthIndicator password={formData.password} />}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => {
                      handleChange('phone', e.target.value);
                      if (errors.phone) setErrors({...errors, phone: ''});
                    }}
                    className={errors.phone ? 'border-red-500 focus:ring-red-500' : ''}
                  />
                  {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Select 
                    value={formData.country} 
                    onValueChange={(v) => {
                      handleChange('country', v);
                      const selectedCountry = locationService.getCountries().find(c => c.name === v);
                      if (selectedCountry) {
                        handleChange('currency', selectedCountry.currency);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {locationService.getCountries().map(c => (
                        <SelectItem key={c.code} value={c.name}>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label>City/Location *</Label>
                <Input
                  ref={locationInputRef}
                  placeholder="City, State/Region"
                  value={formData.location}
                  onChange={(e) => {
                    handleChange('location', e.target.value);
                    if (errors.location) setErrors({...errors, location: ''});
                  }}
                  onFocus={() => { if (locationSuggestions.length > 0) setShowSuggestions(true); }}
                  className={errors.location ? 'border-red-500 focus:ring-red-500' : ''}
                  autoComplete="off"
                  required
                />
                {errors.location && <p className="text-red-600 text-sm">{errors.location}</p>}
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

              {/* Professional Info */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Specialty *</Label>
                  <Select value={formData.specialty} onValueChange={(v) => handleChange('specialty', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Years of Experience</Label>
                  <Select value={formData.experienceYears} onValueChange={(v) => handleChange('experienceYears', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10,15,20].map(year => (
                        <SelectItem key={year} value={year.toString()}>{year} year{year > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Hourly Rate ({getCurrencySymbol(formData.currency)}) *</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="150"
                    value={formData.pricePerHour}
                    onChange={(e) => {
                      handleChange('pricePerHour', e.target.value);
                      if (errors.pricePerHour) setErrors({...errors, pricePerHour: ''});
                    }}
                    className={errors.pricePerHour ? 'border-red-500 focus:ring-red-500' : ''}
                    required
                  />
                  {errors.pricePerHour && <p className="text-red-600 text-sm">{errors.pricePerHour}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Professional Bio</Label>
                <Textarea
                  placeholder="Tell clients about yourself, your style, and experience..."
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Photography Style Tags */}
              <div className="space-y-4">
                <Label>Photography Style Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={formData.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profile Picture URL</Label>
                <Input
                  placeholder="https://example.com/your-photo.jpg"
                  value={formData.avatar_url}
                  onChange={(e) => handleChange('avatar_url', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Add a professional headshot URL for your profile.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Portfolio URLs</Label>
                <Textarea
                  placeholder="Paste image URLs (one per line)..."
                  value={formData.portfolio}
                  onChange={(e) => handleChange('portfolio', e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Add links to your best work. One URL per line.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 hover:from-purple-700 hover:via-pink-700 hover:to-red-600 text-white font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Profile...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Camera className="h-5 w-5" />
                    {isNewUser ? 'Create Account & Profile' : 'Create Photographer Profile'}
                  </div>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your profile will be reviewed by our team before being published.
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}