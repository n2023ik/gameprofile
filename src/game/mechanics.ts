export const JUMP_SPEED = 10;
export const DOUBLE_JUMP_SPEED = 9;
export const BRIDGE_WARNING = .85;
export const BRIDGE_RECOVERY = 7;
export function allowedJump(grounded: boolean, coyote: number, jumps: number): 'ground' | 'double' | null {
  if (grounded || (coyote > 0 && jumps === 0)) return 'ground';
  return jumps < 2 ? 'double' : null;
}
export function collapseStage(elapsed: number, delay = BRIDGE_WARNING) {
  return elapsed < 0 ? 'safe' : elapsed < delay ? 'warning' : elapsed < delay + BRIDGE_RECOVERY ? 'fallen' : 'reset';
}
export const effects = { x: 0, y: 0, age: 10, kind: 'land', shake: 0 };
export function emitEffect(kind: string, x: number, y: number) { effects.kind = kind; effects.x = x; effects.y = y; effects.age = 0; }
export const movingSurfaces = new Map<number, { x: number; y: number; dx: number; dy: number; half: number }>();