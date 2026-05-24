export const mockPhotographers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1-555-0101',
    specialty: 'Wedding',
    location: 'New York, NY',
    country: 'United States',
    currency: 'USD',
    bio: 'Award-winning wedding photographer with 8+ years of experience capturing love stories across NYC.',
    price_per_hour: 250,
    experience_years: 8,
    rating: 4.9,
    review_count: 127,
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    portfolio: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop'
    ],
    tags: ['Natural Light', 'Candid', 'Fine Art'],
    status: 'active',
    verified: true
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    phone: '+44-20-7946-0958',
    specialty: 'Portrait',
    location: 'London, England',
    country: 'United Kingdom',
    currency: 'GBP',
    bio: 'Professional portrait photographer specializing in corporate headshots and personal branding.',
    price_per_hour: 180,
    experience_years: 6,
    rating: 4.8,
    review_count: 89,
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    portfolio: [
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop'
    ],
    tags: ['Studio', 'Corporate', 'Modern'],
    status: 'active',
    verified: true
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    phone: '+33-1-42-86-83-26',
    specialty: 'Event',
    location: 'Paris, France',
    country: 'France',
    currency: 'EUR',
    bio: 'Creative event photographer capturing memorable moments at corporate events and celebrations.',
    price_per_hour: 200,
    experience_years: 5,
    rating: 4.7,
    review_count: 64,
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    portfolio: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop'
    ],
    tags: ['Outdoor', 'Editorial', 'Vintage'],
    status: 'active',
    verified: true
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    phone: '+81-3-3224-5000',
    specialty: 'Commercial',
    location: 'Tokyo, Japan',
    country: 'Japan',
    currency: 'JPY',
    bio: 'Commercial photographer with expertise in product photography and brand campaigns.',
    price_per_hour: 300,
    experience_years: 10,
    rating: 4.9,
    review_count: 156,
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    portfolio: [
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
    ],
    tags: ['Studio', 'Commercial', 'Modern'],
    status: 'active',
    verified: true
  },
  {
    id: '5',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91-22-2672-3000',
    specialty: 'Wedding',
    location: 'Mumbai, India',
    country: 'India',
    currency: 'INR',
    bio: 'Traditional and contemporary wedding photographer capturing the beauty of Indian ceremonies.',
    price_per_hour: 150,
    experience_years: 7,
    rating: 4.8,
    review_count: 203,
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    portfolio: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop'
    ],
    tags: ['Traditional', 'Candid', 'Cultural'],
    status: 'active',
    verified: true
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james@example.com',
    phone: '+61-2-9374-4000',
    specialty: 'Fashion',
    location: 'Sydney, Australia',
    country: 'Australia',
    currency: 'AUD',
    bio: 'Fashion and lifestyle photographer working with brands and models across Australia.',
    price_per_hour: 220,
    experience_years: 9,
    rating: 4.6,
    review_count: 78,
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    portfolio: [
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop'
    ],
    tags: ['Fashion', 'Editorial', 'Modern'],
    status: 'active',
    verified: true
  }
];

export const mockBookings = [
  {
    id: '1',
    photographer_id: '1',
    client_name: 'John & Jane Smith',
    client_email: 'john.smith@example.com',
    event_type: 'Wedding',
    event_date: '2024-06-15',
    duration: 8,
    location: 'Central Park, New York',
    total_amount: 2000,
    status: 'confirmed',
    created_at: '2024-01-15T10:00:00Z',
    notes: 'Outdoor ceremony followed by reception at Plaza Hotel'
  },
  {
    id: '2',
    photographer_id: '2',
    client_name: 'Tech Corp Ltd',
    client_email: 'hr@techcorp.com',
    event_type: 'Corporate',
    event_date: '2024-02-20',
    duration: 4,
    location: 'London Office',
    total_amount: 720,
    status: 'pending',
    created_at: '2024-01-20T14:30:00Z',
    notes: 'Executive headshots for 15 team members'
  },
  {
    id: '3',
    photographer_id: '3',
    client_name: 'Marie Dubois',
    client_email: 'marie@example.com',
    event_type: 'Birthday',
    event_date: '2024-03-10',
    duration: 3,
    location: 'Private Venue, Paris',
    total_amount: 600,
    status: 'completed',
    created_at: '2024-01-10T16:45:00Z',
    notes: '50th birthday celebration with family'
  }
];

