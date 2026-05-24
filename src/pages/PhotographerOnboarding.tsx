import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, MapPin, AlertCircle } from 'lucide-react';
import { apiClient } from '@/integrations/api/client';
import { toast } from 'sonner';
import { validatePhone, validatePrice } from '@/utils/formValidation';

export default function PhotographerOnboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    phone: '', location: '', country: 'United States',
    specialty: 'Wedding', experience: '2', bio: '', pricePerHour: '150',
    tags: []
  });
  
  const [errors, setErrors] = useState({
    phone: '', location: '', pricePerHour: ''
  });

  const specialties = ['Wedding', 'Portrait', 'Event', 'Commercial', 'Fashion', 'Family', 'Maternity', 'Corporate'];
  const popularTags = ['Natural Light', 'Studio', 'Outdoor', 'Candid', 'Editorial', 'Fine Art', 'Vintage', 'Modern'];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user already has photographer profile
    const checkExistingProfile = async () => {
      const { data } = await supabase
        .from('photographers')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (data) {
        navigate('/photographer/dashboard');
      }
    };
    
    checkExistingProfile();
  }, [user, navigate]);

  const validateForm = () => {
    const phoneValidation = validatePhone(form.phone);
    const priceValidation = validatePrice(form.pricePerHour);
    const locationValid = form.location.length >= 2;
    
    setErrors({
      phone: phoneValidation.message,
      location: locationValid ? '' : 'Location is required',
      pricePerHour: priceValidation.message
    });
    
    return phoneValidation.isValid && priceValidation.isValid && locationValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    
    try {
      // Create photographer profile
      const { error: profileError } = await supabase
        .from('photographers')
        .insert({
          user_id: user!.id,
          name: user!.user_metadata?.full_name || user!.email?.split('@')[0] || 'Photographer',
          email: user!.email!,
          phone: form.phone,
          location: form.location,
          country: form.country,
          specialty: form.specialty,
          experience_years: parseInt(form.experience) || 2,
          bio: form.bio,
          price_per_hour: parseFloat(form.pricePerHour) || 150,
          tags: form.tags,
          portfolio: [],
          rating: 5.0,
          review_count: 0
        });

      if (profileError) {
        toast.error('Failed to create photographer profile');
        return;
      }

      // Update user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user!.id,
          role: 'photographer'
        });

      if (roleError) {
        console.warn('Role assignment warning:', roleError);
      }

      toast.success('Photographer profile created successfully!');
      navigate('/photographer/dashboard');
      
    } catch (error) {
      toast.error('Failed to create photographer profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      
      <section className="py-20 container">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="text-center pb-8 pt-10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Camera className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Complete Your Profile
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Welcome {user.user_metadata?.full_name || user.email}! Let's set up your photographer profile.
              </p>
            </CardHeader>
            
            <CardContent className="p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Location */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Country
                    </Label>
                    <Select value={form.country} onValueChange={(value) => setForm({...form, country: value})}>
                      <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Australia">Australia</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                        <SelectItem value="Germany">Germany</SelectItem>
                        <SelectItem value="France">France</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      City/Location *
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="New York, NY"
                        value={form.location}
                        onChange={(e) => {
                          setForm({...form, location: e.target.value});
                          if (errors.location) setErrors({...errors, location: ''});
                        }}
                        className={`pl-11 h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                          errors.location ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-purple-500'
                        }`}
                        required
                      />
                    </div>
                    {errors.location && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Professional Info */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Specialty
                    </Label>
                    <Select value={form.specialty} onValueChange={(value) => setForm({...form, specialty: value})}>
                      <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {specialties.map(specialty => (
                          <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Experience (years)
                    </Label>
                    <Select value={form.experience} onValueChange={(value) => setForm({...form, experience: value})}>
                      <SelectTrigger className="h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10,15,20].map(year => (
                          <SelectItem key={year} value={year.toString()}>{year} year{year > 1 ? 's' : ''}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Price per Hour ($) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="150"
                      value={form.pricePerHour}
                      onChange={(e) => {
                        setForm({...form, pricePerHour: e.target.value});
                        if (errors.pricePerHour) setErrors({...errors, pricePerHour: ''});
                      }}
                      className={`h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                        errors.pricePerHour ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-purple-500'
                      }`}
                      required
                    />
                    {errors.pricePerHour && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.pricePerHour}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({...form, phone: e.target.value});
                      if (errors.phone) setErrors({...errors, phone: ''});
                    }}
                    className={`h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                      errors.phone ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-purple-500'
                    }`}
                  />
                  {errors.phone && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Professional Bio
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell potential clients about your photography style, experience, and what makes you unique..."
                    value={form.bio}
                    onChange={(e) => setForm({...form, bio: e.target.value})}
                    rows={4}
                    className="bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Photography Style Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={form.tags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer hover:scale-105 transition-transform px-3 py-1"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
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
                      Complete Photographer Profile
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}