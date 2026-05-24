import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { MessageProvider } from "@/lib/message-context";
import { SecurityProvider } from "@/components/SecurityProvider";
import i18n from '@/lib/i18n';
import { AIChatBot } from "./components/AIChatBot";
import { Loader2 } from "lucide-react";

// Lazy load pages for performance optimization
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Photographers = lazy(() => import("./pages/Photographers"));
const PhotographerProfile = lazy(() => import("./pages/PhotographerProfile"));
const PhotographerRegister = lazy(() => import("./pages/PhotographerRegister"));
const PhotographerOnboarding = lazy(() => import("./pages/PhotographerOnboarding"));
const PhotographerDashboard = lazy(() => import("./pages/PhotographerDashboard"));
const Bookings = lazy(() => import("./pages/Bookings"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Contact = lazy(() => import("./pages/Contact"));
const Profile = lazy(() => import("./pages/Profile"));
const Locations = lazy(() => import("./pages/Locations"));
const Categories = lazy(() => import("./pages/Categories"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Rentals = lazy(() => import("./pages/Rentals"));
const LocationLanding = lazy(() => import("./pages/LocationLanding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ApplicationTester = lazy(() => import("./components/ApplicationTester"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Loading OraSnap...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nextProvider i18n={i18n}>
      <SecurityProvider>
        <AuthProvider>
          <NotificationProvider>
            <MessageProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/photographers" element={<Photographers />} />
                      <Route path="/rentals" element={<Rentals />} />
                      <Route path="/location/:slug" element={<LocationLanding />} />
                      <Route path="/photographer/:id" element={<PhotographerProfile />} />
                      <Route path="/photographer/register" element={<PhotographerRegister />} />
                      <Route path="/photographer/onboarding" element={<PhotographerOnboarding />} />
                      <Route path="/photographer/dashboard" element={<PhotographerDashboard />} />
                      <Route path="/bookings" element={<Bookings />} />
                      <Route path="/admin" element={<AdminPanel />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/how-it-works" element={<HowItWorks />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/locations" element={<Locations />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/pricing" element={<Pricing />} />
                      <Route path="/test" element={<ApplicationTester />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <AIChatBot />
                </BrowserRouter>
              </TooltipProvider>
            </MessageProvider>
          </NotificationProvider>
        </AuthProvider>
      </SecurityProvider>
    </I18nextProvider>
  </QueryClientProvider>
);

export default App;