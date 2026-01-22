import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Camera, User, Mail, Lock, MapPin, Star, Award, Users, Heart, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ErrorHandler } from '@/utils/errorHandler';
import { PasswordStrengthIndicator } from '@/components/PasswordStrengthIndicator';
import { SocialLogin } from '@/components/SocialLogin';
import { validateEmail, validatePassword, validateName, validatePhone, validatePrice } from '@/utils/formValidation';

export default function Auth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Login form with validation
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' });
  
  // Register form with validation
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', userType: 'customer'
  });
  const [registerErrors, setRegisterErrors] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });

  // Validation functions
  const validateLoginForm = () => {
    const emailValidation = validateEmail(loginForm.email);
    const passwordValidation = validatePassword(loginForm.password);
    
    setLoginErrors({
      email: emailValidation.message,
      password: passwordValidation.message
    });
    
    return emailValidation.isValid && passwordValidation.isValid;
  };

  const validateRegisterForm = () => {
    const nameValidation = validateName(registerForm.name);
    const emailValidation = validateEmail(registerForm.email);
    const passwordValidation = validatePassword(registerForm.password);
    const confirmPasswordValid = registerForm.password === registerForm.confirmPassword;
    
    setRegisterErrors({
      name: nameValidation.message,
      email: emailValidation.message,
      password: passwordValidation.message,
      confirmPassword: confirmPasswordValid ? '' : 'Passwords do not match'
    });
    
    return nameValidation.isValid && emailValidation.isValid && passwordValidation.isValid && confirmPasswordValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        ErrorHandler.handleAuthError(error);
        return;
      }

      if (data.user) {
        toast.success(`Welcome back, ${data.user.email}!`);
        navigate('/photographers');
      }
    } catch (error) {
      ErrorHandler.handleGenericError(error, 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateRegisterForm()) {
      toast.error('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerForm.email,
        password: registerForm.password,
        options: {
          data: {
            name: registerForm.name,
            user_type: registerForm.userType
          }
        }
      });

      if (error) {
        ErrorHandler.handleAuthError(error);
        return;
      }

      if (data.user) {
        // Insert user role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: registerForm.userType === 'photographer' ? 'photographer' : 'user'
          });

        if (roleError) {
          console.error('Role assignment error:', roleError);
        }

        // Insert profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: registerForm.name,
            email: registerForm.email
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/photographers');
      }
    } catch (error) {
      ErrorHandler.handleGenericError(error, 'Registration failed');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <Header />
      
      {/* Modern Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-blue-200 dark:border-blue-800 mb-6">
              <Camera className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Join OraSnap Community</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              {t('auth.joinOraSnap')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('auth.connectPhotographers')}
            </p>
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-16">
            <div className="group text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">2,500+</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Photographers</p>
            </div>
            <div className="group text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Star className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">4.9</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Rating</p>
            </div>
            <div className="group text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">50K+</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Happy Clients</p>
            </div>
            <div className="group text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6 text-white" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">100%</p>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Verified</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Auth Forms */}
      <section className="py-20 container">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-12 h-14 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-2">
              <TabsTrigger value="login" className="h-10 rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                {t('auth.signInTab')}
              </TabsTrigger>
              <TabsTrigger value="register" className="h-10 rounded-xl font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                {t('auth.signUpTab')}
              </TabsTrigger>
            </TabsList>
            
            {/* Photographer CTA */}
            <div className="text-center mb-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Are you a photographer?</p>
              <Button 
                onClick={() => navigate('/photographer/register')}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Camera className="h-5 w-5 mr-2" />
                Join as Photographer
              </Button>
            </div>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-8 pt-10 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome Back
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Sign in to your account</p>
                </CardHeader>
                <CardContent className="p-8">
                  <SocialLogin onSuccess={() => navigate('/photographers')} className="mb-6" />
                  
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={loginForm.email}
                          onChange={(e) => {
                            setLoginForm({...loginForm, email: e.target.value});
                            if (loginErrors.email) setLoginErrors({...loginErrors, email: ''});
                          }}
                          className={`pl-11 h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                            loginErrors.email ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-blue-500'
                          }`}
                          required
                        />
                      </div>
                      {loginErrors.email && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{loginErrors.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={(e) => {
                            setLoginForm({...loginForm, password: e.target.value});
                            if (loginErrors.password) setLoginErrors({...loginErrors, password: ''});
                          }}
                          className={`pl-11 h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                            loginErrors.password ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-blue-500'
                          }`}
                          required
                        />
                      </div>
                      {loginErrors.password && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{loginErrors.password}</span>
                        </div>
                      )}
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing In...
                        </div>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <Card className="max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-8 pt-10 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Create Account
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Join our photography community</p>
                </CardHeader>
                <CardContent className="p-8">
                  <SocialLogin onSuccess={() => navigate('/photographers')} className="mb-6" />
                  
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={registerForm.name}
                        onChange={(e) => {
                          setRegisterForm({...registerForm, name: e.target.value});
                          if (registerErrors.name) setRegisterErrors({...registerErrors, name: ''});
                        }}
                        className={`h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                          registerErrors.name ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-emerald-500'
                        }`}
                        required
                      />
                      {registerErrors.name && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{registerErrors.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="your@email.com"
                          value={registerForm.email}
                          onChange={(e) => {
                            setRegisterForm({...registerForm, email: e.target.value});
                            if (registerErrors.email) setRegisterErrors({...registerErrors, email: ''});
                          }}
                          className={`pl-11 h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                            registerErrors.email ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-emerald-500'
                          }`}
                          required
                        />
                      </div>
                      {registerErrors.email && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{registerErrors.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <Input
                          id="reg-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerForm.password}
                          onChange={(e) => {
                            setRegisterForm({...registerForm, password: e.target.value});
                            if (registerErrors.password) setRegisterErrors({...registerErrors, password: ''});
                          }}
                          className={`h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                            registerErrors.password ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-emerald-500'
                          }`}
                          required
                        />
                        {registerErrors.password && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{registerErrors.password}</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Confirm
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="••••••••"
                          value={registerForm.confirmPassword}
                          onChange={(e) => {
                            setRegisterForm({...registerForm, confirmPassword: e.target.value});
                            if (registerErrors.confirmPassword) setRegisterErrors({...registerErrors, confirmPassword: ''});
                          }}
                          className={`h-12 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 transition-all ${
                            registerErrors.confirmPassword ? 'focus:ring-red-500 bg-red-50 dark:bg-red-900/20' : 'focus:ring-emerald-500'
                          }`}
                          required
                        />
                        {registerErrors.confirmPassword && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            <span>{registerErrors.confirmPassword}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {registerForm.password && (
                      <PasswordStrengthIndicator password={registerForm.password} />
                    )}
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>


          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl">OraSnap</span>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The world's largest marketplace for professional photography services
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <Link to="/photographers" className="hover:text-blue-600 transition-colors">Browse Photographers</Link>
            <Link to="/how-it-works" className="hover:text-blue-600 transition-colors">How It Works</Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}