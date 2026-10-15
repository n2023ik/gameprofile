import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import { CuboidCollider, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { palette as p } from './palette';
import { useGame } from './store';

type Part = { at: [number, number, number]; size: [number, number, number]; color: string; rotation?: number };
const part = (list: Part[], x: number, y: number, z: number, w: number, h: number, d: number, color: string, rotation = 0) => list.push({ at: [x, y, z], size: [w, h, d], color, rotation });

// Authored voxel assemblies are baked to vertex-colored geometry, not individual draw calls.
function VoxelMesh({ parts, texture = false, glow = false }: { parts: Part[]; texture?: boolean; glow?: boolean }) {
  const geometry = useMemo(() => {
    const pieces = parts.map(b => {
      const g = new THREE.BoxGeometry(...b.size); g.rotateZ(b.rotation ?? 0); g.translate(...b.at);
      const c = new THREE.Color(b.color); const colors = new Float32Array(g.getAttribute('position').count * 3);
      for (let i = 0; i < colors.length; i += 3) { colors[i] = c.r; colors[i + 1] = c.g; colors[i + 2] = c.b; }
      g.setAttribute('color', new THREE.BufferAttribute(colors, 3)); return g;
    });
    const merged = mergeGeometries(pieces); pieces.forEach(g => g.dispose()); return merged;
  }, [parts]);
  const map = useMemo(() => {
    if (!texture) return null;
    const c = document.createElement('canvas'); c.width = c.height = 32; const ctx = c.getContext('2d');
    if (!ctx) return null;
    ctx.fillStyle = p.white; ctx.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 90; i++) { ctx.globalAlpha = .04 + (i % 4) * .02; ctx.fillStyle = p.earth; ctx.fillRect((i * 13) % 32, (i * 19) % 32, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }, [texture]);
  useEffect(() => () => { geometry?.dispose(); map?.dispose(); }, [geometry, map]);
  if (!geometry) return null;
  return <mesh geometry={geometry} castShadow={!glow} receiveShadow><meshStandardMaterial vertexColors map={map} roughness={glow ? .3 : .88} emissive={glow ? p.gold : p.dark} emissiveIntensity={glow ? .65 : 0} /></mesh>;
}

function addTree(parts: Part[], x: number, y: number, z: number, scale = 1) {
  const b = (dx: number, dy: number, dz: number, w: number, h: number, d: number, color: string) => part(parts, x + dx * scale, y + dy * scale, z + dz * scale, w * scale, h * scale, d * scale, color);
  b(0, 1.45, 0, .42, 2.9, .42, p.bark);
  b(-.45, 2.15, 0, 1.05, .27, .3, p.trunk); b(.48, 2.55, .2, 1.2, .3, .3, p.bark);
  for (let layer = 0; layer < 4; layer++) for (let ix = -2; ix <= 2; ix++) for (let iz = -2; iz <= 2; iz++) {
    if (Math.abs(ix) + Math.abs(iz) > (layer === 3 ? 2 : 3) || ((ix * 7 + iz * 3 + layer) % 11 === 0)) continue;
    b(ix * .49, 2.55 + layer * .45, iz * .49, .58, .56, .58, [p.foliage, p.leaf, p.foliageSun, p.grassLight][Math.abs(ix + iz + layer) % 4] ?? p.leaf);
  }
  b(.5, .13, 0, .9, .22, .25, p.bark); b(-.1, .13, .45, .25, .22, .9, p.trunk);
}

function makeIsland() {
  const terrain: Part[] = [], details: Part[] = [], lights: Part[] = [];
  // Interlocking strata taper into a natural irregular floating-island silhouette.
  for (let ix = -9; ix <= 9; ix++) for (let iz = -7; iz <= 5; iz++) {
    const x = ix * .74, z = iz * .74;
    if ((Math.abs(ix) > 7 && Math.abs(iz) > 4) || (ix === -9 && iz < -3)) continue;
    const river = x > 2.1 && x < 3.7;
    const top = z < -3.1 ? .55 + ((ix + iz + 30) % 3) * .35 : river ? -.25 : .05;
    const depth = 3 + ((ix * 17 + iz * 11 + 500) % 5) * .32;
    for (let level = 0; level < Math.ceil(depth / .65); level++) {
      if (level > 2 && (Math.abs(ix) > 9 - (level - 2) || Math.abs(iz + 1) > 7 - (level - 2))) continue;
      part(terrain, x, top - .32 - level * .65, z, .735, .64, .735, level === 0 ? p.earth : ([p.stone, p.stoneDark, p.earth, p.earthLight, p.steel][Math.abs(ix * 3 + iz + level) % 5] ?? p.stone));
    }
    if (!river) part(terrain, x, top - .045, z, .75, .12, .75, [p.grass, p.leaf, p.foliageSun][Math.abs(ix + iz) % 3] ?? p.grass);
    if (!river && z > 2.6 && (ix + iz) % 2 === 0) {
      part(details, x, top + .13, z, .055, .26, .055, p.grassLight);
      part(details, x + .16, top + .09, z + .12, .05, .18, .05, p.foliageSun);
      if (ix % 3 === 0) part(lights, x, top + .28, z, .13, .08, .13, p.gold);
    }
    if (z > 2.8 && Math.abs(ix % 4) === 1) for (let n = 0; n < 3; n++) part(details, x + n * .14, -.5 - n * .26, z + .36, .15, .35, .08, p.moss);
  }
  // Recessed stepping path follows the playable lane. River crossing remains flush with existing ground.
  for (let i = 0; i < 28; i++) {
    const x = -6.6 + i * .48; if (x > 1.6 && x < 4.2) continue;
    part(details, x, .066, 1.5 + Math.sin(i * .9) * .07, .43, .055, .9, i % 3 ? p.path : p.masonry);
  }
  // Masonry arch over the river, made of voussoirs, pilasters, individual deck stones and parapets.
  for (let row = 0; row < 2; row++) for (let i = 0; i < 7; i++) {
    part(details, 1.6 + i * .46, .027, .96 + row * .65, .44, .09, .62, (i + row) % 2 ? p.masonry : p.stoneLight);
  }
  for (const z of [.55, 2.27]) {
    for (let i = 0; i < 11; i++) {
      const a = Math.PI * i / 10;
      part(details, 3 + Math.cos(a) * 1.45, -.95 + Math.sin(a) * .8, z, .42, .36, .26, i % 2 ? p.stoneLight : p.masonry, a - Math.PI / 2);
    }
    for (const x of [1.55, 4.45]) { part(details, x, -.7, z, .5, 1.4, .5, p.stone); part(details, x, .37, z, .4, .7, .4, p.masonry); part(details, x, .76, z, .52, .14, .52, p.path); }
    for (let i = 0; i < 7; i++) part(details, 1.65 + i * .45, .27, z, .42, .36, .24, i % 2 ? p.stone : p.stoneLight);
    part(details, 3, .5, z, 3.3, .13, .32, p.masonry);
  }
  // Voxel headquarters: recessed windows, buttresses, stepped slate roof and chimney.
  for (let row = 0; row < 7; row++) for (let col = 0; col < 9; col++) {
    const x = -3.3 + col * .48; const y = .23 + row * .42;
    const window = row > 1 && row < 5 && (col === 1 || col === 2 || col === 6 || col === 7);
    const door = col >= 4 && col <= 5 && row < 5;
    part(window || door ? lights : details, x, y, -1.05, .46, .4, .32, window ? p.windows : door ? p.horizon : ([p.masonry, p.wall, p.stoneLight][(col + row) % 3] ?? p.wall));
  }
  part(details, -1.38, 1.4, -2.4, 4.4, 2.8, 2.5, p.stone);
  // Window grid and door framing sit in front of the backing wall.
  for (const x of [-2.58, -.95, .32]) { part(details, x, 1.52, -.83, .07, 1.6, .12, p.bark); part(details, x, 1.52, -.8, .9, .07, .12, p.bark); }
  for (const x of [-3.55, .95]) { part(details, x, 1.6, -1, .28, 3.2, .5, p.stoneDark); part(details, x, 3.22, -1, .46, .17, .64, p.path); }
  for (let layer = 0; layer < 6; layer++) {
    const width = 5.4 - layer * .67;
    part(details, -1.3, 3.05 + layer * .24, -2.1, width, .25, 3.7, layer % 2 ? p.dusk : p.roof);
    for (const z of [-.18, -4.02]) part(details, -1.3, 3.03 + layer * .24, z, width + .08, .12, .16, p.steel);
  }
  part(details, -2.7, 4.3, -2.6, .55, 1.5, .6, p.stoneDark); part(details, -2.7, 5.05, -2.6, .74, .17, .78, p.masonry);
  part(details, -1.4, .13, -.23, 2, .2, 1, p.masonry); part(details, -1.4, .06, .28, 2.4, .1, .4, p.path);
  // Trees and shrubs use a consistent smaller voxel grid, never a single block crown.
  addTree(details, -5.3, .05, -1.55, .93); addTree(details, 5.3, .05, -2, .87); addTree(details, -4.4, .8, -4.6, .7);
  for (const x of [-5.8, -.1, 5.8]) for (let i = 0; i < 7; i++) part(details, x + (i % 3) * .22, .17 + Math.floor(i / 3) * .18, 3.2, .28, .28, .32, i % 2 ? p.foliageSun : p.leaf);
  for (const [x, z] of [[-4, 2.7], [.7, 2.7], [5.4, 2.8], [-3.9, -.4], [1, -.4]] as [number, number][]) {
    part(details, x, .7, z, .1, 1.4, .1, p.stoneDark); part(details, x, 1.48, z, .4, .12, .4, p.bark); part(lights, x, 1.27, z, .23, .32, .23, p.gold); part(details, x, 1.07, z, .35, .1, .35, p.stoneDark);
  }
  return { terrain, details, lights };
}

function IslandWater() {
  const streaks = useRef<THREE.Group>(null);
  const water = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d');
    if (ctx) { ctx.fillStyle = p.river; ctx.fillRect(0, 0, 64, 64); for (let i = 0; i < 35; i++) { ctx.globalAlpha = .12 + i % 3 * .1; ctx.fillStyle = i % 2 ? p.foam : p.cyan; ctx.fillRect(i * 17 % 64, i * 31 % 64, 2, 4 + i % 8); } }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; t.repeat.set(1, 5); return t;
  }, []);
  useEffect(() => () => water.dispose(), [water]);
  useFrame((_, rawDt) => { const dt = Math.min(rawDt, .05); water.offset.y -= dt * .32; streaks.current?.children.forEach((s, i) => { s.position.y -= dt * (2.4 + i % 3 * .5); if (s.position.y < -5.2) s.position.y = -.25; }); });
  return <>
    <mesh position={[2.96, -.13, -.56]} rotation-x={-Math.PI / 2}><planeGeometry args={[1.5, 8.6]} /><meshStandardMaterial map={water} color={p.foam} roughness={.2} metalness={.35} transparent opacity={.9} /></mesh>
    <mesh position={[2.96, -2.7, 3.79]}><planeGeometry args={[1.5, 5.25]} /><meshStandardMaterial map={water} color={p.foam} roughness={.24} metalness={.12} transparent opacity={.82} emissive={p.river} emissiveIntensity={.14} side={THREE.DoubleSide} /></mesh>
    <group ref={streaks}>{Array.from({ length: 20 }, (_, i) => <mesh key={i} position={[2.28 + i % 7 * .2, -.3 - i * .24, 3.82]}><boxGeometry args={[.025 + i % 2 * .03, .24 + i % 4 * .16, .025]} /><meshBasicMaterial color={p.foam} transparent opacity={.6} /></mesh>)}</group>
    <Sparkles count={28} position={[3, -5.12, 3.9]} scale={[2.2, .6, 1]} color={p.foam} size={3} speed={.45} />
  </>;
}

