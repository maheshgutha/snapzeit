import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Camera, Menu, X, User, Calendar, Settings, LogOut, Shield, CameraIcon,
  Search, Bell, Heart, MessageCircle, Star, MapPin, Filter, Zap,
  Users, BookOpen, Award, Briefcase, Phone
} from 'lucide-react';

import NotificationDropdown from '@/components/NotificationDropdown';
import { useMessages } from '@/lib/message-context';

// Security: Sanitize user input to prevent XSS
const sanitizeHtml = (text: string): string => {
  return text.replace(/[<>"'&]/g, (match) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '&': '&amp;'
    };
    return entities[match] || match;
  });
};

import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PostLeadModal } from '@/components/PostLeadModal';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user, hasRole, signOut } = useAuth();
  const { unreadCount: messageUnreadCount } = useMessages();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [postLeadOpen, setPostLeadOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/photographers?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0].toUpperCase() || 'U';

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
      ? 'border-b border-border/30 bg-background/95 backdrop-blur-xl shadow-lg'
      : 'border-b border-border/10 bg-background/90 backdrop-blur-md'
      }`}>
      <div className="container">
        {/* Main Header */}
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/assets/snapzeit-logo.png" alt="SnapZeiT Logo" className="h-10 w-10 rounded-xl shadow-lg" />
            <span className="text-2xl font-bold text-foreground">
              Snap<span className="text-purple-500">Zeit</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search photographers, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus:bg-background transition-colors"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuTrigger className={`h-9 px-4 ${isActive('/') ? 'text-primary' : ''}`}>
                  Explore
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[400px]">
                    <NavigationMenuLink asChild>
                      <Link to="/photographers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Users className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('nav.findPhotographers')}</div>
                          <div className="text-sm text-muted-foreground">{t('photographers.subtitle')}</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/rentals" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Camera className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Rent Equipment</div>
                          <div className="text-sm text-muted-foreground">Cameras, lenses, and drones</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/categories" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Camera className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('photographers.specialty')}</div>
                          <div className="text-sm text-muted-foreground">Wedding, Portrait, Events</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/locations" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Browse Locations</div>
                          <div className="text-sm text-muted-foreground">Find photographers worldwide</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className={`h-9 px-4 ${isActive('/how-it-works') ? 'text-primary' : ''}`}>
                  Learn
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-6 w-[350px]">
                    <NavigationMenuLink asChild>
                      <Link to="/how-it-works" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('nav.howItWorks')}</div>
                          <div className="text-sm text-muted-foreground">{t('howItWorks.subtitle')}</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/pricing" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Award className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('photographers.priceRange')}</div>
                          <div className="text-sm text-muted-foreground">Transparent pricing</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link to="/contact" className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
                        <Phone className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{t('contact.title')}</div>
                          <div className="text-sm text-muted-foreground">{t('contact.subtitle')}</div>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {hasRole('photographer') && (
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/photographer/dashboard"
                      className={`h-9 px-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${isActive('/photographer/dashboard') ? 'text-primary' : ''}`}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      {t('nav.dashboard')}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold shadow-md mr-2"
              onClick={() => setPostLeadOpen(true)}
            >
              <Zap className="h-4 w-4 mr-2" />
              Get Best Quotes
            </Button>
            {user && (
              <>
                <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                  <Heart className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 relative"
                  onClick={() => navigate('/messages')}
                >
                  <MessageCircle className="h-4 w-4" />
                  {messageUnreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-primary">
                      {messageUnreadCount}
                    </Badge>
                  )}
                </Button>

                <NotificationDropdown />
              </>
            )}

            <ThemeToggle />
            <LanguageSwitcher />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-transparent hover:ring-primary/20 transition-all">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={sanitizeHtml(user.email || '')} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-semibold">{sanitizeHtml(user.user_metadata?.full_name || 'User')}</span>
                      <span className="text-xs text-muted-foreground truncate">{sanitizeHtml(user.email || '')}</span>
                      {hasRole('photographer') && (
                        <Badge variant="secondary" className="w-fit mt-1 text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Photographer
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-3 h-4 w-4" />
                    <span>{t('nav.profile')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/bookings')}>
                    <Calendar className="mr-3 h-4 w-4" />
                    <span>{t('nav.bookings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    <Heart className="mr-3 h-4 w-4" />
                    <span>Favorites</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/messages')}>
                    <MessageCircle className="mr-3 h-4 w-4" />
                    <span>Messages</span>
                    {messageUnreadCount > 0 && (
                      <Badge className="ml-auto bg-primary text-xs">{messageUnreadCount}</Badge>
                    )}
                  </DropdownMenuItem>
                  {hasRole('photographer') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/photographer/dashboard')}>
                        <CameraIcon className="mr-3 h-4 w-4" />
                        <span>Photographer Dashboard</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/photographer/analytics')}>
                        <Zap className="mr-3 h-4 w-4" />
                        <span>Analytics</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  {hasRole('admin') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/admin')}>
                        <Shield className="mr-3 h-4 w-4" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{t('nav.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="text-sm font-medium border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"
                  onClick={() => navigate('/photographer/register')}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Become a Photographer
                </Button>
                <Button variant="ghost" className="text-sm font-medium" onClick={() => navigate('/auth')}>
                  {t('nav.signIn')}
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 shadow-lg hover:shadow-xl transition-all" onClick={() => navigate('/auth')}>
                  {t('nav.getStarted')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        {!mobileMenuOpen && (
          <div className="lg:hidden pb-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search photographers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-9 bg-muted/50 border-0"
              />
            </form>
          </div>
        )}
      </div>

      {/* Enhanced Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-xl">
          <div className="container py-6 pb-28 space-y-6">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search photographers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-muted/50 border-0"
              />
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Explore</h3>
                <Link
                  to="/photographers"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t('nav.findPhotographers')}</span>
                </Link>
                <Link
                  to="/categories"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Camera className="h-5 w-5 text-primary" />
                  <span className="font-medium">Categories</span>
                </Link>
                <Link
                  to="/locations"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium">Locations</span>
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Learn</h3>
                <Link
                  to="/how-it-works"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t('nav.howItWorks')}</span>
                </Link>
                <Link
                  to="/contact"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Phone className="h-5 w-5 text-primary" />
                  <span className="font-medium">{t('contact.title')}</span>
                </Link>
              </div>
            </nav>

            {/* Mobile User Section */}
            {user ? (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{sanitizeHtml(user.user_metadata?.full_name || 'User')}</div>
                    <div className="text-sm text-muted-foreground">{sanitizeHtml(user.email || '')}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                    <User className="h-4 w-4 mr-2" />
                    {t('nav.profile')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { navigate('/bookings'); setMobileMenuOpen(false); }}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('nav.bookings')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { navigate('/messages'); setMobileMenuOpen(false); }}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Messages
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { navigate('/favorites'); setMobileMenuOpen(false); }}>
                    <Heart className="h-4 w-4 mr-2" />
                    Favorites
                  </Button>
                </div>

                {hasRole('photographer') && (
                  <Button
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    onClick={() => { navigate('/photographer/dashboard'); setMobileMenuOpen(false); }}
                  >
                    <CameraIcon className="h-4 w-4 mr-2" />
                    {t('nav.photographerDashboard')}
                  </Button>
                )}

                <Button
                  variant="ghost"
                  className="w-full text-destructive"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-900/20"
                  onClick={() => { navigate('/photographer/register'); setMobileMenuOpen(false); }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Become a Photographer
                </Button>
                <Button variant="outline" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>
                  {t('nav.signIn')}
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white" onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}>
                  {t('nav.getStarted')}
                </Button>
              </div>
            )}

            {/* Mobile Settings */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
      <PostLeadModal isOpen={postLeadOpen} onClose={() => setPostLeadOpen(false)} />
    </header>
  );
}