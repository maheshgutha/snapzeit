import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/api/client';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Users, Camera, Calendar, DollarSign, TrendingUp, CheckCircle,
  XCircle, Search, Eye, Shield, Trash2, Ban, UserCheck, ShieldOff,
  BarChart3, Activity, Settings, Bell, MessageSquare, FileText,
  Download, AlertTriangle, Zap, Globe, Star, Clock, ArrowUp, ArrowDown, Package
} from 'lucide-react';
import { getSettings, updateSettings, defaultSettings, AdminSettings } from '@/utils/adminSettings';
import { formatPriceLocal } from '@/lib/currency';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  city?: string;
  created_at: string;
  is_blocked?: boolean;
  block_reason?: string;
}

interface Photographer {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  specialty: string;
  location: string;
  country?: string;
  currency?: string;
  price_per_hour: number;
  status: string;
  created_at: string;
  rating: number;
  review_count: number;
  is_blocked?: boolean;
  block_reason?: string;
}

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location: string;
  status: string;
  payment_status: string;
  total_amount: number;
  currency?: string;
  commission_rate: number;
  created_at: string;
  photographers?: { name: string; country?: string; location?: string };
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, hasRole, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Settings state
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'user' | 'photographer';
    id: string;
    name: string;
  } | null>(null);

  const [blockDialog, setBlockDialog] = useState<{
    open: boolean;
    type: 'user' | 'photographer';
    id: string;
    name: string;
  } | null>(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!hasRole('admin')) {
        navigate('/');
        toast({ title: 'Access denied', description: 'Admin privileges required', variant: 'destructive' });
      } else {
        fetchData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, hasRole, navigate, toast]);

  const fetchData = async () => {
    try {
      const [usersRes, photographersRes, bookingsRes, leadsRes, rentalsRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('photographers').select('*').order('created_at', { ascending: false }),
        supabase.from('bookings').select('*, photographers(name, country, location)').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('rental_bookings').select('*, equipment(name)').order('created_at', { ascending: false })
      ]);

      if (usersRes.data) setUsers(usersRes.data);
      if (photographersRes.data) setPhotographers(photographersRes.data);
      if (bookingsRes.data) setBookings(bookingsRes.data);
      if (leadsRes.data) setLeads(leadsRes.data);
      if (rentalsRes.data) setRentals(rentalsRes.data);

      // Load settings from localStorage
      const adminSettings = getSettings();
      setSettings(adminSettings);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: keyof AdminSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: keyof AdminSettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const saveSettings = () => {
    try {
      const success = updateSettings(settings);

      if (success) {
        toast({ title: 'Success', description: 'Settings saved successfully' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
  };

  const updatePhotographerStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('photographers').eq('id', id).update({ status });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Photographer ${status}` });
      fetchData();
    }
  };

  const toggleUserBlock = async (userId: string, currentlyBlocked: boolean, reason?: string) => {
    const updateData: { is_blocked: boolean; block_reason?: string | null } = { is_blocked: !currentlyBlocked };
    if (!currentlyBlocked && reason) updateData.block_reason = reason;
    else if (currentlyBlocked) updateData.block_reason = null;

    const { error } = await supabase.from('profiles').eq('user_id', userId).update(updateData);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `User ${currentlyBlocked ? 'unblocked' : 'blocked'} successfully` });
      fetchData();
    }
  };

  const togglePhotographerBlock = async (id: string, currentlyBlocked: boolean, reason?: string) => {
    const updateData: { is_blocked: boolean; block_reason?: string | null } = { is_blocked: !currentlyBlocked };
    if (!currentlyBlocked && reason) updateData.block_reason = reason;
    else if (currentlyBlocked) updateData.block_reason = null;

    const { error } = await supabase.from('photographers').eq('id', id).update(updateData);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Photographer ${currentlyBlocked ? 'unblocked' : 'blocked'} successfully` });
      fetchData();
    }
  };

  const handleBlockSubmit = () => {
    if (!blockDialog) return;
    if (blockDialog.type === 'user') toggleUserBlock(blockDialog.id, false, blockReason);
    else togglePhotographerBlock(blockDialog.id, false, blockReason);
    setBlockDialog(null);
    setBlockReason('');
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error: profileError } = await supabase.from('profiles').eq('user_id', userId).delete();
      if (profileError) {
        toast({ title: 'Error', description: profileError.message, variant: 'destructive' });
        return;
      }

      const { error: roleError } = await supabase.from('user_roles').eq('user_id', userId).delete();
      if (roleError) {
        toast({ title: 'Warning', description: 'User deleted but role cleanup failed', variant: 'destructive' });
      }

      toast({ title: 'Success', description: 'User deleted successfully' });
      setDeleteDialog(null);
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const deletePhotographer = async (id: string) => {
    const { error } = await supabase.from('photographers').eq('id', id).delete();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Photographer deleted successfully' });
      setDeleteDialog(null);
      fetchData();
    }
  };

  const filteredPhotographers = useMemo(() =>
    photographers.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase())
    ), [photographers, searchQuery]);

  const filteredUsers = useMemo(() =>
    users.filter(u =>
      (u.full_name?.toLowerCase() || '').includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    ), [users, userSearchQuery]);

  const ToggleButton = ({ enabled, onClick, label }: { enabled: boolean; onClick: () => void; label: string }) => (
    <Button
      size="sm"
      variant="outline"
      onClick={onClick}
      className={enabled ? "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20" : "text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20"}
    >
      {enabled ? 'Enabled' : 'Disabled'}
    </Button>
  );

  const pendingPhotographers = photographers.filter(p => p.status === 'pending');
  const approvedPhotographers = photographers.filter(p => p.status === 'approved');
  const blockedUsers = users.filter(u => u.is_blocked);
  const blockedPhotographers = photographers.filter(p => p.is_blocked);
  const paidBookings = bookings.filter(b => b.payment_status === 'paid');
  const totalRevenue = paidBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const totalCommission = paidBookings.reduce((sum, b) => sum + (Number(b.total_amount) * Number(b.commission_rate || 0.05)), 0);
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container py-8">
          <div className="h-64 bg-white/60 dark:bg-slate-800/60 animate-pulse rounded-2xl backdrop-blur-sm" />
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <Card className="relative overflow-hidden border-0 shadow-lg glass-card hover:scale-105 transition-all duration-300 group">
      <div className={`absolute top-0 right-0 p-20 opacity-10 rounded-bl-full ${bgColor.split(' ')[0]}`} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white mt-2 group-hover:bg-clip-text group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-white dark:group-hover:to-gray-400 transition-all">
              {value}
            </p>
          </div>
          <div className={`p-4 rounded-2xl ${bgColor} shadow-inner`}>
            <Icon className={`h-8 w-8 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TabButton = ({ id, label, icon: Icon, active, onClick, badge }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all duration-300 ${active
        ? 'bg-gradient-primary text-white shadow-lg shadow-orange-500/20 scale-[1.02]'
        : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white hover:pl-5'
        }`}
    >
      <Icon className={`h-5 w-5 ${active ? 'animate-pulse-soft' : ''}`} />
      <span className="font-medium">{label}</span>
      {badge > 0 && (
        <Badge className="ml-auto bg-white/20 text-white border-0 text-xs px-2 py-0.5">{badge}</Badge>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />

      <div className="flex">
        {/* Modern Sidebar */}
        <div className="w-80 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
              <p className="text-slate-600 dark:text-slate-400">Platform Management</p>
            </div>
          </div>

          <nav className="space-y-2">
            <TabButton id="overview" label="Overview" icon={BarChart3} active={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton id="photographers" label="Photographers" icon={Camera} active={activeTab === 'photographers'} onClick={setActiveTab} badge={pendingPhotographers.length} />
            <TabButton id="users" label="Users" icon={Users} active={activeTab === 'users'} onClick={setActiveTab} />
            <TabButton id="bookings" label="Bookings" icon={Calendar} active={activeTab === 'bookings'} onClick={setActiveTab} />
            <TabButton id="leads" label="Leads" icon={Zap} active={activeTab === 'leads'} onClick={setActiveTab} badge={leads.length} />
            <TabButton id="rentals" label="Rentals" icon={Package} active={activeTab === 'rentals'} onClick={setActiveTab} badge={rentals.length} />
            <TabButton id="payments" label="Payments" icon={DollarSign} active={activeTab === 'payments'} onClick={setActiveTab} />
            <TabButton id="analytics" label="Analytics" icon={TrendingUp} active={activeTab === 'analytics'} onClick={setActiveTab} />
            <TabButton id="settings" label="Settings" icon={Settings} active={activeTab === 'settings'} onClick={setActiveTab} />
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Users"
                  value={users.length.toLocaleString()}
                  icon={Users}
                  color="text-blue-600"
                  bgColor="bg-blue-100 dark:bg-blue-900/30"
                />
                <StatCard
                  title="Photographers"
                  value={approvedPhotographers.length.toLocaleString()}
                  icon={Camera}
                  color="text-purple-600"
                  bgColor="bg-purple-100 dark:bg-purple-900/30"
                />
                <StatCard
                  title="Revenue"
                  value={formatPriceLocal(totalRevenue, 'USD')}
                  icon={DollarSign}
                  color="text-emerald-600"
                  bgColor="bg-emerald-100 dark:bg-emerald-900/30"
                />
                <StatCard
                  title="Commission"
                  value={formatPriceLocal(totalCommission, 'USD')}
                  icon={TrendingUp}
                  color="text-orange-600"
                  bgColor="bg-orange-100 dark:bg-orange-900/30"
                />
              </div>

              {/* Pending Approvals Alert */}
              {pendingPhotographers.length > 0 && (
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                          <AlertTriangle className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Pending Approvals</h3>
                          <p className="text-amber-700 dark:text-amber-300">{pendingPhotographers.length} photographer{pendingPhotographers.length > 1 ? 's' : ''} awaiting review</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setActiveTab('photographers')}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
                      >
                        Review Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">User Management</h3>
                        <p className="text-slate-600 dark:text-slate-400">Manage user accounts and permissions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <Camera className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Photographer Reviews</h3>
                        <p className="text-slate-600 dark:text-slate-400">Approve and manage photographers</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                        <BarChart3 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">Analytics Dashboard</h3>
                        <p className="text-slate-600 dark:text-slate-400">View platform performance metrics</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'photographers' && (
            <Card className="border-0 shadow-xl glass-card animate-fade-in-up">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Photographer Management</CardTitle>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search photographers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Photographer</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Specialty</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Location</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Rate</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Rating</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPhotographers.map(photographer => (
                      <TableRow key={photographer.id} className={`border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${photographer.is_blocked ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {photographer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{photographer.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{photographer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{photographer.specialty}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{photographer.location}</TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-white">{formatPriceLocal(photographer.price_per_hour, photographer.currency || 'USD')} /hr</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="font-medium text-slate-900 dark:text-white">{photographer.rating?.toFixed(1) || '5.0'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[photographer.status]}>{photographer.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {photographer.status === 'pending' && (
                              <>
                                <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" onClick={() => updatePhotographerStatus(photographer.id, 'approved')}>
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => updatePhotographerStatus(photographer.id, 'rejected')}>
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {photographer.status === 'approved' && (
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => navigate(`/photographer/${photographer.id}`)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className={photographer.is_blocked ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"}
                              onClick={() => photographer.is_blocked ? togglePhotographerBlock(photographer.id, true) : setBlockDialog({ open: true, type: 'photographer', id: photographer.id, name: photographer.name })}
                            >
                              {photographer.is_blocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteDialog({ open: true, type: 'photographer', id: photographer.id, name: photographer.name })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && (
            <Card className="border-0 shadow-xl glass-card animate-fade-in-up">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">User Management</CardTitle>
                  <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search users..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">User</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Email</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">City</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Joined</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(u => (
                      <TableRow key={u.id} className={`border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${u.is_blocked ? 'bg-red-50 dark:bg-red-900/10' : ''}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {(u.full_name || u.email).charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{u.full_name || 'No name'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{u.email}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{u.city || '-'}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={u.is_blocked ? STATUS_COLORS.blocked : STATUS_COLORS.approved}>
                            {u.is_blocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className={u.is_blocked ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" : "text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"}
                              onClick={() => u.is_blocked ? toggleUserBlock(u.user_id, true) : setBlockDialog({ open: true, type: 'user', id: u.user_id, name: u.full_name || u.email })}
                            >
                              {u.is_blocked ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteDialog({ open: true, type: 'user', id: u.user_id, name: u.full_name || u.email })}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'bookings' && (
            <Card className="border-0 shadow-xl glass-card animate-fade-in-up">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Booking Management</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Photographer</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Event</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Location</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map(booking => (
                      <TableRow key={booking.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="text-slate-700 dark:text-slate-300">{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{booking.photographers?.name || '-'}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{booking.event_type}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{booking.location}</TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-white">{formatPriceLocal(booking.total_amount, booking.currency || 'USD')}</TableCell>
                        <TableCell><Badge className={STATUS_COLORS[booking.status]}>{booking.status}</Badge></TableCell>
                        <TableCell><Badge className={STATUS_COLORS[booking.payment_status]}>{booking.payment_status}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}



          {activeTab === 'leads' && (
            <Card className="border-0 shadow-xl glass-card animate-fade-in-up">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Leads / Job Requests</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date Posted</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Service Type</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Location</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Budget</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map(lead => (
                      <TableRow key={lead.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="text-slate-700 dark:text-slate-300">{new Date(lead.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">{lead.service_type}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{lead.location}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">{lead.budget_range}</TableCell>
                        <TableCell>
                          <Badge className={lead.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{lead.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'rentals' && (
            <Card className="border-0 shadow-xl glass-card animate-fade-in-up">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Equipment Rentals</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Rented On</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Equipment</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Period</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Total Price</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rentals.map(rental => (
                      <TableRow key={rental.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="text-slate-700 dark:text-slate-300">{new Date(rental.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">{rental.equipment?.name || 'Unknown Item'}</TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300">
                          {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 dark:text-white">{formatPriceLocal(rental.total_price, rental.currency || 'USD')}</TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[rental.status] || 'bg-gray-100'}>{rental.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'payments' && (
            <Card className="border-0 shadow-xl glass-card animate-fade-in-up">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700">
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Payment Transactions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Photographer</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Amount</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Commission</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Payout</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.filter(b => b.status === 'completed').map(booking => {
                      const commission = Number(booking.total_amount) * Number(booking.commission_rate || 0.05);
                      const payout = Number(booking.total_amount) - commission;
                      return (
                        <TableRow key={booking.id} className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <TableCell className="text-slate-700 dark:text-slate-300">{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-slate-700 dark:text-slate-300">{booking.photographers?.name}</TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-white">{formatPriceLocal(booking.total_amount, booking.currency || 'USD')}</TableCell>
                          <TableCell className="text-emerald-600 font-semibold">{formatPriceLocal(commission, 'USD')}</TableCell>
                          <TableCell className="font-semibold text-slate-900 dark:text-white">{formatPriceLocal(payout, 'USD')}</TableCell>
                          <TableCell><Badge className={STATUS_COLORS[booking.payment_status]}>{booking.payment_status}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Revenue by Country</h3>
                      <div className="space-y-3">
                        {Object.entries(paidBookings.reduce((acc, booking) => {
                          const country = booking.photographers?.country || 'Unknown';
                          if (!acc[country]) acc[country] = { revenue: 0, bookings: 0 };
                          acc[country].revenue += Number(booking.total_amount);
                          acc[country].bookings += 1;
                          return acc;
                        }, {} as Record<string, { revenue: number; bookings: number }>))
                          .sort(([, a], [, b]) => b.revenue - a.revenue)
                          .slice(0, 5)
                          .map(([country, data]) => (
                            <div key={country} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <span className="font-medium text-slate-900 dark:text-white">{country}</span>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900 dark:text-white">{formatPriceLocal(data.revenue, 'USD')}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{data.bookings} bookings</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Top Performing Cities</h3>
                      <div className="space-y-3">
                        {Object.entries(paidBookings.reduce((acc, booking) => {
                          const city = booking.photographers?.location || booking.location || 'Unknown';
                          if (!acc[city]) acc[city] = { revenue: 0, bookings: 0 };
                          acc[city].revenue += Number(booking.total_amount);
                          acc[city].bookings += 1;
                          return acc;
                        }, {} as Record<string, { revenue: number; bookings: number }>))
                          .sort(([, a], [, b]) => b.revenue - a.revenue)
                          .slice(0, 5)
                          .map(([city, data]) => (
                            <div key={city} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <span className="font-medium text-slate-900 dark:text-white">{city}</span>
                              <div className="text-right">
                                <p className="font-semibold text-slate-900 dark:text-white">{formatPriceLocal(data.revenue, 'USD')}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{data.bookings} bookings</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Platform Configuration */}
              <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Settings className="h-6 w-6" />
                    Platform Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Financial Settings */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Financial Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Default Commission Rate (%)</Label>
                          <Input
                            className="mt-2"
                            type="number"
                            value={settings.commissionRate}
                            onChange={(e) => updateSetting('commissionRate', Number(e.target.value))}
                            min="0"
                            max="50"
                          />
                          <p className="text-xs text-slate-500 mt-1">Platform commission on completed bookings</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Minimum Booking Amount ($)</Label>
                          <Input
                            className="mt-2"
                            type="number"
                            value={settings.minBookingAmount}
                            onChange={(e) => updateSetting('minBookingAmount', Number(e.target.value))}
                            min="1"
                          />
                          <p className="text-xs text-slate-500 mt-1">Minimum amount for bookings</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Payment Processing Fee (%)</Label>
                          <Input
                            className="mt-2"
                            type="number"
                            value={settings.processingFee}
                            onChange={(e) => updateSetting('processingFee', Number(e.target.value))}
                            min="0"
                            max="10"
                            step="0.1"
                          />
                          <p className="text-xs text-slate-500 mt-1">Additional processing fee</p>
                        </div>
                      </div>
                    </div>

                    {/* User Management */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        User Management
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Auto-approve photographers</span>
                            <p className="text-xs text-slate-500">Skip manual review process</p>
                          </div>
                          <ToggleButton
                            enabled={settings.autoApprovePhotographers}
                            onClick={() => toggleSetting('autoApprovePhotographers')}
                            label="Auto-approve photographers"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Email verification required</span>
                            <p className="text-xs text-slate-500">Require email verification for new users</p>
                          </div>
                          <ToggleButton
                            enabled={settings.emailVerificationRequired}
                            onClick={() => toggleSetting('emailVerificationRequired')}
                            label="Email verification"
                          />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Profile verification</span>
                            <p className="text-xs text-slate-500">Require ID verification for photographers</p>
                          </div>
                          <ToggleButton
                            enabled={settings.profileVerificationRequired}
                            onClick={() => toggleSetting('profileVerificationRequired')}
                            label="Profile verification"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notification Settings */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Email notifications</span>
                          <p className="text-xs text-slate-500">Send email updates</p>
                        </div>
                        <ToggleButton
                          enabled={settings.emailNotifications}
                          onClick={() => toggleSetting('emailNotifications')}
                          label="Email notifications"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">SMS notifications</span>
                          <p className="text-xs text-slate-500">Send SMS alerts</p>
                        </div>
                        <ToggleButton
                          enabled={settings.smsNotifications}
                          onClick={() => toggleSetting('smsNotifications')}
                          label="SMS notifications"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Push notifications</span>
                          <p className="text-xs text-slate-500">Browser push alerts</p>
                        </div>
                        <ToggleButton
                          enabled={settings.pushNotifications}
                          onClick={() => toggleSetting('pushNotifications')}
                          label="Push notifications"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Security & Privacy */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security & Privacy
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Session Timeout (minutes)</Label>
                          <Input
                            className="mt-2"
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={(e) => updateSetting('sessionTimeout', Number(e.target.value))}
                            min="5"
                            max="1440"
                          />
                          <p className="text-xs text-slate-500 mt-1">Auto-logout inactive users</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Max Login Attempts</Label>
                          <Input
                            className="mt-2"
                            type="number"
                            value={settings.maxLoginAttempts}
                            onChange={(e) => updateSetting('maxLoginAttempts', Number(e.target.value))}
                            min="3"
                            max="10"
                          />
                          <p className="text-xs text-slate-500 mt-1">Block after failed attempts</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Two-factor authentication</span>
                            <p className="text-xs text-slate-500">Require 2FA for admins</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Data encryption</span>
                            <p className="text-xs text-slate-500">Encrypt sensitive data</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Moderation */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Content Moderation
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Auto-moderate reviews</span>
                            <p className="text-xs text-slate-500">AI content filtering</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Image moderation</span>
                            <p className="text-xs text-slate-500">Scan uploaded images</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Profanity Filter Level</Label>
                          <select className="mt-2 w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600">
                            <option>Strict</option>
                            <option>Moderate</option>
                            <option>Lenient</option>
                          </select>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Review Queue Limit</Label>
                          <Input className="mt-2" type="number" placeholder="100" defaultValue="100" min="10" max="1000" />
                          <p className="text-xs text-slate-500 mt-1">Max items in moderation queue</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API & Integration */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      API & Integrations
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">API Rate Limit (requests/hour)</Label>
                          <Input className="mt-2" type="number" placeholder="1000" defaultValue="1000" min="100" max="10000" />
                          <p className="text-xs text-slate-500 mt-1">Per API key rate limit</p>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Webhook notifications</span>
                            <p className="text-xs text-slate-500">Send event webhooks</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Third-party integrations</span>
                            <p className="text-xs text-slate-500">Allow external apps</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Analytics tracking</span>
                            <p className="text-xs text-slate-500">Google Analytics integration</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Maintenance Mode */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Maintenance & Backup
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Maintenance mode</span>
                            <p className="text-xs text-slate-500">Disable public access</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200">Disabled</Button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Maintenance Message</Label>
                          <Textarea className="mt-2" placeholder="We're currently performing maintenance..." rows={3} />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Auto-backup</span>
                            <p className="text-xs text-slate-500">Daily database backups</p>
                          </div>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200">Enabled</Button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <Label className="text-slate-700 dark:text-slate-300 font-medium">Backup Retention (days)</Label>
                          <Input className="mt-2" type="number" placeholder="30" defaultValue="30" min="7" max="365" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      onClick={saveSettings}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
                    >
                      Save All Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs remain the same */}
      <AlertDialog open={deleteDialog?.open} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete <strong>{deleteDialog?.name}</strong>. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteDialog?.type === 'user' ? deleteUser(deleteDialog.id) : deletePhotographer(deleteDialog.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={blockDialog?.open} onOpenChange={(open) => { if (!open) { setBlockDialog(null); setBlockReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {blockDialog?.type === 'user' ? 'User' : 'Photographer'}</DialogTitle>
            <DialogDescription>You are about to block <strong>{blockDialog?.name}</strong>. Please provide a reason.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="block-reason">Block Reason</Label>
            <Textarea id="block-reason" placeholder="Enter the reason for blocking..." value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="mt-2" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setBlockDialog(null); setBlockReason(''); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleBlockSubmit} disabled={!blockReason.trim()}><Ban className="h-4 w-4 mr-2" />Block</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}