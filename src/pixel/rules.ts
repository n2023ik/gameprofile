export type EnemyKind = 'bug' | 'slime' | 'firefly' | 'armor' | 'drone';
export const combatRules = { hearts: 3, immunity: 1500, shieldDuration: 6500, speedDuration: 5000 };
export function enemyContact(kind: EnemyKind, fallingSpeed: number, previousBottom: number, enemyTop: number) {
  return (kind === 'bug' || kind === 'slime' || kind === 'drone') && fallingSpeed > 25 && previousBottom <= enemyTop + 9 ? 'stomp' : 'damage';
}
export function patrolStep(x: number, direction: number, speed: number, dt: number, min: number, max: number) {
  const next = x + direction * speed * dt;
  return { x: Math.max(min, Math.min(max, next)), direction: next >= max ? -1 : next <= min ? 1 : direction };
}
export function damageHearts(hearts: number, now: number, immuneUntil: number, shieldUntil: number) {
  if (now < immuneUntil || now < shieldUntil) return { hearts, damaged: false, respawn: false };
  const remaining = Math.max(0, hearts - 1);
  return { hearts: remaining || combatRules.hearts, damaged: true, respawn: remaining === 0 };
}
export const islandTops = [440, 432, 440, 428, 440, 424, 440];
export const islandWidths = [176, 186, 176, 192, 176, 186, 192];
export const themes = ['Enchanted Village', 'Lynkit Industrial District', 'Cyberpunk Coding City', 'Magical Library', 'Trophy Castle', 'University Kingdom', 'Portal Fortress'];