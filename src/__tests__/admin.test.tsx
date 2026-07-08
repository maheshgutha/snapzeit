import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AdminDashboard } from '../components/AdminDashboard';
import { renderWithProviders } from './testProviders';
import { createChainable } from './mockApiClient';

// Mock apiClient to prevent real network calls. AdminDashboard checks the
// caller has the 'admin' role, then loads a handful of table counts.
vi.mock('@/integrations/api/client', async () => {
  const { createMockSupabase, createChainable } = await import('./mockApiClient');
  const mockApiClient = createMockSupabase({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'admin-1', email: 'admin@example.com' } } }),
    },
    from: vi.fn((table: string) => {
      if (table === 'user_roles') {
        // AdminDashboard first checks the current user's role via .single(),
        // then later queries user_roles again (without .single()) for counts.
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          single: () => Promise.resolve({ data: { role: 'admin' }, error: null }),
          then: (resolve: any) => Promise.resolve({ data: [], error: null, count: 0 }).then(resolve),
        };
        return chain;
      }
      return createChainable({ data: [], error: null, count: 0 });
    }),
  });
  return { apiClient: mockApiClient, supabase: mockApiClient, default: mockApiClient };
});

describe('AdminDashboard', () => {
  it('renders admin dashboard correctly', async () => {
    renderWithProviders(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Revenue/i)).toBeInTheDocument();
    });
  });
});
