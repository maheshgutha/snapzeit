import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Eye, CheckCircle } from 'lucide-react';

interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  reason: string;
  description: string | null;
  status: string;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  investigating: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function DisputeCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolution, setResolution] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDisputes(data);
    }
    setLoading(false);
  };

  const handleResolve = async () => {
    if (!selectedDispute) return;

    const { error } = await supabase
      .from('disputes')
      .update({
        status: newStatus,
        resolution: resolution || null,
        resolved_by: newStatus === 'resolved' || newStatus === 'closed' ? user?.id : null,
        resolved_at: newStatus === 'resolved' || newStatus === 'closed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedDispute.id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Dispute updated' });
      setSelectedDispute(null);
      setResolution('');
      setNewStatus('');
      fetchDisputes();
    }
  };

  const openDispute = (dispute: Dispute) => {
    setSelectedDispute(dispute);
    setNewStatus(dispute.status);
    setResolution(dispute.resolution || '');
  };

  const openCount = disputes.filter(d => d.status === 'open').length;
  const investigatingCount = disputes.filter(d => d.status === 'investigating').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dispute Center
          </CardTitle>
          <div className="flex gap-2">
            {openCount > 0 && (
              <Badge variant="destructive">{openCount} Open</Badge>
            )}
            {investigatingCount > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800">{investigatingCount} Investigating</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {disputes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p>No disputes!</p>
            <p className="text-sm">All bookings are running smoothly</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-mono text-xs">{d.booking_id.slice(0, 8)}...</TableCell>
                  <TableCell className="max-w-xs truncate">{d.reason}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[d.status]}>{d.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => openDispute(d)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-muted-foreground">Booking ID</Label>
                <p className="font-mono text-sm">{selectedDispute.booking_id}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Reason</Label>
                <p className="font-medium">{selectedDispute.reason}</p>
              </div>
              {selectedDispute.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{selectedDispute.description}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="resolution">Resolution Notes</Label>
                <Textarea
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDispute(null)}>Cancel</Button>
            <Button onClick={handleResolve}>Update Dispute</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}