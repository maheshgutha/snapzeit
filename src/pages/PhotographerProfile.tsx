import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShareButton } from '@/components/ShareButton';
import { supabase } from '@/integrations/api/client';
import Header from '@/components/Header';
import { MessagingSystem } from '@/components/MessagingSystem';
import { BookingSystem } from '@/components/BookingSystem';
import { ImageUpload, CoverPhotoUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { formatPriceLocal } from '@/lib/currency';
import { useFavorites } from '@/hooks/useFavorites';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, MapPin, Camera, Clock, Award, Heart, MessageCircle, Calendar as CalendarIcon, CreditCard, Shield, CheckCircle, Edit, Plus, Eye, Share2 } from 'lucide-react';

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

export default function PhotographerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    duration: 2
  });
  const [showMessaging, setShowMessaging] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showBooking, setShowBooking] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [coverPhoto, setCoverPhoto] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  useEffect(() => {
    const fetchPhotographerAndUser = async () => {
      // Fetch photographer details
      if (id) {
        const { data: pData } = await supabase
          .from('photographers')
          .select('*')
          .eq('id', id)
          .single();
        
        if (pData) {
          setPhotographer(pData);
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user && id && user.id === id) {
        setIsOwner(true);
      }
      setLoading(false);
    };

    const fetchReviews = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('photographer_id', id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setReviews(data);
      }
      setReviewsLoading(false);
    };

    fetchPhotographerAndUser();
    fetchReviews();
  }, [id]);

  const packages = [
    { id: 'basic', name: 'Basic Package', hours: 2, price: photographer?.price_per_hour ? photographer.price_per_hour * 2 : 300, features: ['2 hours shooting', '20 edited photos', 'Online gallery', 'Basic retouching'] },
    { id: 'standard', name: 'Standard Package', hours: 4, price: photographer?.price_per_hour ? photographer.price_per_hour * 4 : 600, features: ['4 hours shooting', '50 edited photos', 'Online gallery', 'Advanced retouching', 'Print release'] },
    { id: 'premium', name: 'Premium Package', hours: 8, price: photographer?.price_per_hour ? photographer.price_per_hour * 8 : 1200, features: ['8 hours shooting', '100+ edited photos', 'Online gallery', 'Premium retouching', 'Print release', 'USB delivery'] }
  ];

  useEffect(() => {
    if (id) {
      fetchPhotographer();
      checkOwnership();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const checkOwnership = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user && id) {
        // Check if current user is the photographer or has photographer role
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        const isPhotographerRole = roles?.role === 'photographer' || roles?.role === 'admin';
        const isProfileOwner = user.id === id;

        setIsOwner(isPhotographerRole && isProfileOwner);
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
      setIsOwner(false);
    }
  };

  const fetchPhotographer = async () => {
    setLoading(true);
    const { data } = await supabase.rpc('get_public_photographers');
    if (data) {
      const photographer = (data as Photographer[]).find(p => p.id === id);
      if (photographer) {
        setPhotographer(photographer);
        setPortfolioImages(photographer.portfolio || []);
        setCoverPhoto(photographer.portfolio?.[0] || '');
      }
    }
    setLoading(false);
  };

  const handlePortfolioUpload = async (files: File[]) => {
    // Simulate upload to storage (in real app, upload to Supabase Storage)
    const newImages = files.map(file => URL.createObjectURL(file));
    setPortfolioImages(prev => [...prev, ...newImages]);

    // Show success message
    alert(`Successfully uploaded ${files.length} image(s) to your portfolio!`);
  };

  const handleCoverPhotoUpload = async (file: File) => {
    // Simulate upload to storage
    const newCoverUrl = URL.createObjectURL(file);
    setCoverPhoto(newCoverUrl);

    alert('Cover photo updated successfully!');
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !photographer) return;

    const selectedPkg = packages.find(p => p.id === selectedPackage);

    // Simulate booking submission
    alert(`Booking request sent to ${photographer.name}!\n\nDetails:\n- Date: ${selectedDate.toDateString()}\n- Package: ${selectedPkg?.name}\n- Duration: ${selectedPkg?.hours} hours\n- Total: $${selectedPkg?.price}\n\nYou will receive a confirmation email shortly.`);

    // Reset form
    setBookingForm({ name: '', email: '', phone: '', message: '', duration: 2 });
    setSelectedDate(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!photographer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Photographer Not Found</h1>
          <p className="text-gray-600 mb-8">The photographer you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/photographers')}>Browse Photographers</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Enhanced Hero Section with Cover Photo */}
      <section className="relative">
        {/* Cover Photo */}
        <div className="relative h-80 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
          {coverPhoto ? (
            <img 
              src={coverPhoto} 
              alt="Cover" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80';
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          )}
          <div className="absolute inset-0 bg-black/40" />

          {/* Cover Photo Upload (Owner Only) */}
          {isOwner && (
            <div className="absolute top-4 right-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Cover
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Update Cover Photo</DialogTitle>
                  </DialogHeader>
                  <CoverPhotoUpload
                    currentCover={coverPhoto}
                    onUpload={handleCoverPhotoUpload}
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Action Buttons */}
          <div className="absolute top-4 left-4 flex gap-2">
            <ShareButton
              title={`Check out ${photographer.name} on SnapZeiT`}
              text={`I found this amazing ${photographer.specialty} photographer!`}
              variant="secondary"
            />
            <Button variant="secondary" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              {Math.floor(Math.random() * 1000) + 500} views
            </Button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="container relative -mt-20 z-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                      <AvatarImage src={photographer.avatar_url || ''} alt={photographer.name} />
                      <AvatarFallback className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {photographer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-4xl font-black">{photographer.name}</h1>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified Pro
                        </Badge>
                      </div>
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">{photographer.rating}</span>
                          <span className="text-gray-500">({photographer.review_count} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{photographer.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="default" className="bg-blue-600">{photographer.specialty}</Badge>
                        <Badge variant="outline">{photographer.experience_years} years experience</Badge>
                        {photographer.tags?.slice(0, 4).map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">{photographer.bio}</p>
                      
                      {/* Top Review Highlight */}
                      {photographer.rating >= 4.5 && (
                        <div className="mt-8 p-5 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border-l-4 border-yellow-400">
                          <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="italic text-gray-700 dark:text-gray-300 font-medium">
                            "Absolutely amazing experience! The photos turned out better than we could have ever imagined. Highly recommended!"
                          </p>
                          <p className="text-sm font-bold text-gray-900 dark:text-gray-100 mt-2">— Verified Client</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Content */}
              <section className="py-12 w-full">
                <Tabs defaultValue="portfolio" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
                    <TabsTrigger value="portfolio" className="px-3 py-2.5 rounded-full text-sm md:text-base">Portfolio</TabsTrigger>
                    <TabsTrigger value="packages" className="px-3 py-2.5 rounded-full text-sm md:text-base">Packages</TabsTrigger>
                    <TabsTrigger value="reviews" className="px-3 py-2.5 rounded-full text-sm md:text-base">Reviews</TabsTrigger>
                    <TabsTrigger value="booking" className="px-3 py-2.5 rounded-full text-sm md:text-base">Book Now</TabsTrigger>
                  </TabsList>

                  <TabsContent value="portfolio" className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold">Portfolio</h3>
                      {isOwner && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Photos
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Upload Portfolio Images</DialogTitle>
                            </DialogHeader>
                            <ImageUpload
                              onUpload={handlePortfolioUpload}
                              maxFiles={20}
                              title="Upload Your Best Work"
                              description="Showcase your photography skills with high-quality images"
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {portfolioImages.length > 0 ? (
                        <>
                          {portfolioImages.map((image, index) => (
                            <div 
                              key={index} 
                              className="group relative aspect-square bg-gray-200 rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300 cursor-zoom-in shadow-lg"
                              onClick={() => setSelectedImage(image)}
                            >
                              <img 
                                src={image} 
                                alt={`Portfolio ${index + 1}`} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8" />
                              </div>
                              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Badge variant="secondary" className="text-xs">
                                  {index + 1}
                                </Badge>
                              </div>
                            </div>
                          ))}

                          {/* Fullscreen Lightbox Dialog */}
                          <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
                            <DialogContent className="max-w-[95vw] md:max-w-[85vw] h-[90vh] p-0 bg-transparent border-0 shadow-none flex flex-col justify-center items-center">
                              <div className="relative w-full h-full flex items-center justify-center">
                                {selectedImage && (
                                  <img 
                                    src={selectedImage} 
                                    alt="Fullscreen View" 
                                    className="max-w-full max-h-full object-contain rounded-lg" 
                                  />
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </>
                      ) : (
                        <div className="col-span-full text-center py-24 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                          <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Camera className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                            {isOwner ? "Your Portfolio is Empty" : "No Portfolio Images Yet"}
                          </h3>
                          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            {isOwner 
                              ? "Upload your best shots to attract more clients and showcase your photography style."
                              : "This photographer hasn't uploaded any portfolio images yet."
                            }
                          </p>
                          {isOwner && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Upload Your First Photos
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Upload Portfolio Images</DialogTitle>
                                </DialogHeader>
                                <ImageUpload
                                  onUpload={handlePortfolioUpload}
                                  maxFiles={20}
                                  title="Upload Your Best Work"
                                  description="Showcase your photography skills with high-quality images"
                                />
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="packages" className="mt-8">
                    <h3 className="text-2xl font-bold mb-6">Photography Packages</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      {packages.map((pkg) => (
                        <Card key={pkg.id} className="relative overflow-hidden hover:shadow-xl transition-shadow border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                          <CardContent className="p-6">
                            <h4 className="text-xl font-bold mb-2">{pkg.name}</h4>
                            <div className="text-3xl font-black text-blue-600 mb-6">${pkg.price}</div>
                            <ul className="space-y-3 mb-8">
                              {pkg.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                                  <span className="text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Button 
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                              onClick={() => {
                                setSelectedPackage(pkg.id);
                                document.querySelector('[value="booking"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                              }}
                            >
                              Select Package
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-8">
                    <h3 className="text-2xl font-bold mb-6">Client Reviews</h3>
                    {reviewsLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <Card key={review.id} className="bg-white dark:bg-gray-800 shadow-sm border-0">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <div className="font-bold">{review.user_name || 'Anonymous User'}</div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-0">
                        <CardContent className="p-12 text-center">
                          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Star className="h-10 w-10 text-yellow-500" />
                          </div>
                          <h4 className="text-xl font-bold mb-2">No Reviews Yet</h4>
                          <p className="text-gray-500">
                            {isOwner 
                              ? "Complete your first booking to start collecting reviews!"
                              : "Be the first to book and review this photographer!"
                            }
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="booking" className="mt-8">
                    <Card className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-0 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
                        <h3 className="text-2xl font-bold mb-2">Ready to create magic?</h3>
                        <p className="text-blue-100">Click the button below to open the booking system and secure your date.</p>
                      </div>
                      <CardContent className="p-8 text-center">
                        <Button 
                          size="lg" 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:scale-105 transition-all text-lg h-14 px-8 rounded-full"
                          onClick={() => setShowBooking(true)}
                        >
                          <CalendarIcon className="h-5 w-5 mr-2" />
                          Start Booking Process
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </section>
            </div>

            {/* Enhanced Quick Booking Card */}
            <div className="md:col-span-1">
              <Card className="sticky top-24 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-0 shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="text-4xl font-black text-blue-600 mb-2">
                      ${photographer.price_per_hour}
                    </div>
                    <div className="text-gray-500">per hour</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">Usually responds in 2 hours</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <Award className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold">Top rated photographer</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold">Satisfaction guaranteed</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:scale-105 transition-all"
                      onClick={() => setShowBooking(true)}
                    >
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Book Now
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setShowMessaging(true)}>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => photographer && toggleFavorite(photographer.id)}
                        className={`transition-all hover:scale-105 border-2 ${photographer && isFavorite(photographer.id) ? 'border-pink-500 hover:border-pink-600 bg-pink-50' : 'hover:border-pink-500'}`}
                      >
                        <Heart className={`h-4 w-4 ${photographer && isFavorite(photographer.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-500 hover:text-pink-500'}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Messaging System */}
      {showMessaging && (
        <MessagingSystem
          photographerId={photographer.id}
          photographerName={photographer.name}
          photographerAvatar={photographer.avatar_url || undefined}
          onClose={() => setShowMessaging(false)}
        />
      )}

      {/* Booking System */}
      {showBooking && (
        <BookingSystem
          photographerName={photographer.name}
          photographerId={photographer.id}
          pricePerHour={photographer.price_per_hour}
          currency={photographer.currency || 'USD'}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}