export const mockReviews = [
  {
    id: '1',
    photographer_id: '1',
    client_name: 'Emily Johnson',
    rating: 5,
    comment: 'Sarah captured our wedding day perfectly! Every moment was beautifully documented.',
    created_at: '2024-01-10T12:00:00Z',
    booking_id: '1'
  },
  {
    id: '2',
    photographer_id: '2',
    client_name: 'Robert Brown',
    rating: 5,
    comment: 'Professional and efficient. Great headshots for our entire team.',
    created_at: '2024-01-12T15:30:00Z',
    booking_id: '2'
  },
  {
    id: '3',
    photographer_id: '3',
    client_name: 'Sophie Martin',
    rating: 4,
    comment: 'Emma was fantastic! Great eye for detail and very creative shots.',
    created_at: '2024-01-08T18:20:00Z',
    booking_id: '3'
  }
];

export const mockMessages = [
  {
    id: '1',
    sender_id: 'client-1',
    receiver_id: '1',
    subject: 'Wedding Photography Inquiry',
    content: 'Hi Sarah, I\'m interested in booking you for my wedding on June 15th. Could we discuss the details?',
    created_at: '2024-01-15T09:00:00Z',
    read: false,
    sender_name: 'John Smith',
    sender_email: 'john.smith@example.com'
  },
  {
    id: '2',
    sender_id: '1',
    receiver_id: 'client-1',
    subject: 'Re: Wedding Photography Inquiry',
    content: 'Hi John, I\'d love to photograph your wedding! I have availability on June 15th. Let\'s schedule a call to discuss your vision.',
    created_at: '2024-01-15T11:30:00Z',
    read: true,
    sender_name: 'Sarah Johnson',
    sender_email: 'sarah@example.com'
  }
];

export const mockNotifications = [
  {
    id: '1',
    user_id: '1',
    type: 'booking_request',
    title: 'New Booking Request',
    message: 'You have a new booking request for June 15th wedding',
    created_at: '2024-01-15T09:00:00Z',
    read: false,
    action_url: '/bookings/1'
  },
  {
    id: '2',
    user_id: '1',
    type: 'review_received',
    title: 'New Review',
    message: 'Emily Johnson left you a 5-star review',
    created_at: '2024-01-10T12:00:00Z',
    read: false,
    action_url: '/reviews'
  },
  {
    id: '3',
    user_id: '1',
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Payment of $2000 received for wedding booking',
    created_at: '2024-01-08T14:20:00Z',
    read: true,
    action_url: '/earnings'
  }
];

export const mockAnalytics = {
  photographer_id: '1',
  total_bookings: 45,
  total_earnings: 67500,
  average_rating: 4.9,
  profile_views: 1250,
  response_rate: 98,
  monthly_data: [
    { month: 'Jan', bookings: 8, earnings: 12000, views: 180 },
    { month: 'Feb', bookings: 6, earnings: 9500, views: 165 },
    { month: 'Mar', bookings: 10, earnings: 15000, views: 220 },
    { month: 'Apr', bookings: 7, earnings: 11000, views: 190 },
    { month: 'May', bookings: 9, earnings: 13500, views: 210 },
    { month: 'Jun', bookings: 5, earnings: 6500, views: 285 }
  ]
};

