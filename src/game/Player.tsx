import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { CapsuleCollider, RigidBody, type RapierRigidBody, useRapier, useBeforePhysicsStep } from '@react-three/rapier';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';
import adventurer from '@/assets/adventurer.asset.json';
import { controls, playerPosition, useGame, coinLocations } from './store';
import { districts } from './data';
import { allowedJump, JUMP_SPEED, DOUBLE_JUMP_SPEED, movingSurfaces, emitEffect, effects } from './mechanics';
import { sound } from './audio';
function Avatar({ speed, airborne }: { speed: React.RefObject<number>; airborne: React.RefObject<boolean> }) {
  const root = useRef<THREE.Group>(null); const { scene, animations } = useGLTF(adventurer.url);
  const model = useMemo(() => {
    const clone = SkeletonUtils.clone(scene); const b = new THREE.Box3().setFromObject(clone); const size = b.getSize(new THREE.Vector3()); clone.scale.setScalar(1.75 / size.y); const box = new THREE.Box3().setFromObject(clone); clone.position.y -= box.min.y;
    clone.traverse(o => { if (o instanceof THREE.Mesh) o.castShadow = true; }); return clone;
  }, [scene]);
  const { actions } = useAnimations(animations, root); const previous = useRef(''); const land = useRef(1); const wasAir = useRef(false);
  useFrame((_, dt) => {
    const clip = airborne.current ? 'static' : Math.abs(speed.current) > .3 ? (controls.sprint ? 'sprint' : 'walk') : 'idle';
    if (previous.current !== clip) { actions[previous.current]?.fadeOut(.12); actions[clip]?.reset().fadeIn(.12).play(); previous.current = clip; }
    if (wasAir.current && !airborne.current) land.current = .75;
    wasAir.current = airborne.current; land.current += (1 - land.current) * (1 - Math.exp(-15 * dt));
    if (root.current) { root.current.rotation.y = speed.current < -.1 ? -Math.PI / 2 : Math.PI / 2; root.current.rotation.z = airborne.current ? (playerPosition.jumps === 2 ? Math.sin(land.current * 9) * .4 : playerPosition.state === 'jumping' ? -.25 : .18) : 0; root.current.scale.y = airborne.current ? 1.07 : land.current; }
  });
  return <group ref={root} position={[0, -.85, 0]}><primitive object={model} /></group>;
}
export function Player() {
  const body = useRef<RapierRigidBody>(null); const { rapier, world } = useRapier();
  const speed = useRef(0); const airborne = useRef(false); const coyote = useRef(0); const buffer = useRef(0); const jumpHeld = useRef(false); const tick = useRef(0); const target = useMemo(() => new THREE.Vector3(), []);
  const reset = useGame(s => s.resetId); const deaths = useGame(s => s.respawns);
  const jumps = useRef(0); const wasGrounded = useRef(true); const springCooldown = useRef(0);
  useEffect(() => { const b = body.current; if (!b) return; const s = useGame.getState(); b.setTranslation({ x: (districts[s.checkpoint]?.x ?? 0) - 4, y: 2.5, z: 1.5 }, true); b.setLinvel({ x: 0, y: 0, z: 0 }, true); speed.current = 0; jumps.current = 0; }, [reset, deaths]);
  useBeforePhysicsStep(() => {
    const b = body.current; if (!b) return; const dt = 1 / 60; const s = useGame.getState(); const pos = b.translation(); const velocity = b.linvel();
    const blocked = !s.started || s.paused || s.panel !== null || s.map || s.complete;
    const ray = new rapier.Ray({ x: pos.x, y: pos.y - .75, z: pos.z }, { x: 0, y: -1, z: 0 });
    const hit = world.castRay(ray, .25, true, undefined, undefined, undefined, b); const grounded = hit !== null && velocity.y <= .8;
    if (grounded && !wasGrounded.current) { sound('land'); emitEffect('land', pos.x, pos.y); }
    wasGrounded.current = grounded;
    if (grounded) jumps.current = 0;
    if (grounded) coyote.current = .12; else coyote.current -= dt;
    if (controls.jumpPressed) { buffer.current = .12; controls.jumpPressed = false; } else buffer.current -= dt;
    let vy = velocity.y;
    const jump = allowedJump(grounded, coyote.current, jumps.current);
    if (!blocked && buffer.current > 0 && jump) { vy = jump === 'ground' ? JUMP_SPEED : DOUBLE_JUMP_SPEED; jumps.current = jump === 'ground' ? 1 : 2; buffer.current = 0; coyote.current = 0; sound(jump === 'ground' ? 'jump' : 'double'); emitEffect(jump, pos.x, pos.y); }
    if (!controls.jump && jumpHeld.current && vy > 0) vy *= .55;
    jumpHeld.current = controls.jump;
    const direction = Number(controls.right) - Number(controls.left);
    speed.current = THREE.MathUtils.damp(speed.current, blocked ? 0 : direction * (controls.sprint ? 8.5 : 5.5), grounded ? 13 : 6, dt);
    springCooldown.current -= dt;
    if (!blocked && grounded && springCooldown.current <= 0 && [4.8, 40.8, 76.8].some(x => Math.abs(pos.x - x) < .6)) { vy = 14; jumps.current = 1; springCooldown.current = .5; sound('double'); emitEffect('spring', pos.x, pos.y); }
    if (!blocked && grounded) movingSurfaces.forEach(platform => { if (Math.abs(pos.x - platform.x) < platform.half && Math.abs(pos.y - (platform.y + .98)) < .35) b.setTranslation({ x: pos.x + platform.dx, y: pos.y + platform.dy, z: 1.5 }, true); });
    b.setLinvel({ x: speed.current, y: blocked ? 0 : vy, z: 0 }, true);
    if (pos.x < -12) b.setTranslation({ x: -12, y: pos.y, z: 1.5 }, true);
    if (pos.x > 120) b.setTranslation({ x: 120, y: pos.y, z: 1.5 }, true);
    airborne.current = !grounded; playerPosition.x = pos.x; playerPosition.y = pos.y; playerPosition.grounded = grounded; playerPosition.jumps = jumps.current; playerPosition.state = grounded ? Math.abs(speed.current) > .3 ? 'running' : 'idle' : vy > 0 ? 'jumping' : 'falling';
    if (pos.y < -8) { s.fall(); return; }
    tick.current += dt;
    if (tick.current > .1 && !blocked) {
      tick.current = 0; const nearby = districts.find(d => Math.abs(pos.x - d.x) < 3 && pos.y < 3)?.id ?? null;
      const current = Math.max(0, Math.min(6, Math.round(pos.x / 18)));
      if (s.nearby !== nearby || s.current !== current) useGame.setState({ nearby, current });
      if (Math.abs(pos.x - current * 18 + 4) < .8 && s.checkpoint !== current) { useGame.setState({ checkpoint: current, warning: '' }); sound('checkpoint'); }
      coinLocations.forEach(c => { if (Math.abs(c.x - pos.x) < .8 && Math.abs(c.y - pos.y) < 1.1 && !s.progress.coins.includes(c.id)) { s.collect(c.id); emitEffect('coin', c.x, c.y); } });
      [0, 1, 2].forEach(id => { if (Math.abs(pos.x - (id * 36 + 5)) < .8 && pos.y > 1.5 && !s.keys.includes(id)) { useGame.setState({ keys: [...useGame.getState().keys, id] }); sound('checkpoint'); } });
      if (pos.x > 114.8 && s.progress.badges.length === 7 && !s.complete) useGame.setState({ complete: true });
    }
  });
  useFrame(({ camera, size, gl }, rawDt) => {
    const dt = Math.min(rawDt, .05); const s = useGame.getState(); const pos = body.current?.translation(); if (!pos) return;
    if (import.meta.env.DEV) gl.domElement.dataset['player'] = JSON.stringify(playerPosition);
    const focus = size.width < 650 ? Math.max(-3, Math.min(114, pos.x + 1)) : Math.max(3.2, Math.min(112, pos.x + 5));
    target.set(focus, size.width < 650 ? 7 : 8, size.width < 650 ? 28 : 24);
    camera.position.lerp(target, s.reduced ? 1 : 1 - Math.exp(-4 * dt)); camera.lookAt(camera.position.x, 2.1, -1);
    if (effects.shake > 0 && !s.reduced) { effects.shake -= dt; camera.position.y += Math.sin(effects.shake * 90) * .07; }
  });
  return <RigidBody ref={body} position={[-4, 2.5, 1.5]} colliders={false} enabledRotations={[false, false, false]} enabledTranslations={[true, true, false]} friction={0} restitution={0} canSleep={false}><CapsuleCollider args={[.48, .35]} /><Avatar speed={speed} airborne={airborne} /></RigidBody>;
}
