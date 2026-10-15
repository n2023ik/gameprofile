import { describe, expect, it } from 'vitest';
import { allowedJump, collapseStage, BRIDGE_WARNING, BRIDGE_RECOVERY } from '@/game/mechanics';
describe('Platform adventure rules', () => {
 it('permits a ground jump then one airborne jump, never a third', () => {
  expect(allowedJump(true, 0, 0)).toBe('ground');
  expect(allowedJump(false, 0, 1)).toBe('double');
  expect(allowedJump(false, 0, 2)).toBeNull();
 });
 it('allows a coyote jump just after leaving a ledge', () => { expect(allowedJump(false, .1, 0)).toBe('ground'); });
 it('warns for 0.85 seconds before removing a bridge section', () => {
  expect(BRIDGE_WARNING).toBe(.85); expect(collapseStage(-1)).toBe('safe'); expect(collapseStage(.84)).toBe('warning'); expect(collapseStage(.85)).toBe('fallen');
 });
 it('restores collapsed bridge sections after seven seconds', () => { expect(BRIDGE_RECOVERY).toBe(7); expect(collapseStage(7.84)).toBe('fallen'); expect(collapseStage(7.85)).toBe('reset'); });
});