import React from 'react';
import { render, screen } from '@testing-library/react';
import AdminDashboard from '../components/AdminDashboard';

describe('AdminDashboard', () => {
  it('renders admin dashboard correctly', () => {
    render(<AdminDashboard />);
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
  });
});