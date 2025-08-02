import { describe, it, expect } from 'vitest';

describe('Basic Frontend Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have a test environment', () => {
    expect(typeof window).toBe('object');
  });
}); 