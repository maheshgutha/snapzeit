import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import { apiClient } from '@/integrations/api/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Lock, Save, Loader2, Bell, Trash2, Upload, Camera } from 'lucide-react';
import { z } from 'zod';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().max(20).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [notifyBookingUpdates, setNotifyBookingUpdates] = useState(true);
  const [notifyBookingReminders, setNotifyBookingReminders] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(false);
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      toast({
        title: 'Error loading profile',
        description: error.message,
        variant: 'destructive',
      });
    }

    if (data) {
      setFullName(data.full_name || '');
      setEmail(data.email || user.email || '');
      setPhone(data.phone || '');
      setCity(data.city || '');
      setAvatarUrl(data.avatar_url || null);
      setNotifyBookingUpdates(data.notify_booking_updates ?? true);
      setNotifyBookingReminders(data.notify_booking_reminders ?? true);
      setNotifyPromotions(data.notify_promotions ?? false);
    } else {
      setEmail(user.email || '');
      setFullName(user.user_metadata?.full_name || '');
    }
    
    setProfileLoading(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: t('profileSettings.invalidFileType'),
        description: t('profileSettings.invalidFileTypeDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('profileSettings.fileTooLarge'),
        description: t('profileSettings.fileTooLargeDesc'),
        variant: 'destructive',
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache buster to URL
      const avatarUrlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrlWithCacheBuster, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrlWithCacheBuster }
      });

      setAvatarUrl(avatarUrlWithCacheBuster);

      toast({
        title: t('profileSettings.avatarUpdated'),
        description: t('profileSettings.avatarUpdatedDesc'),
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: 'destructive',
      });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = profileSchema.parse({
        full_name: fullName,
        phone,
        city,
      });
      setProfileErrors({});
      
      setSaving(true);
      
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: validated.full_name }
      });

      if (authError) throw authError;

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: validated.full_name,
          phone: validated.phone || null,
          city: validated.city || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id);

      if (profileError) throw profileError;

      toast({
        title: t('profileSettings.profileUpdated'),
        description: t('profileSettings.profileUpdatedDesc'),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setProfileErrors(errors);
      } else if (error instanceof Error) {
        toast({
          title: 'Update failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNotifications = async (
    field: 'notify_booking_updates' | 'notify_booking_reminders' | 'notify_promotions',
    value: boolean
  ) => {
    if (!user) return;

    // Optimistically update UI
    if (field === 'notify_booking_updates') setNotifyBookingUpdates(value);
    if (field === 'notify_booking_reminders') setNotifyBookingReminders(value);
    if (field === 'notify_promotions') setNotifyPromotions(value);

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) {
      // Revert on error
      if (field === 'notify_booking_updates') setNotifyBookingUpdates(!value);
      if (field === 'notify_booking_reminders') setNotifyBookingReminders(!value);
      if (field === 'notify_promotions') setNotifyPromotions(!value);

      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      passwordSchema.parse({ password: newPassword, confirmPassword });
      setPasswordErrors({});
      
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: t('profileSettings.passwordChanged'),
        description: t('profileSettings.passwordChangedDesc'),
      });
      
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setPasswordErrors(errors);
      } else if (error instanceof Error) {
        toast({
          title: 'Password change failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setDeleting(true);

    try {
      // Delete profile (this will cascade due to foreign key constraints if set up)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Sign out the user
      await signOut();
      
      toast({
        title: t('profileSettings.accountDeleted'),
        description: t('profileSettings.accountDeletedDesc'),
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'Deletion failed',
        description: error instanceof Error ? error.message : 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  const initials = fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || email?.[0]?.toUpperCase() || 'U';

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t('profileSettings.title')}</h1>
            <p className="text-muted-foreground mt-2">
              {t('profileSettings.subtitle')}
            </p>
          </div>

          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <CardTitle>{t('profileSettings.profilePicture')}</CardTitle>
              </div>
              <CardDescription>
                {t('profileSettings.profilePictureDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                    <AvatarFallback className="gradient-primary text-primary-foreground text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('profileSettings.uploadPhoto')}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t('profileSettings.photoFormats')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>{t('profileSettings.profileInfo')}</CardTitle>
              </div>
              <CardDescription>
                {t('profileSettings.profileInfoDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                  {profileErrors.full_name && (
                    <p className="text-sm text-destructive">{profileErrors.full_name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profileSettings.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('profileSettings.emailCannotChange')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                    {profileErrors.phone && (
                      <p className="text-sm text-destructive">{profileErrors.phone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('profileSettings.city')}</Label>
                    <Input
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                    />
                    {profileErrors.city && (
                      <p className="text-sm text-destructive">{profileErrors.city}</p>
                    )}
                  </div>
                </div>
                
                <Button type="submit" disabled={saving} className="gradient-primary">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('profileSettings.saving')}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {t('profileSettings.saveChanges')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>{t('profileSettings.notifications')}</CardTitle>
              </div>
              <CardDescription>
                {t('profileSettings.notificationsDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-updates">{t('profileSettings.bookingUpdates')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('profileSettings.bookingUpdatesDesc')}
                  </p>
                </div>
                <Switch
                  id="notify-updates"
                  checked={notifyBookingUpdates}
                  onCheckedChange={(checked) => handleUpdateNotifications('notify_booking_updates', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-reminders">{t('profileSettings.bookingReminders')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('profileSettings.bookingRemindersDesc')}
                  </p>
                </div>
                <Switch
                  id="notify-reminders"
                  checked={notifyBookingReminders}
                  onCheckedChange={(checked) => handleUpdateNotifications('notify_booking_reminders', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-promotions">{t('profileSettings.promotions')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('profileSettings.promotionsDesc')}
                  </p>
                </div>
                <Switch
                  id="notify-promotions"
                  checked={notifyPromotions}
                  onCheckedChange={(checked) => handleUpdateNotifications('notify_promotions', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle>{t('profileSettings.changePassword')}</CardTitle>
              </div>
              <CardDescription>
                {t('profileSettings.securityDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('profileSettings.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {passwordErrors.password && (
                    <p className="text-sm text-destructive">{passwordErrors.password}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('profileSettings.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
                
                <Button type="submit" disabled={changingPassword} variant="outline">
                  {changingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('profileSettings.updating')}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {t('profileSettings.updatePassword')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Delete Account */}
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-destructive" />
                <CardTitle className="text-destructive">{t('profileSettings.deleteAccount')}</CardTitle>
              </div>
              <CardDescription>
                {t('profileSettings.deleteAccountDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {t('profileSettings.deleteAccountDesc')}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('profileSettings.deleteAccountBtn')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('profileSettings.deleteConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('profileSettings.deleteConfirmDesc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('profileSettings.deleting')}
                        </>
                      ) : (
                        t('profileSettings.deleteAccountBtn')
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
