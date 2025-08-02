import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the main application structure', () => {
    render(<App />);
    // Check for main navigation elements
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
}); 