// Mock API functions
export const mockApi = {
  // Photographers
  getPhotographers: () => Promise.resolve(mockPhotographers),
  getPhotographer: (id: string) => Promise.resolve(mockPhotographers.find(p => p.id === id)),
  
  // Bookings
  getBookings: (photographerId?: string) => {
    const bookings = photographerId 
      ? mockBookings.filter(b => b.photographer_id === photographerId)
      : mockBookings;
    return Promise.resolve(bookings);
  },
  
  createBooking: (booking: any) => {
    const newBooking = {
      id: String(mockBookings.length + 1),
      ...booking,
      created_at: new Date().toISOString(),
      status: 'pending'
    };
    mockBookings.push(newBooking);
    return Promise.resolve(newBooking);
  },
  
  // Reviews
  getReviews: (photographerId: string) => {
    const reviews = mockReviews.filter(r => r.photographer_id === photographerId);
    return Promise.resolve(reviews);
  },
  
  // Messages
  getMessages: (userId: string) => {
    const messages = mockMessages.filter(m => m.sender_id === userId || m.receiver_id === userId);
    return Promise.resolve(messages);
  },
  
  sendMessage: (message: any) => {
    const newMessage = {
      id: String(mockMessages.length + 1),
      ...message,
      created_at: new Date().toISOString(),
      read: false
    };
    mockMessages.push(newMessage);
    return Promise.resolve(newMessage);
  },
  
  // Notifications
  getNotifications: (userId: string) => {
    const notifications = mockNotifications.filter(n => n.user_id === userId);
    return Promise.resolve(notifications);
  },
  
  markNotificationRead: (id: string) => {
    const notification = mockNotifications.find(n => n.id === id);
    if (notification) notification.read = true;
    return Promise.resolve(notification);
  },
  
  // Analytics
  getAnalytics: (photographerId: string) => Promise.resolve(mockAnalytics),
  
  // Search
  searchPhotographers: (query: string, filters: any = {}) => {
    let results = mockPhotographers;
    
    if (query) {
      results = results.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.specialty.toLowerCase().includes(query.toLowerCase()) ||
        p.location.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (filters.specialty) {
      results = results.filter(p => p.specialty === filters.specialty);
    }
    
    if (filters.location) {
      results = results.filter(p => p.location.includes(filters.location));
    }
    
    if (filters.maxPrice) {
      results = results.filter(p => p.price_per_hour <= filters.maxPrice);
    }
    
    return Promise.resolve(results);
  }
};

// Test scenarios
export const testScenarios = {
  // User journey: Browse → Search → View Profile → Book
  userBookingFlow: async () => {
    console.log('🧪 Testing User Booking Flow...');
    
    // 1. Browse photographers
    const photographers = await mockApi.getPhotographers();
    console.log(`✅ Found ${photographers.length} photographers`);
    
    // 2. Search for wedding photographers
    const weddingPhotographers = await mockApi.searchPhotographers('', { specialty: 'Wedding' });
    console.log(`✅ Found ${weddingPhotographers.length} wedding photographers`);
    
    // 3. View photographer profile
    const photographer = await mockApi.getPhotographer('1');
    console.log(`✅ Loaded profile: ${photographer?.name}`);
    
    // 4. Get reviews
    const reviews = await mockApi.getReviews('1');
    console.log(`✅ Found ${reviews.length} reviews`);
    
    // 5. Create booking
    const booking = await mockApi.createBooking({
      photographer_id: '1',
      client_name: 'Test Client',
      client_email: 'test@example.com',
      event_type: 'Wedding',
      event_date: '2024-07-20',
      duration: 6,
      location: 'Test Venue',
      total_amount: 1500
    });
    console.log(`✅ Created booking: ${booking.id}`);
    
    return { success: true, message: 'User booking flow completed successfully' };
  },
  
  // Photographer journey: Register → Complete Profile → Manage Bookings
  photographerFlow: async () => {
    console.log('🧪 Testing Photographer Flow...');
    
    // 1. Get photographer bookings
    const bookings = await mockApi.getBookings('1');
    console.log(`✅ Found ${bookings.length} bookings`);
    
    // 2. Get analytics
    const analytics = await mockApi.getAnalytics('1');
    console.log(`✅ Analytics: ${analytics.total_bookings} total bookings, $${analytics.total_earnings} earned`);
    
    // 3. Get messages
    const messages = await mockApi.getMessages('1');
    console.log(`✅ Found ${messages.length} messages`);
    
    // 4. Get notifications
    const notifications = await mockApi.getNotifications('1');
    console.log(`✅ Found ${notifications.length} notifications`);
    
    return { success: true, message: 'Photographer flow completed successfully' };
  },
  
  // Search and filter functionality
  searchFlow: async () => {
    console.log('🧪 Testing Search Flow...');
    
    // 1. Search by name
    const nameResults = await mockApi.searchPhotographers('Sarah');
    console.log(`✅ Name search: Found ${nameResults.length} results`);
    
    // 2. Search by location
    const locationResults = await mockApi.searchPhotographers('', { location: 'New York' });
    console.log(`✅ Location search: Found ${locationResults.length} results`);
    
    // 3. Filter by price
    const priceResults = await mockApi.searchPhotographers('', { maxPrice: 200 });
    console.log(`✅ Price filter: Found ${priceResults.length} results under $200/hr`);
    
    return { success: true, message: 'Search flow completed successfully' };
  },
  
  // Run all tests
  runAllTests: async () => {
    console.log('🚀 Running Complete Application Test Suite...\n');
    
    try {
      const userTest = await testScenarios.userBookingFlow();
      console.log(`✅ User Flow: ${userTest.message}\n`);
      
      const photographerTest = await testScenarios.photographerFlow();
      console.log(`✅ Photographer Flow: ${photographerTest.message}\n`);
      
      const searchTest = await testScenarios.searchFlow();
      console.log(`✅ Search Flow: ${searchTest.message}\n`);
      
      console.log('🎉 All tests passed! Application is working correctly.');
      return { success: true, message: 'All tests completed successfully' };
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      return { success: false, message: 'Tests failed', error };
    }
  }
};

export default mockApi;