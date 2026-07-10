import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/api/client';
import { formatPriceLocal } from '@/lib/currency';
import { useToast } from '@/hooks/use-toast';

interface Equipment {
  id: string;
  name: string;
  category: string;
  brand: string;
  model: string;
  description: string;
  daily_rate: number;
  currency: string;
  image_url: string;
  location: string;
  is_available: boolean;
}

const CATEGORIES = ['Camera', 'Lens', 'Drone', 'Lighting', 'Accessory'];
const CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'];

const emptyForm = {
  name: '', category: 'Camera', brand: '', model: '', description: '',
  daily_rate: '', currency: 'USD', image_url: '', location: '', is_available: true,
};

export function EquipmentManager() {
  const { toast } = useToast();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('equipment').select('*').order('created_at', { ascending: false });
    if (!error && data) setEquipment(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item: Equipment) => {
    setEditing(item);
    setForm({
      name: item.name || '',
      category: item.category || 'Camera',
      brand: item.brand || '',
      model: item.model || '',
      description: item.description || '',
      daily_rate: String(item.daily_rate ?? ''),
      currency: item.currency || 'USD',
      image_url: item.image_url || '',
      location: item.location || '',
      is_available: item.is_available !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const rate = Number(form.daily_rate);
    if (!form.name.trim() || !rate || rate <= 0) {
      toast({ title: 'Missing details', description: 'Name and a positive daily rate are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim(),
      model: form.model.trim(),
      description: form.description.trim(),
      daily_rate: rate,
      currency: form.currency,
      image_url: form.image_url.trim(),
      location: form.location.trim(),
      is_available: form.is_available,
      updated_at: new Date().toISOString(),
    };

    const result = editing
      ? await supabase.from('equipment').eq('id', editing.id).update(payload)
      : await supabase.from('equipment').insert({ ...payload, created_at: new Date().toISOString() });

    setSaving(false);
    if (result.error) {
      toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
      return;
    }
    toast({ title: editing ? 'Equipment updated' : 'Equipment added' });
    setDialogOpen(false);
    fetchEquipment();
  };

  const handleDelete = async (item: Equipment) => {
    if (!window.confirm(`Delete "${item.name}"? Existing rentals keep their records.`)) return;
    const { error } = await supabase.from('equipment').eq('id', item.id).delete();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Equipment deleted' });
    fetchEquipment();
  };

  const toggleAvailability = async (item: Equipment) => {
    const { error } = await supabase
      .from('equipment')
      .eq('id', item.id)
      .update({ is_available: !(item.is_available !== false), updated_at: new Date().toISOString() });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    fetchEquipment();
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" /> Rental Equipment ({equipment.length})
        </CardTitle>
        <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Equipment
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" />
        ) : equipment.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Package className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p>No equipment yet. Add your first item so it appears on the Rentals page.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.brand} {item.model}</div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{item.category}</Badge></TableCell>
                  <TableCell className="font-semibold">{formatPriceLocal(item.daily_rate, item.currency || 'USD')}/day</TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-300">{item.location}</TableCell>
                  <TableCell>
                    <Switch checked={item.is_available !== false} onCheckedChange={() => toggleAvailability(item)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${editing.name}` : 'Add Equipment'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="eq-name">Name *</Label>
                <Input id="eq-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sony A7III" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eq-brand">Brand</Label>
                <Input id="eq-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Sony" />
              </div>
              <div>
                <Label htmlFor="eq-model">Model</Label>
                <Input id="eq-model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="A7III" />
              </div>
              <div>
                <Label htmlFor="eq-location">Location</Label>
                <Input id="eq-location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Hyderabad, IN" />
              </div>
              <div>
                <Label htmlFor="eq-rate">Daily Rate *</Label>
                <Input id="eq-rate" type="number" min="1" step="0.01" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: e.target.value })} />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="eq-image">Image URL</Label>
                <Input id="eq-image" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://…" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="eq-desc">Description</Label>
                <Textarea id="eq-desc" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} />
                <Label>Available for rent</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Equipment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
