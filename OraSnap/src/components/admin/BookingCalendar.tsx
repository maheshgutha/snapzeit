import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location: string;
  status: string;
  total_amount: number;
  photographers?: { name: string };
}

interface BookingCalendarProps {
  bookings: Booking[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function BookingCalendar({ bookings }: BookingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    bookings.forEach(b => {
      const dateKey = b.booking_date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(b);
    });
    return grouped;
  }, [bookings]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border/50 bg-muted/20" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayBookings = bookingsByDate[dateStr] || [];
      const isToday = new Date().toISOString().split('T')[0] === dateStr;

      days.push(
        <div
          key={day}
          className={`h-24 border border-border/50 p-1 overflow-hidden ${
            isToday ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-muted/50'
          }`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-y-auto max-h-16">
            {dayBookings.slice(0, 3).map(booking => (
              <div
                key={booking.id}
                className={`text-xs p-1 rounded truncate text-white ${STATUS_COLORS[booking.status] || 'bg-gray-500'}`}
                title={`${booking.photographers?.name || 'Unknown'} - ${booking.event_type}`}
              >
                {booking.start_time.slice(0, 5)} {booking.photographers?.name || 'N/A'}
              </div>
            ))}
            {dayBookings.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{dayBookings.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const monthStats = useMemo(() => {
    const monthBookings = bookings.filter(b => {
      const bDate = new Date(b.booking_date);
      return bDate.getFullYear() === year && bDate.getMonth() === month;
    });

    return {
      total: monthBookings.length,
      pending: monthBookings.filter(b => b.status === 'pending').length,
      confirmed: monthBookings.filter(b => b.status === 'confirmed').length,
      completed: monthBookings.filter(b => b.status === 'completed').length,
      cancelled: monthBookings.filter(b => b.status === 'cancelled').length,
      revenue: monthBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + Number(b.total_amount), 0),
    };
  }, [bookings, year, month]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <span className="font-medium min-w-32 text-center">
              {monthNames[month]} {year}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Month Stats */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline">{monthStats.total} Total</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">{monthStats.pending} Pending</Badge>
          <Badge className="bg-blue-100 text-blue-800">{monthStats.confirmed} Confirmed</Badge>
          <Badge className="bg-green-100 text-green-800">{monthStats.completed} Completed</Badge>
          <Badge className="bg-red-100 text-red-800">{monthStats.cancelled} Cancelled</Badge>
          <Badge variant="secondary">${monthStats.revenue.toFixed(2)} Revenue</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0 mb-1">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {renderCalendarDays()}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-sm">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-sm">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-sm">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-sm">Cancelled</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}