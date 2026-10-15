import { create } from 'zustand';
import { canPlayLevel, completeLevel } from './levels';

export const PIXEL_RULES = { badges: 7, jumpSpeed: 310, doubleJumpSpeed: 290, bridgeWarning: 850, bridgeRecovery: 7000 };
export const destinations = [235, 455, 675, 895, 1115, 1335, 1555];
export function nextJump(grounded: boolean, jumps: number) { return grounded ? 1 : jumps < 2 ? 2 : null; }
export function bridgeStage(age: number) { return age < 0 ? 'safe' : age < PIXEL_RULES.bridgeWarning ? 'warning' : age < PIXEL_RULES.bridgeWarning + PIXEL_RULES.bridgeRecovery ? 'fallen' : 'reset'; }
export const touch = { left: false, right: false, jump: false, sprint: false, interact: false };
interface PixelState {
  level: number; started: boolean; completed: number[]; distance: number; levelDone: boolean;
  coins: number[]; badges: number[]; hearts: number; score: number; power: string | null; nearby: number | null; panel: number | null; checkpoint: number; paused: boolean; map: boolean; muted: boolean; complete: boolean; warning: boolean; restartKey: number;
  loadLevel: (id: number) => void; finish: () => void; dismissMenu: () => void;
  collect: (id: number) => void; visit: (id: number) => void; set: (value: Partial<PixelState>) => void; restart: () => void;
}
export const usePixel = create<PixelState>((set) => ({
  level: 0, started: false, completed: [], distance: 0, levelDone: false,
  coins: [], badges: [], hearts: 3, score: 0, power: null, nearby: null, panel: null, checkpoint: -1, paused: false, map: false, muted: true, complete: false, warning: false, restartKey: 0,
  loadLevel: id => set(s=>canPlayLevel(id,s.completed)?{level:id,started:true,levelDone:false,complete:false,coins:[],hearts:3,score:0,power:null,panel:null,nearby:null,checkpoint:-1,distance:0,paused:false,map:false,restartKey:s.restartKey+1}:{}),
  finish: ()=>set(s=>s.panel!==s.level||s.nearby!==s.level?{}:({completed:completeLevel(s.level,s.completed),levelDone:true,complete:s.level===6,panel:null})),
  dismissMenu: ()=>set(s=>s.started?{paused:false,map:false,levelDone:false,complete:false}:{}),
  collect: id => set(s => ({ coins: s.coins.includes(id) ? s.coins : [...s.coins, id] })),
  visit: id => set(s => id!==s.level||s.nearby!==id?{}:({ badges: s.badges.includes(id) ? s.badges : [...s.badges, id], panel: id })),
  set,
  restart: () => set(s => ({ started:true,levelDone:false,distance:0,coins: [], badges: s.badges, hearts: 3, score: 0, power: null, nearby: null, panel: null, checkpoint: -1, paused: false, map: false, complete: false, warning: false, restartKey: s.restartKey + 1 })),
}));