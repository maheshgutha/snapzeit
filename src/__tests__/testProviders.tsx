import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/lib/auth-context';
import { NotificationProvider } from '@/lib/notification-context';
import { MessageProvider } from '@/lib/message-context';
import i18n from '@/lib/i18n';

// Mirrors the provider stack in src/App.tsx so components that expect to be
// mounted inside the full app (Header, dashboards, etc.) work in tests.
export function AllProviders({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <AuthProvider>
          <NotificationProvider>
            <MessageProvider>
              <TooltipProvider>
                <BrowserRouter>{children}</BrowserRouter>
              </TooltipProvider>
            </MessageProvider>
          </NotificationProvider>
        </AuthProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllProviders });
}
