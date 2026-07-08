import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { X, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle } from 'lucide-react';
import { initiatePayment } from '@/utils/payment-service';
import { apiClient, getAuthHeaders } from '@/integrations/api/client';
import { toast } from 'sonner';

interface BookingSystemProps {
  photographerName: string;
  photographerId: string;
  pricePerHour: number;
  onClose: () => void;
}

export function BookingSystem({ photographerName, photographerId, pricePerHour, onClose }: BookingSystemProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    eventType: 'portrait'
  });

  const packages = [
    {
      id: 'basic',
      name: 'Basic Package',
      hours: 2,
      price: pricePerHour * 2,
      features: ['2 hours shooting', '20 edited photos', 'Online gallery', 'Basic retouching']
    },
    {
      id: 'standard',
      name: 'Standard Package',
      hours: 4,
      price: pricePerHour * 4,
      features: ['4 hours shooting', '50 edited photos', 'Online gallery', 'Advanced retouching', 'Print release']
    },
    {
      id: 'premium',
      name: 'Premium Package',
      hours: 8,
      price: pricePerHour * 8,
      features: ['8 hours shooting', '100+ edited photos', 'Online gallery', 'Premium retouching', 'Print release', 'USB delivery']
    }
  ];

  const eventTypes = [
    'Wedding', 'Portrait', 'Event', 'Commercial', 'Fashion', 'Family', 'Maternity', 'Corporate'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error('Please select a date for your session.');
      return;
    }

    const selectedPkg = packages.find(p => p.id === selectedPackage);
    if (!selectedPkg) return;

    // Check if Razorpay key is configured
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    const isRazorpayConfigured = razorpayKey && razorpayKey !== "rzp_test_YOUR_KEY_ID";

    if (isRazorpayConfigured) {
      // Initiate Razorpay Payment
      initiatePayment({
        amount: selectedPkg.price,
        currency: "INR",
        name: bookingForm.name,
        description: `Booking for ${photographerName} - ${selectedPkg.name}`,
        email: bookingForm.email,
        contact: bookingForm.phone,
        onSuccess: async (response) => {
          try {
            const apiBase = import.meta.env.VITE_API_BASE_URL || '';
            const verifyResp = await fetch(`${apiBase}/api/payments/verify-signature`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyJson = await verifyResp.json();
            if (verifyResp.ok && verifyJson.data?.verified) {
              await createBooking(response, 'paid');
            } else {
              console.error('Payment verification failed', verifyJson.error || verifyJson);
              toast.error('Payment verification failed. Please contact support.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            toast.error('Payment verification error.');
          }
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          toast.error(`Payment Failed: ${error.description || 'Reason unknown'}`);
        }
      });
    } else {
      // Bypass Payment (Mock Mode)
      console.warn("Razorpay key not configured. Using Mock Payment.");
      const { data: { user } } = await apiClient.auth.getUser();
      if (!user) {
        toast.error("Please login to book.");
        return;
      }
      // Simulate API delay
      toast.info("Test Mode: Simulating successful payment...");
      setTimeout(async () => {
        // Insert a pending booking via generic DB endpoint for mock mode
        const apiBase = import.meta.env.VITE_API_BASE_URL || '';
        const selectedPkg = packages.find(p => p.id === selectedPackage);
        const bookingData = {
          user_id: user.id,
          photographer_id: photographerId,
          booking_date: selectedDate!.toISOString().split('T')[0],
          start_time: '10:00:00',
          end_time: '12:00:00',
          event_type: bookingForm.eventType,
          location: 'Client Location',
          total_amount: selectedPkg?.price,
          payment_status: 'pending',
          payment_intent_id: 'mock_payment_id_' + Date.now(),
          status: 'pending',
          created_at: new Date().toISOString()
        };

        await fetch(`${apiBase}/api/db/bookings`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(bookingData)
        });
        toast.success('Booking simulated (mock).');
        onClose();
      }, 1000);
    }
  };

  const createBooking = async (paymentRespOrId: any, paymentStatus: string) => {
    try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '';

    const selectedPkg = packages.find(p => p.id === selectedPackage);
    if (!selectedPkg) return;

    const { data: { user } } = await apiClient.auth.getUser();
    if (!user) {
      toast.error("Please login to book.");
      return;
    }

    const bookingData = {
      user_id: user.id,
      photographer_id: photographerId,
      booking_date: selectedDate!.toISOString().split('T')[0],
      start_time: '10:00:00',
      end_time: '12:00:00',
      event_type: bookingForm.eventType,
      location: 'Client Location',
      total_amount: selectedPkg.price,
      status: 'confirmed'
    };

    // If paymentRespOrId is an object (Razorpay response), call server booking endpoint
    if (typeof paymentRespOrId === 'object' && paymentRespOrId.razorpay_payment_id) {
      const body = {
        booking: bookingData,
        razorpay_order_id: paymentRespOrId.razorpay_order_id,
        razorpay_payment_id: paymentRespOrId.razorpay_payment_id,
        razorpay_signature: paymentRespOrId.razorpay_signature
      };

      const resp = await fetch(`${apiBase}/api/payments/create-booking`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });

      const json = await resp.json();
      if (!resp.ok) {
        throw new Error(json?.error?.message || 'Booking creation failed');
      }

      toast.success(`Booking Confirmed! Reference: ${json.data.payment_intent_id}`);
      onClose();
      return;
    }

    // Fallback: if paymentRespOrId is a string id, insert via generic DB endpoint
    if (typeof paymentRespOrId === 'string') {
      const fallback = { ...bookingData, payment_status: paymentStatus, payment_intent_id: paymentRespOrId, created_at: new Date().toISOString() };
      await fetch(`${apiBase}/api/db/bookings`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(fallback) });
      toast.success(`Booking Confirmed! Reference: ${paymentRespOrId}`);
      onClose();
      return;
    }
    } catch (err: any) {
      console.error("Booking creation failed:", err);
      toast.error("Booking creation failed: " + err.message);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBookingForm(prev => ({ ...prev, [field]: value }));
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-6 border-b">
          <div>
            <CardTitle className="text-2xl font-bold">Book {photographerName}</CardTitle>
            <p className="text-gray-600 mt-1">Complete your booking in 3 simple steps</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Package Selection */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
                Choose Your Package
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {packages.map(pkg => (
                  <Card
                    key={pkg.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${selectedPackage === pkg.id ? 'ring-2 ring-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{pkg.name}</h4>
                        {selectedPackage === pkg.id && (
                          <Badge className="bg-blue-600">Selected</Badge>
                        )}
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-3">${pkg.price}</div>
                      <ul className="space-y-1 text-sm">
                        {pkg.features.map(feature => (
                          <li key={feature} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Step 2: Date & Details */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Your Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select value={bookingForm.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map(type => (
                          <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your full name"
                      value={bookingForm.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={bookingForm.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="Your phone number"
                      value={bookingForm.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Special Requirements</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your vision, location preferences, or any special requirements..."
                      value={bookingForm.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
              <h4 className="font-bold mb-4">Booking Summary</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Photographer:</strong> {photographerName}</p>
                  <p><strong>Package:</strong> {selectedPkg?.name}</p>
                  <p><strong>Duration:</strong> {selectedPkg?.hours} hours</p>
                </div>
                <div>
                  <p><strong>Date:</strong> {selectedDate ? selectedDate.toDateString() : 'Not selected'}</p>
                  <p><strong>Event Type:</strong> {bookingForm.eventType}</p>
                  <p className="text-lg font-bold text-blue-600 mt-2">
                    <strong>Total: ${selectedPkg?.price}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!selectedDate || !bookingForm.name || !bookingForm.email}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Send Booking Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}