export function VoxelStartIsland() {
  const model = useMemo(makeIsland, []);
  const visit = () => { const s = useGame.getState(); if (s.nearby === 0) { s.discover(0); s.setPanel(0); } };
  return <group>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[7, .35, 3.2]} position={[0, -.35, 0]} /></RigidBody>
    <VoxelMesh parts={model.terrain} texture /><group onClick={visit}><VoxelMesh parts={model.details} texture /><VoxelMesh parts={model.lights} glow /></group>
    <IslandWater />
    <Html position={[-1.2, 5.45, -1.5]} center distanceFactor={25} zIndexRange={[5, 0]}><div className="world-sign"><span>01</span><strong>About Me</strong><small>The starting island</small></div></Html>
    <pointLight position={[-1.3, 1.4, -.3]} color={p.horizon} intensity={3} distance={5} decay={2} />
  </group>;
}

export function VoxelSunset() {
  const reflection = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 128; c.height = 128; const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = p.river; ctx.fillRect(0, 0, 128, 128);
      for (let i = 0; i < 160; i++) { ctx.globalAlpha = .08 + i % 5 * .035; ctx.fillStyle = i % 7 === 0 ? p.horizon : i % 3 ? p.dusk : p.foam; ctx.fillRect(i * 47 % 128, i * 31 % 128, 3 + i % 11, 1); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(28, 16); t.magFilter = THREE.NearestFilter; return t;
  }, []);
  useFrame((_, rawDt) => { reflection.offset.x += Math.min(rawDt, .05) * .012; });
  const mountains = useMemo(() => {
    const list: Part[] = [];
    for (let layer = 0; layer < 3; layer++) for (let peak = 0; peak < 19; peak++) {
      const x = peak * 13 - 65, z = -40 - layer * 16, height = 4 + (peak * 7 + layer * 3) % 9;
      for (let step = 0; step < 8; step++) {
        const width = 18 - step * 1.8;
        part(list, x + Math.sin(peak * 3) * step * .8, -3 + step * height / 8, z, width, height / 8 + .1, 12 - step * .8, [p.dusk, p.skyClear, p.skyWarm][layer] ?? p.dusk);
      }
    }
    return list;
  }, []);
  const sky = useMemo(() => {
    const c = document.createElement('canvas'); c.width = 4; c.height = 256; const ctx = c.getContext('2d');
    if (ctx) { const gradient = ctx.createLinearGradient(0, 0, 0, 256); gradient.addColorStop(0, p.dusk); gradient.addColorStop(.48, p.skyClear); gradient.addColorStop(.78, p.skyWarm); gradient.addColorStop(1, p.horizon); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 4, 256); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }, []);
  const clouds = useMemo(() => {
    const list: Part[] = [];
    for (let i = 0; i < 12; i++) for (let j = 0; j < 5; j++) part(list, -40 + i * 18 + j * 2.5, 18 + i % 3 * 3 + (j === 2 ? 1 : 0), -65 - i % 2 * 8, 4, .6 + j % 2 * .5, 1.8, p.cloud);
    return list;
  }, []);
  useEffect(() => () => { sky.dispose(); reflection.dispose(); }, [sky, reflection]);
  return <>
    <mesh position={[60, 38, -110]}><planeGeometry args={[650, 160]} /><meshBasicMaterial map={sky} fog={false} /></mesh>
    <mesh position={[18, 13, -83]}><circleGeometry args={[6.6, 64]} /><meshBasicMaterial color={p.horizon} fog={false} /></mesh>
    <VoxelMesh parts={mountains} /><VoxelMesh parts={clouds} />
    <mesh position={[50, -5.55, -6]} rotation-x={-Math.PI / 2}><planeGeometry args={[350, 100]} /><meshStandardMaterial map={reflection} metalness={.4} roughness={.27} /></mesh>
    <Sparkles count={36} scale={[100, 8, 6]} position={[35, 2, -1]} color={p.gold} size={1.5} speed={.2} />
  </>;
}