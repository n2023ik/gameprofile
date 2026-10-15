import { describe, expect, it } from 'vitest';
import { combatRules, damageHearts, enemyContact, patrolStep, islandTops, islandWidths } from '../pixel/rules';
import { usePixel } from '../pixel/state';

describe('original enemies and health',()=>{
  it('starts with three hearts and returns to three on zero-heart respawn',()=>{expect(combatRules.hearts).toBe(3);expect(damageHearts(3,2000,0,0).hearts).toBe(2);expect(damageHearts(1,2000,0,0)).toEqual({hearts:3,damaged:true,respawn:true});});
  it('ignores enemy damage during invulnerability or a shield',()=>{expect(damageHearts(2,100,1500,0).damaged).toBe(false);expect(damageHearts(2,100,0,6500).damaged).toBe(false);expect(damageHearts(2,6501,0,6500).hearts).toBe(1);});
  it('stomps walking bugs but side and below collisions cause damage',()=>{expect(enemyContact('bug',140,190,200)).toBe('stomp');expect(enemyContact('bug',-100,190,200)).toBe('damage');expect(enemyContact('bug',140,230,200)).toBe('damage');});
  it('armored beetles and glowing fireflies must be avoided',()=>{expect(enemyContact('armor',140,190,200)).toBe('damage');expect(enemyContact('firefly',140,190,200)).toBe('damage');});
  it('patrols turn at both platform edges without overshooting',()=>{expect(patrolStep(19,1,23,1,0,20)).toEqual({x:20,direction:-1});expect(patrolStep(1,-1,23,1,0,20)).toEqual({x:0,direction:1});});
  it('restart restores health and removes score and power-ups',()=>{usePixel.getState().set({hearts:1,score:200,power:'SHIELD'});usePixel.getState().restart();expect(usePixel.getState().hearts).toBe(3);expect(usePixel.getState().score).toBe(0);expect(usePixel.getState().power).toBeNull();});
  it('mandatory island gaps stay within a single running jump',()=>{const centers=[235,455,675,895,1115,1335,1555];for(let i=1;i<centers.length;i++){const gap=220-((islandWidths[i]??0)+(islandWidths[i-1]??0))/2;const airtime=2*310/760;expect(gap).toBeLessThan(155*airtime-20);expect(Math.abs((islandTops[i]??0)-(islandTops[i-1]??0))).toBeLessThan(310*310/(2*760));}});
});