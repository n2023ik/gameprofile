import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, Html } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { Island, Building, Tree, Waterfall, Block } from './scenery';
import { VoxelStartIsland, VoxelSunset } from './VoxelStart';
import { Player } from './Player';
import { palette as p } from './palette';
import { coinLocations, useGame } from './store';
import { Challenge, Checkpoint, SpringPad, JumpEffects } from './Platforms';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { surfaceStates } from './Platforms';
import { ServerDiscoveryBuilding } from './McServDiscovery';
function Coins() {
  const ref = useRef<THREE.InstancedMesh>(null); const dummy = useRef(new THREE.Object3D());
  useFrame(({ clock }) => { const mesh = ref.current; if (!mesh) return; const progress = useGame.getState().progress; coinLocations.forEach((c, i) => { const d = dummy.current; d.position.set(c.x, c.y + Math.sin(clock.elapsedTime * 2 + i) * .1, 1.5); d.rotation.set(Math.PI / 2, clock.elapsedTime * 1.6, 0); d.scale.setScalar(progress.coins.includes(c.id) ? 0 : 1); d.updateMatrix(); mesh.setMatrixAt(i, d.matrix); }); mesh.instanceMatrix.needsUpdate = true; });
  return <instancedMesh ref={ref} args={[undefined, undefined, coinLocations.length]}><cylinderGeometry args={[.28, .28, .09, 12]} /><meshStandardMaterial color={p.gold} emissive={p.gold} emissiveIntensity={.35} metalness={.75} roughness={.2} /></instancedMesh>;
}
export default function GameScene({ count = 7 }: { count?: number }) {
  const low = useGame(s => s.low); const paused = useGame(s => !s.started || s.paused || s.panel !== null || s.map || s.complete);
  return <Canvas shadows={!low} dpr={low ? 1 : [1, 1.5]} camera={{ position: [3.2, 8, 24], fov: 43 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={[p.skyWarm]} /><fog attach="fog" args={[p.skyWarm, 48, 155]} />
    <ambientLight intensity={.35} /><hemisphereLight args={[p.skyClear, p.earth, .8]} />
    <directionalLight position={[-14, 16, 9]} intensity={2.5} color={p.horizon} castShadow={!low} shadow-mapSize={[2048, 2048]} shadow-bias={-.0003} shadow-normalBias={.04} shadow-camera-left={-22} shadow-camera-right={22} shadow-camera-top={16} shadow-camera-bottom={-12} shadow-radius={3} />
    <Environment resolution={64}><Lightformer intensity={.8} position={[0, 8, 4]} scale={[40, 30, 1]} /><Lightformer intensity={.6} color={p.horizon} position={[-8, 4, -10]} scale={[60, 20, 1]} /></Environment>
    <VoxelSunset />
    <Suspense fallback={null}>
      <Physics gravity={[0, -25, 0]} paused={paused} timeStep={1 / 60}>
        {Array.from({ length: count }, (_, id) => <group key={id}>{id === 0 ? <VoxelStartIsland /> : <><Island x={id * 18} /><Building id={id} />
          <Tree at={[id * 18 - 5, 0, -1.4]} scale={1.1} pink={id % 3 === 2} /><Tree at={[id * 18 + 5, 0, -2]} scale={.8} />
          <Waterfall at={[id * 18 + 4.4, -.1, 3.31]} /></>}
          <Checkpoint x={id * 18 - 4} id={id} />
          {id < count - 1 && <Challenge x={id * 18 + 9} kind={id} />}
          {id % 2 === 0 && id < 6 && <SpringPad x={id * 18 + 4.8} />}
          <RigidStep x={id * 18 + 2.5} />
        </group>)}
        <Player /><Coins /><JumpEffects /><KeyGates /><ServerDiscoveryBuilding />
      </Physics>
    </Suspense>
    {!low && <EffectComposer multisampling={0}><N8AO aoRadius={.4} intensity={.8} /><Bloom luminanceThreshold={1.2} intensity={.25} mipmapBlur /></EffectComposer>}
  </Canvas>;
}
import { RigidBody, CuboidCollider } from '@react-three/rapier';
function RigidStep({ x }: { x: number }) { return <group position={[x, 0, 1.5]}><RigidBody type="fixed" colliders={false}><CuboidCollider args={[.7, .3, .8]} position={[0, .3, 0]} /></RigidBody><Block at={[0, .3, 0]} size={[1.4, .6, 1.6]} color={p.stoneLight} /></group>; }
function KeyGates() {
 const keys = useGame(s => s.keys); const group = useRef<THREE.Group>(null);
 useFrame(({ clock, gl }) => { if (group.current) group.current.children.forEach(o => { o.rotation.y = clock.elapsedTime * 1.5; }); if (import.meta.env.DEV) gl.domElement.dataset['surfaces'] = JSON.stringify(Object.fromEntries(surfaceStates)); });
 return <><group ref={group}>{[0, 1, 2].filter(id => !keys.includes(id)).map(id => <group key={id} position={[id * 36 + 5, 3, 1.5]}><mesh><torusGeometry args={[.22, .07, 8, 20]} /><meshStandardMaterial color={p.gold} emissive={p.gold} emissiveIntensity={.8} /></mesh><Block at={[0, -.35, 0]} size={[.1, .5, .1]} color={p.gold} glow /><Block at={[.12, -.5, 0]} size={[.25, .1, .1]} color={p.gold} /></group>)}</group>{[0, 1, 2].filter(id => !keys.includes(id)).map(id => <RigidBody key={id} type="fixed" colliders={false}><CuboidCollider args={[.08, .6, 1.5]} position={[id * 36 + 6, .6, 1.5]} /><Block at={[id * 36 + 6, .6, 1.5]} size={[.12, 1.2, 3]} color={p.violet} glow /></RigidBody>)}</>;
}
