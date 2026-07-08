// src/__tests__/Auth.test.tsx
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { toast } from 'sonner';
import Auth from '@/pages/Auth';
import { renderWithProviders } from './testProviders';

// Mock supabase client to prevent real network calls
vi.mock('@/integrations/api/client', async () => {
  const { createMockSupabase } = await import('./mockApiClient');
  const mockSupabase = createMockSupabase({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { email: 'test@example.com' } }, error: null }),
    },
  });
  return { supabase: mockSupabase, apiClient: mockSupabase, default: mockSupabase };
});

// Mock toast to avoid side effects
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function renderAuth() {
  return renderWithProviders(<Auth />);
}

// The Header (rendered by the Auth page) has its own "Sign In" nav buttons,
// so disambiguate by picking the actual form submit button.
function getSubmitButton() {
  return screen.getAllByRole('button', { name: /Sign In/i }).find(
    (btn) => btn.getAttribute('type') === 'submit'
  )!;
}

describe('Auth component - Login', () => {
  test('renders login form with email and password fields', () => {
    renderAuth();
    // Login tab is selected by default
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(getSubmitButton()).toBeInTheDocument();
  });

  test('shows validation errors when submitting empty form', async () => {
    renderAuth();
    const btn = getSubmitButton();
    // jsdom doesn't reliably turn a button click into a form submit event,
    // so submit the form directly to exercise the validation handler.
    fireEvent.submit(btn.closest('form')!);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Please fix the errors below');
    });
  });
});
