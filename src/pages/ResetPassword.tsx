import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const resp = await fetch(`${getBaseUrl()}/api/auth/request-password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await resp.json();
      setRequestSent(true);
      toast.success(json.data?.message || 'If that email has an account, a reset link has been sent.');
    } catch (err) {
      toast.error('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${getBaseUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await resp.json();
      if (!resp.ok || json.error) {
        toast.error(json.error?.message || 'Reset failed');
        return;
      }
      toast.success('Password updated! Please sign in with your new password.');
      navigate('/auth');
    } catch (err) {
      toast.error('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex items-center justify-center py-24">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-purple-500" />
              {token ? 'Set a new password' : 'Reset your password'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {token ? (
              <form onSubmit={submitNewPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      className="pl-9"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Updating…' : 'Update Password'}
                </Button>
              </form>
            ) : requestSent ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  If that email has an account, a reset link is on its way. Check your inbox (and spam folder).
                </p>
                <Link to="/auth" className="text-sm text-purple-500 hover:underline">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={requestReset} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your account email and we'll send you a link to reset your password.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Remembered it?{' '}
                  <Link to="/auth" className="text-purple-500 hover:underline">Sign in</Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
