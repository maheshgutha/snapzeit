import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { X, Calendar as CalendarIcon, Clock, CreditCard, CheckCircle, ShieldCheck, Lock, ChevronRight, ChevronLeft } from 'lucide-react';
import { openRazorpayCheckout } from '@/utils/payment-service';
import { apiClient, getAuthHeaders } from '@/integrations/api/client';
import { toast } from 'sonner';
import { formatPrice, formatPriceLocal } from '@/lib/currency';
import { startOfToday } from 'date-fns';

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface BookingSystemProps {
  photographerName: string;
  photographerId: string;
  pricePerHour: number;
  currency?: string;
  onClose: () => void;
}

export function BookingSystem({ photographerName, photographerId, pricePerHour, currency = 'USD', onClose }: BookingSystemProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    eventType: 'portrait'
  });

  // Packages are priced in the photographer's own currency — that's what gets
  // charged. Viewers from other regions see a converted approximation next to
  // it. The authoritative price is recomputed server-side at booking time.
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

  // Local-currency approximation shown alongside the real price when they differ.
  const approxLocal = (amount: number) => {
    const local = formatPriceLocal(amount, currency);
    return local !== formatPrice(amount, currency) ? local : null;
  };

  const eventTypes = [
    'Wedding', 'Portrait', 'Event', 'Commercial', 'Fashion', 'Family', 'Maternity', 'Corporate'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      if (step === 1 && !selectedPackage) return;
      if (step === 2 && (!selectedDate || !bookingForm.name || !bookingForm.email)) {
         toast.error("Please fill out all required details and select a date.");
         return;
      }
      setStep(step + 1);
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date for your session.');
      return;
    }

    const selectedPkg = packages.find(p => p.id === selectedPackage);
    if (!selectedPkg) return;

    const { data: { user } } = await apiClient.auth.getUser();
    if (!user) {
      toast.error("Please login to book.");
      return;
    }

    try {
      // The server prices the booking from the photographer's stored rate and
      // records the platform fee — client numbers are display-only.
      const resp = await fetch(`${getBaseUrl()}/api/bookings/request`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          photographer_id: photographerId,
          booking_date: selectedDate.toISOString().split('T')[0],
          start_time: '10:00:00',
          duration_hours: selectedPkg.hours,
          event_type: bookingForm.eventType,
          notes: bookingForm.message,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || json.error) {
        toast.error(json.error?.message || 'Booking request failed');
        return;
      }

      const booking = json.data;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const isRazorpayConfigured = razorpayKey && razorpayKey !== "rzp_test_YOUR_KEY_ID";

      if (!isRazorpayConfigured) {
        toast.success('Booking request sent!', {
          description: `${formatPrice(booking.total_amount, booking.currency)} — the photographer will confirm and payment will be arranged.`,
        });
        onClose();
        return;
      }

      // Payment: order is created server-side, pinned to this booking
      const orderResp = await fetch(`${getBaseUrl()}/api/bookings/${booking.id}/pay-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const orderJson = await orderResp.json();
      if (!orderResp.ok || orderJson.error) {
        toast.info('Booking saved as pending — payment could not be started.', {
          description: orderJson.error?.message || orderJson.error?.description,
        });
        onClose();
        return;
      }

      await openRazorpayCheckout({
        order: orderJson.data,
        description: `Booking for ${photographerName} - ${selectedPkg.name}`,
        name: bookingForm.name,
        email: bookingForm.email,
        contact: bookingForm.phone,
        onSuccess: async (response) => {
          const confirmResp = await fetch(`${getBaseUrl()}/api/bookings/${booking.id}/confirm-payment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(response),
          });
          const confirmJson = await confirmResp.json();
          if (confirmResp.ok && !confirmJson.error) {
            toast.success(`Booking Confirmed! Paid ${formatPrice(booking.total_amount, booking.currency)}.`);
          } else {
            toast.error(confirmJson.error?.message || 'Payment confirmation failed. Contact support.');
          }
          onClose();
        },
        onFailure: (error) => {
          toast.info('Payment not completed — your booking is saved as pending.', {
            description: error?.description || error?.message,
          });
          onClose();
        },
      });
    } catch (err: any) {
      console.error('Booking failed:', err);
      toast.error('Booking failed: ' + err.message);
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
          <div className="flex gap-2 mb-6 border-b pb-4">
            <div className={`flex-1 text-center py-2 ${step >= 1 ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-400'}`}>1. Package</div>
            <div className={`flex-1 text-center py-2 ${step >= 2 ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-400'}`}>2. Details</div>
            <div className={`flex-1 text-center py-2 ${step >= 3 ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-gray-400'}`}>3. Review & Pay</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Package Selection */}
            {step === 1 && (
            <div className="animate-fade-in-up">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
                      <div className="mb-3">
                        <div className="text-2xl font-bold text-blue-600">{formatPrice(pkg.price, currency)}</div>
                        {approxLocal(pkg.price) && (
                          <div className="text-xs text-muted-foreground">≈ {approxLocal(pkg.price)} in your currency</div>
                        )}
                      </div>
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
            )}

            {/* Step 2: Date & Details */}
            {step === 2 && (
            <div className="grid md:grid-cols-2 gap-8 animate-fade-in-up">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  Select Date
                </h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < startOfToday()}
                  className="rounded-md border"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
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
            )}

            {/* Step 3: Booking Summary & Payment */}
            {step === 3 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
                <h4 className="font-bold mb-4 text-xl">Booking Summary</h4>
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
                    <strong>Total: {formatPrice(selectedPkg?.price || 0, currency)}</strong>
                  </p>
                  {approxLocal(selectedPkg?.price || 0) && (
                    <p className="text-xs text-muted-foreground">≈ {approxLocal(selectedPkg?.price || 0)} in your currency · charged in {currency}</p>
                  )}
                </div>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl text-sm font-medium text-emerald-800 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  <span>Buyer Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  <span>Secure SSL Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Verified Professional</span>
                </div>
              </div>
              </div>
            </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4 border-t mt-6">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(step - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              )}
              
              {step < 3 ? (
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 transition-transform active:scale-95 text-white"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay & Confirm Booking
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}