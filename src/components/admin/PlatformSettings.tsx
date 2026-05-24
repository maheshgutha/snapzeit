import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2 } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

export default function PlatformSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .order('key');

    if (!error && data) {
      setSettings(data.map(s => ({ ...s, value: JSON.stringify(s.value) })));
      const values: Record<string, string> = {};
      data.forEach(s => {
        values[s.key] = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
      });
      setEditedValues(values);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    for (const [key, value] of Object.entries(editedValues)) {
      let parsedValue;
      try {
        parsedValue = JSON.parse(value);
      } catch {
        parsedValue = value;
      }

      await supabase
        .from('platform_settings')
        .update({ value: parsedValue, updated_at: new Date().toISOString() })
        .eq('key', key);
    }

    toast({ title: 'Success', description: 'Settings saved successfully' });
    setSaving(false);
    fetchSettings();
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>Configure global platform settings</CardDescription>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Commission Rate */}
          <div className="grid gap-2">
            <Label htmlFor="default_commission_rate">Default Commission Rate</Label>
            <div className="flex items-center gap-2">
              <Input
                id="default_commission_rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={editedValues['default_commission_rate'] || '0.05'}
                onChange={(e) => handleValueChange('default_commission_rate', e.target.value)}
                className="w-32"
              />
              <span className="text-muted-foreground">
                ({((parseFloat(editedValues['default_commission_rate'] || '0.05') || 0) * 100).toFixed(0)}%)
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Default commission rate for bookings</p>
          </div>

          {/* Min Booking Hours */}
          <div className="grid gap-2">
            <Label htmlFor="min_booking_hours">Minimum Booking Hours</Label>
            <Input
              id="min_booking_hours"
              type="number"
              min="1"
              value={editedValues['min_booking_hours'] || '1'}
              onChange={(e) => handleValueChange('min_booking_hours', e.target.value)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">Minimum duration for a booking</p>
          </div>

          {/* Max Booking Hours */}
          <div className="grid gap-2">
            <Label htmlFor="max_booking_hours">Maximum Booking Hours</Label>
            <Input
              id="max_booking_hours"
              type="number"
              min="1"
              value={editedValues['max_booking_hours'] || '12'}
              onChange={(e) => handleValueChange('max_booking_hours', e.target.value)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">Maximum duration for a booking</p>
          </div>

          {/* Supported Currencies */}
          <div className="grid gap-2">
            <Label htmlFor="supported_currencies">Supported Currencies</Label>
            <Input
              id="supported_currencies"
              value={editedValues['supported_currencies'] || '["USD", "EUR", "GBP", "INR"]'}
              onChange={(e) => handleValueChange('supported_currencies', e.target.value)}
              placeholder='["USD", "EUR", "GBP"]'
            />
            <p className="text-sm text-muted-foreground">JSON array of supported currency codes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}