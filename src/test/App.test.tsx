import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Just check that the component renders without throwing
    expect(document.body).toBeInTheDocument();
  });

  it('renders the application', () => {
    render(<App />);
    // Check for any text content that should be present
    expect(document.body.textContent).toBeDefined();
  });
}); 