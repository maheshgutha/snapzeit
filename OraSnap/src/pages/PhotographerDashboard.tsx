import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Settings, Edit, Plus, Eye, Heart, Award, Clock, MapPin 
} from 'lucide-react';

export default function PhotographerDashboard() {
  const [photographer] = useState({
    name: 'Sarah Johnson',
    specialty: 'Wedding Photography',
    location: 'New York, NY',
    rating: 4.9,
    reviewCount: 127,
    totalBookings: 89,
    totalEarnings: 45600,
    profileViews: 2340,
    responseRate: 98
  });

  const [bookings] = useState([
    { id: 1, client: 'Emily & Michael', type: 'Wedding', date: '2024-02-15', status: 'confirmed', amount: 2500 },
    { id: 2, client: 'Jessica Smith', type: 'Portrait', date: '2024-02-18', status: 'pending', amount: 300 },
    { id: 3, client: 'Tech Corp', type: 'Corporate', date: '2024-02-20', status: 'completed', amount: 800 },
    { id: 4, client: 'Baby Johnson', type: 'Newborn', date: '2024-02-22', status: 'confirmed', amount: 450 }
  ]);

  const [messages] = useState([
    { id: 1, client: 'Emily Rodriguez', message: 'Hi! I love your wedding portfolio...', time: '2 hours ago', unread: true },
    { id: 2, client: 'Mark Thompson', message: 'Are you available for a corporate event...', time: '5 hours ago', unread: true },
    { id: 3, client: 'Lisa Chen', message: 'Thank you for the amazing photos!', time: '1 day ago', unread: false }
  ]);

  const [portfolioImages, setPortfolioImages] = useState([
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop'
  ]);

  const handlePortfolioUpload = (files: File[]) => {
    const newImages = files.map(file => URL.createObjectURL(file));
    setPortfolioImages(prev => [...prev, ...newImages]);
    alert(`Successfully uploaded ${files.length} image(s) to your portfolio!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Dashboard Header */}
      <section className="py-8 bg-white dark:bg-gray-800 border-b">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face" />
                <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl">SJ</AvatarFallback>
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
              <Link to={`/photographer/demo-id`}>
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