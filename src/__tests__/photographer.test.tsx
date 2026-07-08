import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import PhotographerDashboard from '../pages/PhotographerDashboard';
import { renderWithProviders } from './testProviders';

// Mock supabase to prevent real network calls. getSession() needs to resolve
// a logged-in user so AuthProvider's `user` is set and the dashboard fetches data.
vi.mock('@/integrations/api/client', async () => {
  const { createMockSupabase, createChainable } = await import('./mockApiClient');
  const fakeUser = { id: 'photog-1', email: 'photog@example.com' };
  const mockSupabase = createMockSupabase({
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'tok', user: fakeUser } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'photographers') {
        const chain: any = {
          select: () => chain,
          eq: () => chain,
          single: () => Promise.resolve({
            data: {
              id: 'p1',
              name: 'Test Photographer',
              specialty: 'Weddings',
              location: 'NYC',
              rating: 4.8,
              review_count: 10,
              price_per_hour: 100,
              bio: '',
              avatar_url: '',
              portfolio: [],
            },
            error: null,
          }),
        };
        return chain;
      }
      return createChainable({ data: [], error: null, count: 0 });
    }),
  });
  return { supabase: mockSupabase, apiClient: mockSupabase, default: mockSupabase };
});

describe('PhotographerDashboard', () => {
  it('renders photographer dashboard correctly', async () => {
    renderWithProviders(<PhotographerDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Test Photographer')).toBeInTheDocument();
    });
  });
});
