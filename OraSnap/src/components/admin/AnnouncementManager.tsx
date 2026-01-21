import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Megaphone, Plus, Trash2, Edit, AlertCircle, Info, CheckCircle, XCircle } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  target_audience: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  success: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
};

const TYPE_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  error: 'bg-red-100 text-red-800',
};

export default function AnnouncementManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info',
    target_audience: 'all',
    is_active: true,
    starts_at: '',
    ends_at: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
      created_by: user?.id,
    };

    if (editingAnnouncement) {
      const { error } = await supabase
        .from('announcements')
        .update(payload)
        .eq('id', editingAnnouncement.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Announcement updated' });
      }
    } else {
      const { error } = await supabase
        .from('announcements')
        .insert(payload);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Announcement created' });
      }
    }

    setDialogOpen(false);
    resetForm();
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) {
      toast({ title: 'Success', description: 'Announcement deleted' });
      fetchAnnouncements();
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      target_audience: announcement.target_audience,
      is_active: announcement.is_active,
      starts_at: announcement.starts_at?.split('T')[0] || '',
      ends_at: announcement.ends_at?.split('T')[0] || '',
    });
    setDialogOpen(true);
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    await supabase.from('announcements').update({ is_active: !currentState }).eq('id', id);
    fetchAnnouncements();
  };

  const resetForm = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      type: 'info',
      target_audience: 'all',
      is_active: true,
      starts_at: '',
      ends_at: '',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Announcements
          </CardTitle>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell>
                    <Badge className={TYPE_COLORS[a.type]}>
                      {TYPE_ICONS[a.type]} {a.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{a.target_audience}</TableCell>
                  <TableCell>
                    <Switch
                      checked={a.is_active}
                      onCheckedChange={() => toggleActive(a.id, a.is_active)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(a)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(a.id)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select value={formData.target_audience} onValueChange={(v) => setFormData(prev => ({ ...prev, target_audience: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="users">Users Only</SelectItem>
                    <SelectItem value="photographers">Photographers Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starts_at">Start Date</Label>
                <Input
                  id="starts_at"
                  type="date"
                  value={formData.starts_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, starts_at: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="ends_at">End Date</Label>
                <Input
                  id="ends_at"
                  type="date"
                  value={formData.ends_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, ends_at: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.title || !formData.content}>
              {editingAnnouncement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}