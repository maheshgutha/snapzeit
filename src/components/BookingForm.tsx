import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addHours } from 'date-fns';
import { apiClient } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { CalendarIcon, Clock, MapPin } from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface Photographer {
  id: string;
  name: string;
  price_per_hour: number;
  currency?: string;
}

interface BookingFormProps {
  photographer: Photographer;
}

const EVENT_TYPES = ['Wedding', 'Portrait', 'Event', 'Corporate', 'Family', 'Maternity', 'Product', 'Other'];
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function BookingForm({ photographer }: BookingFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('2');
  const [eventType, setEventType] = useState('');
  const [location, setLocation] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalAmount = photographer.price_per_hour * parseInt(duration);

  const fetchLocationSuggestions = async (query: string) => {
    setLocationLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setLocationSuggestions(data.map((item: any) => item.display_name));
      setShowSuggestions(true);
    } catch (e) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    if (value.length >= 3) {
      fetchLocationSuggestions(value);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocation(suggestion);
    setShowSuggestions(false);
    setLocationSuggestions([]);
    if (locationInputRef.current) {
      locationInputRef.current.blur();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to be logged in to book a photographer.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!date || !startTime || !eventType || !location) {
      toast({
        title: 'Missing information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${startTime}`);
    const endDateTime = addHours(startDateTime, parseInt(duration));

    const { error } = await apiClient.from('bookings').insert({
      user_id: user.id,
      photographer_id: photographer.id,
      booking_date: format(date, 'yyyy-MM-dd'),
      start_time: startTime,
      end_time: format(endDateTime, 'HH:mm'),
      event_type: eventType,
      location,
      notes,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
    });

    if (error) {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Booking submitted!',
        description: 'The photographer will confirm your booking soon.',
      });
      navigate('/bookings');
    }

    setLoading(false);
  };

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Book {photographer.name}</span>
        </CardTitle>
        <div className="text-2xl font-bold text-primary">
          {formatPrice(photographer.price_per_hour, photographer.currency || 'USD')}
          <span className="text-sm font-normal text-muted-foreground">/hour</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time *</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Duration *</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 8].map(h => (
                    <SelectItem key={h} value={h.toString()}>{h} hour{h > 1 ? 's' : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Event Type */}
          <div className="space-y-2">
            <Label>Event Type *</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label>Location *</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={locationInputRef}
                placeholder="Enter venue address"
                value={location}
                onChange={(e) => handleLocationChange(e.target.value)}
                onFocus={() => { if (locationSuggestions.length > 0) setShowSuggestions(true); }}
                className="pl-10"
                autoComplete="off"
                required
              />
              {showSuggestions && locationSuggestions.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded shadow-md mt-1 max-h-48 overflow-auto">
                  {locationLoading ? (
                    <li className="p-2 text-sm text-muted-foreground">Loading...</li>
                  ) : (
                    locationSuggestions.map((suggestion, idx) => (
                      <li
                        key={idx}
                        className="p-2 text-sm cursor-pointer hover:bg-primary/10"
                        onMouseDown={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes</Label>
            <Textarea
              placeholder="Any special requirements or details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{formatPrice(photographer.price_per_hour, photographer.currency || 'USD')} × {duration} hours</span>
              <span>{formatPrice(totalAmount, photographer.currency || 'USD')}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span className="text-primary">{formatPrice(totalAmount, photographer.currency || 'USD')}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full gradient-primary h-12 text-lg"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Request Booking'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            You won't be charged until the photographer confirms your booking
          </p>
        </form>
      </CardContent>
    </Card>
  );
}