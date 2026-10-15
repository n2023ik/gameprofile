import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Html, Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { palette as p } from './palette';
import { districts } from './data';
import { useGame } from './store';
import { CastleLandmark, WorldModel } from './WorldModels';
type V3 = [number, number, number];
export function Block({ at, size, color, glow = false, rotation = 0 }: { at: V3; size: V3; color: string; glow?: boolean; rotation?: number }) {
  return <mesh position={at} rotation-z={rotation} castShadow receiveShadow><boxGeometry args={size} /><meshStandardMaterial color={color} emissive={glow ? color : p.dark} emissiveIntensity={glow ? 1.3 : 0} roughness={.65} /></mesh>;
}
function speckle(base: string, accent: string, brick = false) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
  const c = canvas.getContext('2d'); if (!c) return null;
  c.fillStyle = base; c.fillRect(0, 0, 128, 128);
  c.fillStyle = accent;
  for (let i = 0; i < 260; i++) { const x = (i * 47 + 13) % 128; const y = (i * 29 + 9) % 128; c.globalAlpha = .16 + (i % 3) * .1; c.fillRect(x, y, 2 + i % 4, brick ? 3 : 2); }
  c.globalAlpha = .5;
  if (brick) { for (let y = 0; y < 128; y += 16) { c.fillRect(0, y, 128, 1); for (let x = (y % 32 ? 16 : 0); x < 128; x += 32) c.fillRect(x, y, 1, 16); } }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(brick ? 3 : 5, brick ? 1 : 3); texture.magFilter = THREE.NearestFilter;
  return texture;
}
export function Island({ x, width = 14, y = 0 }: { x: number; width?: number; y?: number }) {
  const textures = useMemo(() => ({ rock: speckle(p.stoneDark, p.stoneLight, true), grass: speckle(p.grass, p.grassLight) }), []);
  useEffect(() => () => { textures.rock?.dispose(); textures.grass?.dispose(); }, [textures]);
  const rocks = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < Math.floor(width * 2.5); i++) { const g = new THREE.DodecahedronGeometry(.55 + (i % 4) * .12, 0); g.scale(1.2, 1, .8); g.translate(-width / 2 + .5 + (i % Math.floor(width)) , -1.1 - Math.floor(i / width) * .65, 2.85); geos.push(g); }
    const result = mergeGeometries(geos); geos.forEach(g => g.dispose()); return result;
  }, [width]);
  return <group position={[x, y, 0]}>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[width / 2, .35, 3.2]} position={[0, -.35, 0]} /></RigidBody>
    <mesh position={[0, -1.25, 0]} castShadow><boxGeometry args={[width - .2, 2.25, 6]} /><meshStandardMaterial map={textures.rock} color={p.stoneLight} /></mesh>
    <mesh position={[0, -.12, 0]} receiveShadow><boxGeometry args={[width, .35, 6.5]} /><meshStandardMaterial map={textures.grass} /></mesh>
    {rocks && <mesh geometry={rocks}><meshStandardMaterial color={p.stone} flatShading /></mesh>}
    <mesh position={[0, -3.3, -.2]} rotation-z={Math.PI} rotation-y={.3}><coneGeometry args={[width * .38, 3, 7]} /><meshStandardMaterial color={p.stone} flatShading side={THREE.DoubleSide} /></mesh>
    <Suspense fallback={null}>{[-5, -2, 1, 4].map((dx, i) => <WorldModel key={i} kind="rock" at={[dx, -2.7, 2.9]} height={1.7 + i % 2 * .5} rotation={i * .8} />)}</Suspense>
    {Array.from({ length: 45 }, (_, i) => <mesh key={i} position={[-width / 2 + (i * .77) % width, .12, 2.4 + (i % 3) * .3]} rotation-z={(i % 3 - 1) * .22}><coneGeometry args={[.08, .28 + i % 3 * .1, 3]} /><meshStandardMaterial color={i % 3 ? p.grass : p.grassLight} /></mesh>)}
  </group>;
}
export function Bridge({ x }: { x: number }) {
  return <group position={[x, 0, 0]}>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[2.1, .15, 2.1]} position={[0, -.18, 0]} /></RigidBody>
    {Array.from({ length: 9 }, (_, i) => <Block key={i} at={[-2 + i * .5, -.12, 0]} size={[.43, .22, 4.1]} color={i % 2 ? p.trunk : p.wall} />)}
    {[-2, 2].map(z => <group key={z}><Block at={[0, .7, z]} size={[4.7, .08, .08]} color={p.trunk} />{[-2, 0, 2].map(x => <Block key={x} at={[x, .35, z]} size={[.13, 1.2, .13]} color={p.trunk} />)}</group>)}
  </group>;
}
export function Tree({ at, pink = false, scale = 1 }: { at: V3; pink?: boolean; scale?: number }) {
  return <group position={at} scale={scale}><Suspense fallback={null}><WorldModel kind="tree" at={[0, 0, 0]} height={4.3} /></Suspense>{pink && <Sparkles count={9} scale={[3, 4, 2]} color={p.pink} position={[0, 2, 0]} size={2} />}</group>;
}
export function Waterfall({ at }: { at: V3 }) {
  const streams = useRef<THREE.Group>(null);
  useFrame(({ clock }) => { streams.current?.children.forEach((o, i) => { o.position.y = -.3 - ((clock.elapsedTime * 2.4 + i * .52) % 5.5); }); });
  return <group position={at}>
    <mesh position={[0, -2.8, 0]}><boxGeometry args={[1, 5.5, .12]} /><meshStandardMaterial color={p.water} transparent opacity={.6} emissive={p.cyan} emissiveIntensity={.4} roughness={.1} /></mesh>
    <group ref={streams}>{Array.from({ length: 12 }, (_, i) => <Block key={i} at={[(i % 4) * .25 - .4, -i * .5, .1]} size={[.035, .55 + i % 2 * .3, .04]} color={p.white} glow />)}</group>
    <Sparkles count={18} scale={[2, .7, 1.5]} position={[0, -5.4, 0]} color={p.cyan} size={3} speed={.6} />
  </group>;
}
function Roof({ y, width = 4, color = p.roof }: { y: number; width?: number; color?: string }) {
  return <group><mesh position={[0, y, 0]} rotation-y={Math.PI / 4} castShadow><coneGeometry args={[width * .84, 1.8, 4]} /><meshStandardMaterial color={color} flatShading metalness={.25} /></mesh><Block at={[0, y - .83, 0]} size={[width + .6, .17, 3.7]} color={p.steel} /></group>;
}
function Portal({ color = p.cyan }: { color?: string }) {
  const ring = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => { if (ring.current) ring.current.rotation.z += Math.min(dt, .05) * .55; });
  return <group position={[0, 2.15, .8]}>
    <mesh ref={ring} scale={[1, 1.4, 1]}><torusGeometry args={[1.15, .13, 8, 36]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} /></mesh>
    <mesh scale={[1, 1.4, 1]}><circleGeometry args={[1.08, 36]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.6} transparent opacity={.25} side={THREE.DoubleSide} /></mesh>
    <Sparkles count={20} scale={[2.2, 3.2, .5]} color={color} size={3} speed={.6} />
  </group>;
}
function Trophy() {
  return <group position={[0, 3.7, 0]}>
    <mesh><cylinderGeometry args={[.85, .35, 1.3, 10]} /><meshStandardMaterial color={p.gold} metalness={.75} roughness={.25} /></mesh>
    <Block at={[0, -.9, 0]} size={[.25, .7, .25]} color={p.gold} /><Block at={[0, -1.3, 0]} size={[1.3, .2, 1]} color={p.gold} />
    {[-1, 1].map(x => <mesh key={x} position={[x * .8, 0, 0]}><torusGeometry args={[.5, .1, 6, 16]} /><meshStandardMaterial color={p.gold} metalness={.8} roughness={.2} /></mesh>)}
  </group>;
}
export function Building({ id }: { id: number }) {
  const d = districts[id]; const accent = [p.cyan, p.cyan, p.violet, p.pink, p.gold, p.cyan, p.cyan][id] ?? p.cyan;
  if (!d) return null;
  const visit = () => { const s = useGame.getState(); if (s.nearby === id) { s.discover(id); s.setPanel(id); } };
  return <group position={[d.x, 0, -1.45]} onClick={visit}>
    {(id === 3 || id === 5 || id === 6) && <CastleLandmark x={0} id={id} />}
    {[-2.13, 2.13].map(x => <group key={x}>{[.5,1.1,1.7,2.3,2.9].map(y => <Block key={y} at={[x,y,1.47]} size={[.3,.35,.15]} color={p.stoneLight} />)}</group>)}
    <Block at={[0, .12, 0]} size={[5.5, .28, 4]} color={p.stoneLight} />
    {id === 6 ? <><Block at={[-1.6, 2, 0]} size={[.65, 4, 1]} color={p.stone} /><Block at={[1.6, 2, 0]} size={[.65, 4, 1]} color={p.stone} /><Block at={[0, 4.2, 0]} size={[4, .55, 1.2]} color={p.steel} /><Portal /></> : <>
      <Block at={[0, 1.55, 0]} size={[4.3, 3, 2.9]} color={id === 1 || id === 2 ? p.dark : p.wall} />
      {(id === 0 || id === 3 || id === 5) ? <Roof y={3.75} color={id === 3 ? p.violet : p.roof} /> : <><Block at={[0, 3.2, 0]} size={[4.8, .35, 3.4]} color={p.steel} />{[-2, 2].map(x => <Block key={x} at={[x, 2, 1.55]} size={[.16, 3.6, .16]} color={accent} glow />)}</>}
      <Block at={[0, 1, 1.48]} size={[1, 2, .1]} color={accent} glow />
      <Block at={[0, 1, 1.56]} size={[.06, 2, .08]} color={p.stoneDark} />
      {[-1.45, 1.45].map(x => <group key={x}><Block at={[x, 1.7, 1.48]} size={[.8, 1.1, .1]} color={id === 1 ? p.cyan : p.windows} glow /><Block at={[x, 1.7, 1.56]} size={[.05, 1.1, .07]} color={p.stoneDark} /><Block at={[x, 1.7, 1.56]} size={[.8, .06, .07]} color={p.stoneDark} /></group>)}
      {id === 0 && <><Block at={[1.45, 4.1, -.3]} size={[.5, 1.7, .6]} color={p.stone} /><Block at={[0, 3.8, 1.15]} size={[.65, .7, .1]} color={p.windows} glow /></>}
      {id === 1 && <><Block at={[0, 3.75, .3]} size={[3.4, 1, 1]} color={p.dark} /><Html position={[0, 3.75, .86]} center transform distanceFactor={6} zIndexRange={[4, 0]}><span className="building-word">◈ LYNKIT</span></Html><mesh position={[1.4, 4.6, 0]}><cylinderGeometry args={[.035, .035, 2, 5]} /><meshStandardMaterial color={p.steel} /></mesh></>}
      {id === 2 && <><Block at={[0, 3.7, .2]} size={[2.7, 2, 1.5]} color={p.dark} /><Block at={[0, 3.7, 1]} size={[2.5, 1.8, .1]} color={p.violet} glow /><Block at={[0, 3.7, 1.08]} size={[2.2, 1.5, .1]} color={p.dark} /><Html position={[0, 3.7, 1.2]} center transform distanceFactor={6} zIndexRange={[4, 0]}><span className="code-word">&lt;/&gt;</span></Html></>}
      {id === 3 && <Block at={[0, 4.4, .3]} size={[.75, 1.2, .2]} color={p.pink} glow />}
      {id === 4 && <Trophy />}
      {id === 5 && <mesh position={[0, 4.7, .2]} rotation-z={Math.PI / 4}><boxGeometry args={[1.2, .15, 1.2]} /><meshStandardMaterial color={p.cyan} emissive={p.cyan} emissiveIntensity={.5} /></mesh>}
    </>}
    <Html position={[0, id === 2 ? 6 : 5.9, 0]} center distanceFactor={25} zIndexRange={[5, 0]}><div className="world-sign"><span>0{id + 1}</span><strong>{d.name}</strong><small>{d.place}</small></div></Html>
    {[-1, 1].map(side => <group key={side}><Block at={[side*2.3,.35,1.6]} size={[.6,.55,.7]} color={p.stoneDark} /><mesh position={[side*2.3,.8,1.6]}><icosahedronGeometry args={[.45,1]} /><meshStandardMaterial color={id%2 ? p.pink : p.leaf} flatShading /></mesh></group>)}
    {[-2.7, 2.7].map(x => <group key={x}><Block at={[x, .8, 1.6]} size={[.07, 1.6, .07]} color={p.stoneDark} /><Block at={[x, 1.6, 1.6]} size={[.3, .4, .3]} color={p.windows} glow /></group>)}
  </group>;
}
export function Atmosphere() {
  const sky = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 256; const ctx = c.getContext('2d');
    if (ctx) { const g = ctx.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, p.skyTop); g.addColorStop(.65, p.skyMid); g.addColorStop(1, p.skyBottom); ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const skyline = useMemo(() => {
    const buildings: THREE.BufferGeometry[] = []; const windows: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 92; i++) {
      const x = i * 3 - 75; const h = 4 + ((i * 17) % 10); const z = -22 - (i % 3) * 9;
      const b = new THREE.BoxGeometry(1.8 + i % 3 * .4, h, 2); b.translate(x, h / 2 - 3, z); buildings.push(b);
      if (i % 3 === 0) { const spire = new THREE.ConeGeometry(.6, 3, 4); spire.translate(x, h - 1.5, z); buildings.push(spire); }
      for (let row = 0; row < h - 1; row += 1.2) for (let col = 0; col < 2; col++) { if ((i + col + row) % 3 < 1) continue; const w = new THREE.BoxGeometry(.18, .44, .05); w.translate(x - .42 + col * .8, row - 1.5, z + 1.05); windows.push(w); }
    }
    const b = mergeGeometries(buildings); const w = mergeGeometries(windows); buildings.forEach(g => g.dispose()); windows.forEach(g => g.dispose()); return { b, w };
  }, []);
  return <>
    <mesh position={[60, 31, -65]}><planeGeometry args={[550, 100]} /><meshBasicMaterial map={sky} fog={false} /></mesh>
    {[0, 1].map(layer => <group key={layer}>{Array.from({ length: 18 }, (_, i) => <mesh key={i} position={[i * 14 - 40, -2 + layer * 2, -48 + layer * 8]} rotation-y={i * .7}><coneGeometry args={[9 + i % 3 * 3, 10 + i % 4 * 3, 5]} /><meshStandardMaterial color={layer ? p.skyMid : p.skyTop} roughness={1} /></mesh>)}</group>)}
    <mesh position={[24, 15, -56]}><circleGeometry args={[5.3, 48]} /><meshBasicMaterial color={p.sunset} fog={false} /></mesh>
    {skyline.b && <mesh geometry={skyline.b}><meshStandardMaterial color={p.skyTop} roughness={.85} /></mesh>}
    {skyline.w && <mesh geometry={skyline.w}><meshBasicMaterial color={p.pink} /></mesh>}
    <mesh position={[52, -5.1, -4]} rotation-x={-Math.PI / 2}><planeGeometry args={[380, 90, 100, 1]} /><meshStandardMaterial color={p.water} metalness={.55} roughness={.26} /></mesh>
    <Sparkles count={65} scale={[150, 12, 8]} position={[50, 4, -3]} color={p.white} size={1.8} speed={.25} />
  </>;
}
