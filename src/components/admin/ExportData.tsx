import { useState } from 'react';
import { supabase } from '@/integrations/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, FileSpreadsheet, Users, Camera, Calendar, Loader2 } from 'lucide-react';

export default function ExportData() {
  const { toast } = useToast();
  const [exporting, setExporting] = useState<string | null>(null);

  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) {
      toast({ title: 'No data', description: 'No records to export', variant: 'destructive' });
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          const stringValue = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma or newline
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportUsers = async () => {
    setExporting('users');
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, email, phone, city, is_blocked, created_at');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      downloadCSV(data, 'users');
      toast({ title: 'Success', description: `Exported ${data.length} users` });
    }
    setExporting(null);
  };

  const exportPhotographers = async () => {
    setExporting('photographers');
    const { data, error } = await supabase
      .from('photographers')
      .select('id, name, email, phone, specialty, location, country, price_per_hour, currency, rating, review_count, status, is_blocked, is_featured, created_at');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      downloadCSV(data, 'photographers');
      toast({ title: 'Success', description: `Exported ${data.length} photographers` });
    }
    setExporting(null);
  };

  const exportBookings = async () => {
    setExporting('bookings');
    const { data, error } = await supabase
      .from('bookings')
      .select('id, booking_date, start_time, end_time, event_type, location, status, payment_status, total_amount, commission_rate, created_at');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      downloadCSV(data, 'bookings');
      toast({ title: 'Success', description: `Exported ${data.length} bookings` });
    }
    setExporting(null);
  };

  const exportFinancialReport = async () => {
    setExporting('financial');
    const { data, error } = await supabase
      .from('bookings')
      .select('id, booking_date, total_amount, commission_rate, status, payment_status, payment_date')
      .eq('status', 'completed');

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else if (data) {
      const reportData = data.map(b => ({
        booking_id: b.id,
        date: b.booking_date,
        gross_amount: b.total_amount,
        commission_rate: b.commission_rate,
        commission_amount: (Number(b.total_amount) * Number(b.commission_rate || 0.05)).toFixed(2),
        net_payout: (Number(b.total_amount) * (1 - Number(b.commission_rate || 0.05))).toFixed(2),
        payment_status: b.payment_status,
        payment_date: b.payment_date,
      }));
      downloadCSV(reportData, 'financial_report');
      toast({ title: 'Success', description: `Exported ${data.length} financial records` });
    }
    setExporting(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Data
        </CardTitle>
        <CardDescription>Download data as CSV files for reporting and analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">Users</p>
                  <p className="text-sm text-muted-foreground">Export all user profiles</p>
                </div>
              </div>
              <Button onClick={exportUsers} disabled={exporting === 'users'}>
                {exporting === 'users' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Camera className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="font-medium">Photographers</p>
                  <p className="text-sm text-muted-foreground">Export all photographers</p>
                </div>
              </div>
              <Button onClick={exportPhotographers} disabled={exporting === 'photographers'}>
                {exporting === 'photographers' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Bookings</p>
                  <p className="text-sm text-muted-foreground">Export all bookings</p>
                </div>
              </div>
              <Button onClick={exportBookings} disabled={exporting === 'bookings'}>
                {exporting === 'bookings' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-dashed border-green-200 bg-green-50/50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Download className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Financial Report</p>
                  <p className="text-sm text-muted-foreground">Revenue & commission report</p>
                </div>
              </div>
              <Button onClick={exportFinancialReport} disabled={exporting === 'financial'} className="bg-green-600 hover:bg-green-700">
                {exporting === 'financial' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}