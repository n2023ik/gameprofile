import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, renderHook } from '@testing-library/react';
import { useControls } from '@/game/useControls';
import { controls, useGame } from '@/game/store';

afterEach(() => { cleanup(); document.querySelector('[role="dialog"]')?.remove(); useGame.getState().reset(); });
describe('Platformer controls', () => {
 it('moves with A/D and releases held movement while a panel is open', () => {
  renderHook(useControls);
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
  expect(controls.right).toBe(true);
  const panel = document.createElement('div'); panel.setAttribute('role', 'dialog'); document.body.append(panel);
  window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyD' }));
  expect(controls.right).toBe(false);
 });
 it('opens the nearby portfolio stop with E', () => {
  renderHook(useControls); useGame.setState({ nearby: 1, paused: false });
  window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
  expect(useGame.getState().panel).toBe(1); expect(useGame.getState().checkpoint).toBe(1);
 });
 it('retains the reached checkpoint when falling', () => {
  useGame.getState().discover(2); useGame.getState().fall();
  expect(useGame.getState().checkpoint).toBe(2); expect(useGame.getState().hearts).toBe(2); expect(useGame.getState().respawns).toBe(1);
 });
});