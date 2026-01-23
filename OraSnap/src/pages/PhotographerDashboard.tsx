import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { ImageUpload, CoverPhotoUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Camera, Calendar, DollarSign, Star, Users, TrendingUp, MessageCircle,
  Settings, Edit, Plus, Eye, Heart, Award, Clock, MapPin, Loader2
} from 'lucide-react';

export default function PhotographerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  const [photographer, setPhotographer] = useState({
    id: '',
    name: '',
    specialty: '',
    location: '',
    rating: 0,
    reviewCount: 0,
    totalBookings: 0,
    totalEarnings: 0,
    profileViews: 124, // Mock for now
    responseRate: 95, // Mock for now
    price_per_hour: 0,
    bio: '',
    avatar: ''
  });

  const [bookings, setBookings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Photographer Profile
      const { data: profile, error: profileError } = await supabase
        .from('photographers')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) return;

      setPortfolioImages(profile.portfolio || []);

      // 2. Fetch Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('photographer_id', profile.id)
        .order('booking_date', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Map bookings with client names (fetching profiles manually for now since no direct relation)
      let mappedBookings: any[] = [];
      if (bookingsData && bookingsData.length > 0) {
        const userIds = [...new Set(bookingsData.map(b => b.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, email')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

        mappedBookings = bookingsData.map(b => ({
          id: b.id,
          client: profileMap.get(b.user_id)?.full_name || 'Unknown Client', // Accessing full_name from profile
          type: b.event_type,
          date: b.booking_date,
          status: b.status,
          amount: b.total_amount
        }));
      }
      setBookings(mappedBookings);

      // 3. Calculate Stats
      const totalEarnings = mappedBookings
        .filter(b => b.status === 'completed' || b.status === 'paid')
        .reduce((sum, b) => sum + Number(b.amount), 0);

      const totalBookings = mappedBookings.length;

      // 4. Update Photographer State
      setPhotographer({
        id: profile.id,
        name: profile.name,
        specialty: profile.specialty,
        location: profile.location,
        rating: Number(profile.rating) || 5.0,
        reviewCount: profile.review_count || 0,
        totalBookings,
        totalEarnings,
        profileViews: 1240, // Mocked
        responseRate: 98, // Mocked
        price_per_hour: profile.price_per_hour,
        bio: profile.bio || '',
        avatar: profile.avatar_url || ''
      });

      // 5. Fetch Messages (Mocking slightly if table empty, but trying real fetch)
      // Assuming messages table has sender_id.
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('recipient_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (messagesData) {
        // Fetch sender details
        const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', senderIds);

        const senders = profilesData as any[];
        const senderMap = new Map(senders?.map(s => [s.user_id, s]) || []);

        const mappedMessages = messagesData.map((m: any) => ({
          id: m.id,
          client: senderMap.get(m.sender_id)?.full_name || 'Unknown User',
          message: m.content,
          time: new Date(m.created_at).toLocaleDateString(),
          unread: !m.is_read
        }));

        if (mappedMessages.length > 0) {
          setMessages(mappedMessages);
        } else {
          // Keep some mock messages for empty state visualization if needed, or set empty
          // setMessages([]); 
          // Leaving the hardcoded messages as fallback if real data is empty? No, cleaner to show empty.
          // But user asked for dashboard, maybe they want to see it populated. 
          // I'll leave the initial state empty and if empty populate with "No messages".
        }
      }

    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePortfolioUpload = async (files: File[]) => {
    if (!photographer.id) return;

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${photographer.id}/${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Update photographer record
      const newPortfolio = [...portfolioImages, ...uploadedUrls];
      const { error: updateError } = await supabase
        .from('photographers')
        .update({ portfolio: newPortfolio })
        .eq('id', photographer.id);

      if (updateError) throw updateError;

      setPortfolioImages(newPortfolio);
      toast({ title: "Success", description: "Portfolio updated successfully!" });
    } catch (error: any) {
      toast({ title: "Error", description: "Upload failed: " + error.message, variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Dashboard Header */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={photographer.avatar} />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl">
                  {photographer.name?.charAt(0) || 'P'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{photographer.name}</h1>
                <p className="text-gray-600 dark:text-gray-300">{photographer.specialty} • {photographer.location}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{photographer.rating}</span>
                    <span className="text-gray-500">({photographer.reviewCount} reviews)</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <Award className="h-3 w-3 mr-1" />
                    Verified Pro
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/photographer/${photographer.id}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="py-8 container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                  <p className="text-2xl font-bold">${photographer.totalEarnings.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
                  <p className="text-2xl font-bold">{photographer.totalBookings}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profile Views</p>
                  <p className="text-2xl font-bold">{photographer.profileViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Response Rate</p>
                  <p className="text-2xl font-bold">{photographer.responseRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs defaultValue="bookings" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map(booking => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{booking.client}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.type} • {booking.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <span className="font-bold">${booking.amount}</span>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {messages.map(message => (
                    <div key={message.id} className={`p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${message.unread ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{message.client.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{message.client}</h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{message.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{message.time}</p>
                          {message.unread && (
                            <Badge className="mt-1 bg-blue-600">New</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Portfolio Management
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
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
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {portfolioImages.map((image, index) => (
                    <div key={index} className="relative group aspect-square bg-gray-200 rounded-lg overflow-hidden">
                      <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>January 2024</span>
                      <span className="font-bold">$4,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>December 2023</span>
                      <span className="font-bold">$3,800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>November 2023</span>
                      <span className="font-bold">$5,100</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h3 className="font-semibold">Bank Account</h3>
                      <p className="text-sm text-gray-600">****1234 - Primary</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={photographer.name} />
                    </div>
                    <div>
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input id="specialty" defaultValue={photographer.specialty} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell potential clients about your photography style..."
                      rows={4}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" defaultValue={photographer.location} />
                    </div>
                    <div>
                      <Label htmlFor="price">Price per Hour ($)</Label>
                      <Input id="price" type="number" defaultValue="250" />
                    </div>
                  </div>

                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}