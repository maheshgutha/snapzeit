import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, Camera, Star, MapPin, Clock, MessageCircle, 
  Download, Eye, Heart, Award, CreditCard, CheckCircle, X 
} from 'lucide-react';

export default function Bookings() {
  const [bookings] = useState([
    {
      id: 1,
      photographer: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
        specialty: 'Wedding Photography',
        rating: 4.9,
        location: 'New York, NY'
      },
      type: 'Wedding Photography',
      date: '2024-03-15',
      time: '10:00 AM',
      duration: 8,
      status: 'confirmed',
      amount: 2500,
      package: 'Premium Wedding Package',
      location: 'Central Park, NYC',
      notes: 'Outdoor ceremony followed by indoor reception',
      photos: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop']
    },
    {
      id: 2,
      photographer: {
        name: 'Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        specialty: 'Portrait Photography',
        rating: 4.8,
        location: 'Los Angeles, CA'
      },
      type: 'Family Portrait',
      date: '2024-02-28',
      time: '2:00 PM',
      duration: 2,
      status: 'completed',
      amount: 400,
      package: 'Family Portrait Session',
      location: 'Griffith Observatory',
      notes: 'Golden hour family photos with city backdrop',
      photos: [
        'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop'
      ]
    },
    {
      id: 3,
      photographer: {
        name: 'Emma Wilson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        specialty: 'Event Photography',
        rating: 4.7,
        location: 'Chicago, IL'
      },
      type: 'Corporate Event',
      date: '2024-02-20',
      time: '6:00 PM',
      duration: 4,
      status: 'pending',
      amount: 800,
      package: 'Corporate Event Coverage',
      location: 'Hyatt Regency Chicago',
      notes: 'Annual company gala and awards ceremony'
    }
  ]);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <Award className="h-4 w-4" />;
      case 'cancelled': return <X className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Page Header */}
      <section className="py-12 bg-white dark:bg-gray-800 border-b">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-gray-600 dark:text-gray-300">Manage your photography sessions and view your photos</p>
            </div>
            <Link to="/photographers">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Camera className="h-4 w-4 mr-2" />
                Book New Session
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bookings Content */}
      <section className="py-8 container">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past Sessions ({pastBookings.length})</TabsTrigger>
          </TabsList>

          {/* Upcoming Bookings */}
          <TabsContent value="upcoming">
            <div className="space-y-6">
              {upcomingBookings.map(booking => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={booking.photographer.avatar} alt={booking.photographer.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            {booking.photographer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{booking.type}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{booking.photographer.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{booking.photographer.rating}</span>
                                <span>•</span>
                                <span>{booking.photographer.specialty}</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span>{booking.date} at {booking.time}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            <span><strong>Package:</strong> {booking.package}</span>
                            <span><strong>Duration:</strong> {booking.duration} hours</span>
                            <span><strong>Total:</strong> <span className="font-bold text-green-600">${booking.amount}</span></span>
                          </div>
                          
                          {booking.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              <strong>Notes:</strong> {booking.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Booking Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Photographer</Label>
                                  <p className="font-semibold">{booking.photographer.name}</p>
                                </div>
                                <div>
                                  <Label>Session Type</Label>
                                  <p className="font-semibold">{booking.type}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Date & Time</Label>
                                  <p className="font-semibold">{booking.date} at {booking.time}</p>
                                </div>
                                <div>
                                  <Label>Duration</Label>
                                  <p className="font-semibold">{booking.duration} hours</p>
                                </div>
                              </div>
                              <div>
                                <Label>Location</Label>
                                <p className="font-semibold">{booking.location}</p>
                              </div>
                              {booking.notes && (
                                <div>
                                  <Label>Special Notes</Label>
                                  <p>{booking.notes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        
                        {booking.status === 'pending' && (
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {upcomingBookings.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Upcoming Bookings</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Ready to capture some amazing moments? Book your next photography session.
                    </p>
                    <Link to="/photographers">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Camera className="h-4 w-4 mr-2" />
                        Find Photographers
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Past Bookings */}
          <TabsContent value="past">
            <div className="space-y-6">
              {pastBookings.map(booking => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={booking.photographer.avatar} alt={booking.photographer.name} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                            {booking.photographer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{booking.type}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusIcon(booking.status)}
                              <span className="ml-1 capitalize">{booking.status}</span>
                            </Badge>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{booking.photographer.name}</p>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{booking.photographer.rating}</span>
                                <span>•</span>
                                <span>{booking.photographer.specialty}</span>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <Calendar className="h-4 w-4" />
                                <span>{booking.date}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.location}</span>
                              </div>
                            </div>
                          </div>
                          
                          {booking.photos && booking.photos.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-semibold mb-2">Photos ({booking.photos.length})</p>
                              <div className="flex gap-2">
                                {booking.photos.slice(0, 3).map((photo, index) => (
                                  <img
                                    key={index}
                                    src={photo}
                                    alt={`Photo ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded-lg border"
                                  />
                                ))}
                                {booking.photos.length > 3 && (
                                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg border flex items-center justify-center text-sm font-semibold">
                                    +{booking.photos.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {booking.photos && booking.photos.length > 0 && (
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            <Download className="h-4 w-4 mr-2" />
                            Download Photos
                          </Button>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Gallery
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-2" />
                          Leave Review
                        </Button>
                        
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4 mr-2" />
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pastBookings.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Past Sessions</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your completed photography sessions will appear here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}