import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar, Camera, Star, MapPin, Clock, MessageCircle,
  Download, Eye, Heart, Award, CreditCard, CheckCircle, X, Loader2, Package, Printer, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { reviewPhotographer } from '@/utils/bidirectional-reviews';

export default function Bookings() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [rentalBookings, setRentalBookings] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedRentalReceipt, setSelectedRentalReceipt] = useState<any | null>(null);
  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const submitReview = async () => {
    if (!reviewBooking || !user) return;
    setSubmittingReview(true);
    const review = await reviewPhotographer(
      reviewBooking.id,
      reviewBooking.photographerId,
      user.id,
      reviewRating,
      reviewComment.trim()
    );
    setSubmittingReview(false);

    if (review) {
      toast({ title: 'Review submitted', description: 'Thanks for sharing your experience!' });
      setReviewBooking(null);
      setReviewRating(5);
      setReviewComment('');
    } else {
      toast({
        title: 'Could not submit review',
        description: 'You may have already reviewed this booking, or it is not completed yet.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchBookings();
      fetchRentalBookings();
      fetchMyLeads();
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user!.id)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      // Enrich with photographer details (embedded joins aren't supported by the API)
      const photographerIds = Array.from(new Set((data || []).map((b: any) => b.photographer_id).filter(Boolean)));
      const photographerMap = new Map<string, any>();
      if (photographerIds.length > 0) {
        const { data: photographers } = await supabase
          .from('photographers')
          .select('*')
          .in('id', photographerIds);
        (photographers || []).forEach((p: any) => photographerMap.set(p.id, p));
      }

      const mappedBookings = (data || []).map((b: any) => {
        b.photographers = photographerMap.get(b.photographer_id);
        // Calculate duration
        const start = new Date(`2000-01-01T${b.start_time}`);
        const end = new Date(`2000-01-01T${b.end_time}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

        return {
          id: b.id,
          photographerId: b.photographer_id,
          photographer: {
            name: b.photographers?.name || 'Unknown Photographer',
            avatar: b.photographers?.avatar_url,
            specialty: b.photographers?.specialty || 'Photography',
            rating: b.photographers?.rating || 5.0,
            location: b.photographers?.location || 'Unknown Location'
          },
          type: b.event_type,
          date: new Date(b.booking_date).toLocaleDateString(),
          time: new Date(`2000-01-01T${b.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: Math.max(duration, 0),
          status: b.status,
          amount: b.total_amount,
          package: 'Standard Package', // Default for now
          location: b.location,
          notes: b.special_requests,
          photos: [] // Photos functionality linked to another table usually
        };
      });

      setBookings(mappedBookings);
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRentalBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('rental_bookings')
        .select('*')
        .eq('renter_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich with equipment details (embedded joins aren't supported by the API)
      const equipmentIds = Array.from(new Set((data || []).map((r: any) => r.equipment_id).filter(Boolean)));
      const equipmentMap = new Map<string, any>();
      if (equipmentIds.length > 0) {
        const { data: equipment } = await supabase
          .from('equipment')
          .select('*')
          .in('id', equipmentIds);
        (equipment || []).forEach((e: any) => equipmentMap.set(e.id, e));
      }

      setRentalBookings((data || []).map((r: any) => ({ ...r, equipment: equipmentMap.get(r.equipment_id) })));
    } catch (error) {
      console.error('Error fetching rentals:', error);
    }
  };

  const fetchMyLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
      case 'returned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed':
      case 'returned': return <Award className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Premium Page Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20" />
        <div className="container relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-2">
                My Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Manage your creative journey: Bookings, Rentals, and Requests
              </p>
            </div>
            <Link to="/photographers">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 border-0">
                <Camera className="h-5 w-5 mr-2" />
                Book New Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bookings Content */}
      <section className="py-8 container">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-1 mb-8">
            <TabsTrigger
              value="upcoming"
              className="px-6 py-3 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white shadow-sm border border-transparent data-[state=active]:border-0 transition-all"
            >
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="rentals"
              className="px-6 py-3 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white shadow-sm border border-transparent data-[state=active]:border-0 transition-all"
            >
              Rentals ({rentalBookings.length})
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="px-6 py-3 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-pink-500 data-[state=active]:text-white shadow-sm border border-transparent data-[state=active]:border-0 transition-all"
            >
              My Requests ({leads.length})
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="px-6 py-3 rounded-full data-[state=active]:bg-gray-200 dark:data-[state=active]:bg-gray-700 shadow-sm border border-transparent data-[state=active]:border-0 transition-all"
            >
              History ({pastBookings.length})
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Bookings */}
          <TabsContent value="upcoming">
            <div className="space-y-6">
              {upcomingBookings.map(booking => (
                <Card key={booking.id} className="glass-card hover:scale-[1.01] transition-all duration-300 border-l-4 border-l-blue-500 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-20 w-20 ring-4 ring-white dark:ring-gray-800 shadow-xl">
                          <AvatarImage src={booking.photographer.avatar} alt={booking.photographer.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold">
                            {booking.photographer.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{booking.type} Session</h3>
                            <Badge className={`${getStatusColor(booking.status)} px-3 py-1 rounded-full shadow-sm`}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </Badge>
                          </div>

                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-lg text-gray-800 dark:text-gray-200">{booking.photographer.name}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span>{booking.photographer.rating.toFixed(1)}</span>
                              <span>•</span>
                              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">{booking.photographer.specialty}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold">{booking.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-purple-500" />
                              <span>{booking.time} ({booking.duration}h)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-red-500" />
                              <span className="truncate max-w-[150px]" title={booking.location}>{booking.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CreditCard className="h-4 w-4 text-green-500" />
                              <span className="font-bold text-green-600">${booking.amount}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                        <Button variant="default" className="w-full bg-blue-600 hover:bg-blue-700 shadow-md">
                          View Details
                        </Button>
                        <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-900/20">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Empty state handles here... */}
            </div>
          </TabsContent>

          {/* MY LEADS TAB */}
          <TabsContent value="leads">
            <div className="space-y-6">
              {leads.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                  <Zap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Quote Requests Yet</h3>
                  <p className="text-gray-500 mt-2">Post a requirement to get quotes from top photographers.</p>
                </div>
              ) : (
                leads.map(lead => (
                  <Card key={lead.id} className="glass-card hover:translate-y-[-2px] transition-all duration-300 border-l-4 border-l-pink-500 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-black text-xl text-gray-900 dark:text-white">{lead.service_type} Request</h3>
                            <Badge className={lead.status === 'open' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                              {lead.status === 'open' ? 'Active & Public' : lead.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            Posted on {new Date(lead.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 border-red-100">
                          Close Request
                        </Button>
                      </div>

                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 mb-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                              <MapPin className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Location</p>
                              <p className="font-medium">{lead.location}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                              <Calendar className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Event Date</p>
                              <p className="font-medium">{lead.event_date ? new Date(lead.event_date).toLocaleDateString() : 'Flexible'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                              <CreditCard className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-bold">Budget</p>
                              <p className="font-medium text-green-600">{lead.budget_range || 'Negotiable'}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-500 uppercase mb-2">Requirements</p>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                          {lead.description || "No specific details provided."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* RENTAL BOOKINGS TAB */}
          <TabsContent value="rentals">
            <div className="space-y-6">
              {rentalBookings.map(rental => (
                <Card key={rental.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Order #{rental.id.slice(0, 8)}
                        </Badge>
                        <Badge className={getStatusColor(rental.status)}>
                          {getStatusIcon(rental.status)}
                          <span className="ml-1 capitalize">{rental.status}</span>
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Booked on {format(new Date(rental.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border bg-gray-100 flex-shrink-0">
                        {rental.equipment?.image_url ? (
                          <img src={rental.equipment.image_url} alt={rental.equipment.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{rental.equipment?.name || 'Unknown Equipment'}</h3>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>
                              {format(new Date(rental.start_date), 'MMM d')} - {format(new Date(rental.end_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-green-600" />
                            <span className="font-bold text-green-600">Total: ${rental.total_price}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRentalReceipt(rental)}
                        >
                          View Receipt
                        </Button>
                        {rental.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Past Bookings Tab */}
          <TabsContent value="past">
            <div className="space-y-6">
              {pastBookings.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No completed sessions yet</h3>
                  <p className="text-gray-500 mt-2">Your finished bookings will appear here.</p>
                </div>
              ) : (
                pastBookings.map(booking => (
                  <Card key={booking.id} className="glass-card border-l-4 border-l-emerald-500 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                        <div className="flex items-start gap-4 flex-1">
                          <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-gray-800 shadow-xl">
                            <AvatarImage src={booking.photographer.avatar} alt={booking.photographer.name} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-bold">
                              {booking.photographer.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{booking.type} Session</h3>
                              <Badge className={`${getStatusColor(booking.status)} px-3 py-1 rounded-full shadow-sm`}>
                                {getStatusIcon(booking.status)}
                                <span className="ml-1 capitalize">{booking.status}</span>
                              </Badge>
                            </div>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{booking.photographer.name}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {booking.date}</span>
                              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {booking.location}</span>
                              <span className="flex items-center gap-1 font-bold text-green-600"><CreditCard className="h-4 w-4" /> ${booking.amount}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 w-full md:w-auto min-w-[140px]">
                          <Button
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md"
                            onClick={() => setReviewBooking(booking)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave a Review
                          </Button>
                          <Link to={`/photographer/${booking.photographerId}`}>
                            <Button variant="outline" className="w-full">
                              Book Again
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* REVIEW DIALOG */}
      <Dialog open={!!reviewBooking} onOpenChange={(open) => !open && setReviewBooking(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review {reviewBooking?.photographer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="mb-2 block">Your rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-8 w-8 ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="review-comment" className="mb-2 block">Your review</Label>
              <Textarea
                id="review-comment"
                placeholder="How was your session?"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewBooking(null)}>Cancel</Button>
            <Button onClick={submitReview} disabled={submittingReview || !reviewComment.trim()}>
              {submittingReview ? 'Submitting…' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RECEIPT DIALOG */}
      <Dialog open={!!selectedRentalReceipt} onOpenChange={(open) => !open && setSelectedRentalReceipt(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center border-b pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="h-6 w-6 text-blue-600" />
                <span className="font-black text-xl">SnapZeiT Rentals</span>
              </div>
              Rental Receipt
            </DialogTitle>
          </DialogHeader>

          {selectedRentalReceipt && (
            <div className="space-y-6 py-4">
              <div className="text-center text-sm text-gray-500">
                <p>Order #{selectedRentalReceipt.id}</p>
                <p>{format(new Date(selectedRentalReceipt.created_at), 'MMMM d, yyyy h:mm a')}</p>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-bold mb-2 text-sm uppercase text-gray-500">Item Details</h4>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold">{selectedRentalReceipt.equipment?.name}</p>
                    <p className="text-xs text-gray-500">{selectedRentalReceipt.equipment?.brand} {selectedRentalReceipt.equipment?.model}</p>
                  </div>
                  <p className="font-semibold">${selectedRentalReceipt.equipment?.daily_rate}/day</p>
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Rental Period: {format(new Date(selectedRentalReceipt.start_date), 'MMM d')} - {format(new Date(selectedRentalReceipt.end_date), 'MMM d')}
                </div>

                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total Paid</span>
                  <span>${selectedRentalReceipt.total_price.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge variant="outline" className="capitalize">{selectedRentalReceipt.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Renter</span>
                  <span>{user?.user_metadata?.full_name || user?.email}</span>
                </div>
              </div>

              <div className="bg-green-50 text-green-700 p-3 rounded-lg text-center text-xs flex items-center justify-center gap-2">
                <CheckCircle className="h-3 w-3" />
                Payment Verified electronically
              </div>
            </div>
          )}

          <DialogFooter>
            <Button className="w-full" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}