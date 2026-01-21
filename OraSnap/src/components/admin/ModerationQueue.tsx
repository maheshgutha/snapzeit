import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, CheckCircle, XCircle, Eye } from 'lucide-react';

interface ModerationItem {
  id: string;
  content_type: string;
  content_id: string;
  content_preview: string | null;
  reason: string | null;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function ModerationQueue() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from('moderation_queue')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleModerate = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('moderation_queue')
      .update({
        status,
        moderated_by: user?.id,
        moderated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Content ${status}` });
      fetchItems();
    }
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Content Moderation
          </CardTitle>
          {pendingCount > 0 && (
            <Badge variant="destructive">{pendingCount} Pending Review</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p>No items in moderation queue</p>
            <p className="text-sm">All content has been reviewed</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{item.content_type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {item.content_preview || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.reason || 'Manual review'}
                  </TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[item.status]}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {item.status === 'pending' ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                          onClick={() => handleModerate(item.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600"
                          onClick={() => handleModerate(item.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="ghost" disabled>
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}