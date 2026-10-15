import { describe, expect, it } from 'vitest';
import { bridgeStage, destinations, nextJump, PIXEL_RULES, usePixel } from '@/pixel/state';
describe('Pixel Career City rules',()=>{
  it('allows a ground jump and one double jump, not a third',()=>{expect(nextJump(true,0)).toBe(1);expect(nextJump(false,1)).toBe(2);expect(nextJump(false,2)).toBeNull();});
  it('has seven badge destinations separate from start',()=>{expect(destinations).toHaveLength(7);expect(PIXEL_RULES.badges).toBe(7);expect(destinations[0]).toBeGreaterThan(68);});
  it('warns before the bridge becomes non-solid and later resets',()=>{expect(bridgeStage(-1)).toBe('safe');expect(bridgeStage(849)).toBe('warning');expect(bridgeStage(850)).toBe('fallen');expect(bridgeStage(7850)).toBe('reset');});
  it('collects each coin and career badge only once',()=>{usePixel.getState().set({level:1,nearby:1,badges:[],coins:[]});usePixel.getState().collect(2);usePixel.getState().collect(2);usePixel.getState().visit(1);usePixel.getState().visit(1);expect(usePixel.getState().coins).toEqual([2]);expect(usePixel.getState().badges).toEqual([1]);});
  it('restart clears current coins and checkpoint but retains earned badges',()=>{usePixel.getState().set({checkpoint:4,badges:[1]});usePixel.getState().restart();expect(usePixel.getState().coins).toEqual([]);expect(usePixel.getState().badges).toEqual([1]);expect(usePixel.getState().checkpoint).toBe(-1);});
});