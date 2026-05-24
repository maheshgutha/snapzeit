import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  total_amount: number;
  commission_rate: number;
  status: string;
  payment_status: string;
  photographers?: { country?: string; location?: string };
}

interface RevenueChartsProps {
  bookings: Booking[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F'];

export default function RevenueCharts({ bookings }: RevenueChartsProps) {
  const completedBookings = bookings.filter(b => b.status === 'completed');

  const dailyData = useMemo(() => {
    const grouped: Record<string, { date: string; revenue: number; commission: number; bookings: number }> = {};
    
    completedBookings.forEach(b => {
      const date = b.booking_date;
      if (!grouped[date]) {
        grouped[date] = { date, revenue: 0, commission: 0, bookings: 0 };
      }
      grouped[date].revenue += Number(b.total_amount);
      grouped[date].commission += Number(b.total_amount) * Number(b.commission_rate || 0.05);
      grouped[date].bookings += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  }, [completedBookings]);

  const weeklyData = useMemo(() => {
    const grouped: Record<string, { week: string; revenue: number; commission: number; bookings: number }> = {};
    
    completedBookings.forEach(b => {
      const date = new Date(b.booking_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!grouped[weekKey]) {
        grouped[weekKey] = { week: weekKey, revenue: 0, commission: 0, bookings: 0 };
      }
      grouped[weekKey].revenue += Number(b.total_amount);
      grouped[weekKey].commission += Number(b.total_amount) * Number(b.commission_rate || 0.05);
      grouped[weekKey].bookings += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
      .slice(-12); // Last 12 weeks
  }, [completedBookings]);

  const monthlyData = useMemo(() => {
    const grouped: Record<string, { month: string; revenue: number; commission: number; bookings: number }> = {};
    
    completedBookings.forEach(b => {
      const date = new Date(b.booking_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped[monthKey]) {
        grouped[monthKey] = { month: monthKey, revenue: 0, commission: 0, bookings: 0 };
      }
      grouped[monthKey].revenue += Number(b.total_amount);
      grouped[monthKey].commission += Number(b.total_amount) * Number(b.commission_rate || 0.05);
      grouped[monthKey].bookings += 1;
    });

    return Object.values(grouped)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }, [completedBookings]);

  const countryData = useMemo(() => {
    const grouped: Record<string, number> = {};
    completedBookings.forEach(b => {
      const country = b.photographers?.country || 'Unknown';
      grouped[country] = (grouped[country] || 0) + Number(b.total_amount);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [completedBookings]);

  const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const totalCommission = completedBookings.reduce((sum, b) => sum + Number(b.total_amount) * Number(b.commission_rate || 0.05), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From {completedBookings.length} completed bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">~{((totalCommission / totalRevenue) * 100 || 0).toFixed(1)}% of revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Booking Value</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalRevenue / completedBookings.length || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per completed booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily">
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Revenue" />
                  <Area type="monotone" dataKey="commission" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Commission" />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="weekly" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="commission" fill="#82ca9d" name="Commission" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="monthly" className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} name="Revenue" />
                  <Area type="monotone" dataKey="commission" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} name="Commission" />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Revenue by Country */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Country</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={countryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {countryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}