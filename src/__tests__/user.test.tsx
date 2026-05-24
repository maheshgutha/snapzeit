import React from 'react';
import { render, screen } from '@testing-library/react';
import UserDashboard from '../components/UserDashboard';

describe('UserDashboard', () => {
  it('renders user dashboard correctly', () => {
    render(<UserDashboard />);
    expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
  });
});