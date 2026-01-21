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
import i18n from '@/lib/i18n'; // Initialize i18n
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Photographers from "./pages/Photographers";
import PhotographerProfile from "./pages/PhotographerProfile";
import PhotographerRegister from "./pages/PhotographerRegister";
import PhotographerOnboarding from "./pages/PhotographerOnboarding";
import PhotographerDashboard from "./pages/PhotographerDashboard";
import Bookings from "./pages/Bookings";
import AdminPanel from "./pages/AdminPanel";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import Locations from "./pages/Locations";
import Categories from "./pages/Categories";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import ApplicationTester from "./components/ApplicationTester";

const queryClient = new QueryClient();

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
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/photographers" element={<Photographers />} />
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