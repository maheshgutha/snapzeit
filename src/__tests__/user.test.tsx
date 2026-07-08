import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserDashboard } from '../components/UserDashboard';
import { renderWithProviders } from './testProviders';

// Mock supabase to prevent real network calls.
vi.mock('@/integrations/api/client', async () => {
  const { createMockSupabase, createChainable } = await import('./mockApiClient');
  const mockSupabase = createMockSupabase({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } } }),
    },
    from: vi.fn(() => createChainable({ data: [], error: null, count: 0 })),
  });
  return { supabase: mockSupabase, apiClient: mockSupabase, default: mockSupabase };
});

describe('UserDashboard', () => {
  it('renders user dashboard correctly', async () => {
    renderWithProviders(<UserDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    });
  });
});
