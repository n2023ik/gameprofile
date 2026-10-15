import { describe, expect, it } from 'vitest';
import { links } from '@/game/data';

describe('Official portfolio destination', () => {
  it('uses the portfolio URL supplied by Nikhil', () => {
    expect(links.portfolio).toBe('https://n2023ik.github.io/my-portfoli/');
  });
});