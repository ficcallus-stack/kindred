import { describe, it, expect } from 'vitest';

/**
 * Calculates the platform fees for a booking.
 * Current logic: 7.5% from the total amount.
 */
function calculatePlatformFee(totalCents: number): number {
  return Math.floor(totalCents * 0.075);
}

describe('Financial Logic', () => {
  it('should correctly calculate a 7.5% platform fee', () => {
    // $100.00 (10000 cents) -> $7.50 (750 cents)
    expect(calculatePlatformFee(10000)).toBe(750);
    
    // $1.00 (100 cents) -> $0.07 (7 cents)
    expect(calculatePlatformFee(100)).toBe(7);
  });

  it('should handle zero amounts', () => {
    expect(calculatePlatformFee(0)).toBe(0);
  });

  it('should handle small rounding cases', () => {
    // $13.50 -> 1350 * 0.075 = 101.25 -> 101
    expect(calculatePlatformFee(1350)).toBe(101);
  });
});
