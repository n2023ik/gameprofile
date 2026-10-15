import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import { CuboidCollider, RigidBody, type RapierCollider, type RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Block } from './scenery';
import { palette as p } from './palette';
import { playerPosition, useGame } from './store';
import { BRIDGE_WARNING, collapseStage, effects, emitEffect, movingSurfaces } from './mechanics';
import { sound } from './audio';

export const surfaceStates = new Map<string, string>();
export function CollapsingPlatform({ x, y = 0, stone = false, id, delay = BRIDGE_WARNING }: { x: number; y?: number; stone?: boolean; id: string; delay?: number }) {
 const mesh = useRef<THREE.Group>(null); const collider = useRef<RapierCollider>(null); const elapsed = useRef(-1); const last = useRef('safe');
 const reset = useGame(s => s.resetId); const respawns = useGame(s => s.respawns);
 useEffect(() => { elapsed.current = -1; last.current = 'safe'; collider.current?.setEnabled(true); surfaceStates.set(id, 'safe'); }, [reset, respawns, id]);
 useEffect(() => () => { surfaceStates.delete(id); }, [id]);
 useFrame((_, rawDt) => {
  const s = useGame.getState(); if (s.paused || s.map || s.panel !== null || !s.started) return;
  const dt = Math.min(rawDt, .05); const player = playerPosition;
  if (elapsed.current < 0 && Math.abs(player.x - x) < .58 && player.grounded && Math.abs(player.y - (y + .83)) < .3) { elapsed.current = 0; useGame.setState({ warning: stone ? 'Crumbling stone — keep moving!' : 'Fragile bridge — run or jump!' }); }
  if (elapsed.current >= 0) elapsed.current += dt;
  const stage = collapseStage(elapsed.current, delay); surfaceStates.set(id, stage);
  if (stage === 'fallen' && last.current !== stage) { collider.current?.setEnabled(false); sound('break'); emitEffect('break', x, y); effects.shake = .3; }
  if (stage === 'reset') { elapsed.current = -1; collider.current?.setEnabled(true); useGame.setState({ warning: '' }); }
  if (mesh.current) {
   const fall = Math.max(0, elapsed.current - delay);
   mesh.current.position.set(x, y + (stage === 'fallen' ? -8 * fall * fall : stage === 'warning' ? Math.sin(elapsed.current * 65) * .035 : 0), 0);
   mesh.current.rotation.z = stage === 'fallen' ? fall * .9 : stage === 'warning' ? Math.sin(elapsed.current * 40) * .04 : 0;
   mesh.current.visible = fall < 1.2;
  }
  last.current = stage;
 });
 return <><RigidBody type="fixed" colliders={false}><CuboidCollider ref={collider} args={[.38, .12, 1.65]} position={[x, y - .12, 1.5]} /></RigidBody><group ref={mesh} position={[x, y, 0]}>
  <Block at={[0, -.12, 1.5]} size={[.76, .24, 3.3]} color={stone ? p.stoneLight : p.trunk} />
  <Block at={[0, .015, 1.5]} size={[.07, .025, 3.1]} color={p.pink} />
  {[-.28, .28].map(dx => <Block key={dx} at={[dx, .015, 1.5]} size={[.025, .03, 2.8]} color={p.stoneDark} />)}
 </group></>;
}
export function BreakableBridge({ x, stone = false }: { x: number; stone?: boolean }) {
 return <group>{[-1.6, -.8, 0, .8, 1.6].map((offset, i) => <CollapsingPlatform key={i} id={`bridge-${x}-${i}`} x={x + offset} stone={stone} delay={stone ? 1.1 : .85} />)}
  {[-.2, 3.2].map(z => <group key={z}>{[-2.2, 2.2].map(dx => <Block key={dx} at={[x + dx, .65, z]} size={[.14, 1.5, .14]} color={p.trunk} />)}<mesh position={[x, 1.15, z]} rotation-z={Math.PI / 2}><cylinderGeometry args={[.035, .035, 4.6, 6]} /><meshStandardMaterial color={p.gold} /></mesh></group>)}
  <Html position={[x, 1.6, -.3]} center zIndexRange={[4, 0]}><span className="hazard-label">{stone ? 'CRUMBLING STONE' : 'FRAGILE BRIDGE'}</span></Html>
 </group>;
}
export function MovingPlatform({ x, id, y = .5 }: { x: number; id: number; y?: number }) {
 const body = useRef<RapierRigidBody>(null); const time = useRef(0); const previous = useRef({ x, y });
 useEffect(() => () => { movingSurfaces.delete(id); }, [id]);
 useFrame((_, rawDt) => {
  const s = useGame.getState(); if (s.paused || s.map || s.panel !== null || !s.started) return;
  const dt = Math.min(rawDt, .05); time.current += dt;
  const nx = x + Math.sin(time.current * 1.3) * 1.3; const ny = y + Math.sin(time.current * .9) * .35;
  movingSurfaces.set(id, { x: nx, y: ny, dx: nx - previous.current.x, dy: ny - previous.current.y, half: 1.15 });
  body.current?.setNextKinematicTranslation({ x: nx, y: ny, z: 1.5 }); previous.current = { x: nx, y: ny };
 });
 return <RigidBody ref={body} type="kinematicPosition" position={[x, y, 1.5]} colliders={false} friction={1}><CuboidCollider args={[1.15, .15, 1.3]} /><Block at={[0, 0, 0]} size={[2.3, .3, 2.6]} color={p.stone} /><Block at={[0, .18, 0]} size={[2.1, .06, 2.4]} color={p.cyan} glow /><Sparkles count={8} scale={[2.5, .5, 2]} color={p.cyan} size={2} /></RigidBody>;
}
export function TimedPlatform({ x, phase = 0 }: { x: number; phase?: number }) {
 const collider = useRef<RapierCollider>(null); const mesh = useRef<THREE.Mesh>(null); const time = useRef(phase);
 useFrame((_, rawDt) => {
  const s = useGame.getState(); if (s.paused || s.map || s.panel !== null || !s.started) return;
  time.current += Math.min(rawDt, .05); const active = time.current % 4.6 < 3.3;
  collider.current?.setEnabled(active); surfaceStates.set(`timed-${x}`, active ? 'safe' : 'fallen');
  if (mesh.current) { mesh.current.visible = active; mesh.current.scale.y = time.current % 4.6 > 2.7 ? .65 + Math.sin(time.current * 30) * .3 : 1; }
 });
 return <group position={[x, .25, 1.5]}><RigidBody type="fixed" colliders={false}><CuboidCollider ref={collider} args={[.85, .12, 1.2]} /></RigidBody><mesh ref={mesh}><boxGeometry args={[1.7, .24, 2.4]} /><meshStandardMaterial color={p.violet} emissive={p.violet} emissiveIntensity={.6} /></mesh><mesh position={[0, -.25, 0]} rotation-x={Math.PI / 2}><torusGeometry args={[.65, .025, 6, 28]} /><meshBasicMaterial color={p.violet} transparent opacity={.4} /></mesh></group>;
}
export function Challenge({ x, kind }: { x: number; kind: number }) {
 if (kind === 2) return <MovingPlatform x={x} id={kind} />;
 if (kind === 3) return <>{[-1.3, 1.3].map((dx, i) => <TimedPlatform key={i} x={x + dx} phase={i * .5} />)}</>;
 if (kind === 4) return <>{[-1.45, 0, 1.45].map((dx, i) => <CollapsingPlatform key={i} id={`step-${i}`} x={x + dx} y={i === 1 ? .65 : .2} stone delay={1.2} />)}</>;
 return <BreakableBridge x={x} stone={kind === 1} />;
}
export function SpringPad({ x }: { x: number }) {
 return <group position={[x, 0, 1.5]}><mesh position={[0, .18, 0]}><cylinderGeometry args={[.6, .6, .3, 16]} /><meshStandardMaterial color={p.gold} metalness={.5} /></mesh><mesh position={[0, .38, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[.52, 16]} /><meshStandardMaterial color={p.pink} emissive={p.pink} emissiveIntensity={.7} /></mesh><Html center position={[0, 1, 0]} zIndexRange={[4, 0]}><span className="spring-label">↑</span></Html></group>;
}
export function Checkpoint({ x, id }: { x: number; id: number }) {
 const active = useGame(s => s.checkpoint === id); const ring = useRef<THREE.Mesh>(null);
 useFrame(({ clock }) => { if (ring.current) ring.current.rotation.y = clock.elapsedTime; });
 return <group position={[x, 0, -.1]}><mesh position={[0, .1, 0]}><cylinderGeometry args={[.65, .8, .2, 16]} /><meshStandardMaterial color={p.stone} /></mesh><mesh ref={ring} position={[0, 1.1, 0]}><torusGeometry args={[.42, .07, 8, 24]} /><meshStandardMaterial color={active ? p.gold : p.cyan} emissive={active ? p.gold : p.cyan} emissiveIntensity={1.5} /></mesh>{active && <Sparkles count={10} scale={[1.5, 2, 1]} position={[0, 1, 0]} color={p.gold} size={2} />}</group>;
}
export function JumpEffects() {
 const ref = useRef<THREE.Group>(null);
 useFrame((_, rawDt) => { effects.age += Math.min(rawDt, .05); if (!ref.current) return; ref.current.position.set(effects.x, effects.y - .6, 1.5); ref.current.visible = effects.age < .55; ref.current.children.forEach((o, i) => { const t = effects.age; const a = i / 10 * Math.PI * 2; o.position.set(Math.cos(a) * t * 3, Math.sin(a) * t * 2 + t, 0); o.scale.setScalar(Math.max(0, 1 - t * 1.8)); }); });
 return <group ref={ref}>{Array.from({ length: 10 }, (_, i) => <mesh key={i}><icosahedronGeometry args={[.09, 0]} /><meshBasicMaterial color={i % 2 ? p.gold : p.cyan} /></mesh>)}</group>;
}