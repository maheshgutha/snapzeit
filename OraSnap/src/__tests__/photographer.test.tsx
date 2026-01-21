import React from 'react';
import { render, screen } from '@testing-library/react';
import PhotographerDashboard from '../components/PhotographerDashboard';

describe('PhotographerDashboard', () => {
  it('renders photographer dashboard correctly', () => {
    render(<PhotographerDashboard />);
    expect(screen.getByText(/photographer/i)).toBeInTheDocument();
  });
});