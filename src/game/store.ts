import { create } from 'zustand';
import { sound } from './audio';
export interface Progress { coins: number[]; badges: number[] }
export const freshProgress = (): Progress => ({ coins: [], badges: [] });
export function collect(p: Progress, id: number): Progress { return p.coins.includes(id) ? p : { ...p, coins: [...p.coins, id] }; }
export function discover(p: Progress, id: number): Progress { return id < 0 || id > 6 || p.badges.includes(id) ? p : { ...p, badges: [...p.badges, id] }; }
export function xp(p: Progress) { return p.coins.length * 10 + p.badges.length * 100; }
interface GameState {
  progress: Progress; panel: number | null; nearby: number | null; paused: boolean; map: boolean; low: boolean; reduced: boolean;
  hearts: number; checkpoint: number; respawns: number; resetId: number; current: number;
  started: boolean; muted: boolean; warning: string; keys: number[]; complete: boolean; tutorial: boolean;
  setPanel: (id: number | null) => void; collect: (id: number) => void; discover: (id: number) => void;
  reset: () => void; fall: () => void;
}
export const useGame = create<GameState>((set) => ({
  progress: freshProgress(), panel: null, nearby: null, paused: false, map: false, low: false, reduced: false,
  hearts: 3, checkpoint: 0, respawns: 0, resetId: 0, current: 0,
  started: false, muted: false, warning: '', keys: [], complete: false, tutorial: true,
  setPanel: (panel) => set({ panel }),
  collect: (id) => set(s => { if (!s.progress.coins.includes(id)) sound('coin'); return { progress: collect(s.progress, id) }; }),
  discover: (id) => set(s => { if (!s.progress.badges.includes(id)) sound('checkpoint'); return { progress: discover(s.progress, id), checkpoint: id }; }),
  reset: () => set(s => ({ progress: freshProgress(), hearts: 3, checkpoint: 0, current: 0, respawns: 0, resetId: s.resetId + 1, paused: false, map: false, panel: null, complete: false, keys: [], warning: '', tutorial: true })),
  fall: () => set(s => ({ hearts: s.hearts > 1 ? s.hearts - 1 : 3, respawns: s.respawns + 1 })),
}));
export const controls = { left: false, right: false, jump: false, sprint: false, jumpPressed: false };
export const playerPosition = { x: -4, y: 1, grounded: false, state: 'idle', jumps: 0 };
export const coinLocations = Array.from({ length: 42 }, (_, id) => ({ id, x: Math.floor(id / 6) * 18 - 4 + (id % 6) * 1.6, y: 1.35 + ((id % 6 === 3 || id % 6 === 4) ? 1.8 : 0) }));
