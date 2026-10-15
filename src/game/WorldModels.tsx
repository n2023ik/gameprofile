import { Suspense, useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import tower from '@/assets/castle-tower.asset.json';
import crown from '@/assets/castle-crown.asset.json';
import gate from '@/assets/castle-gate.asset.json';
import tree from '@/assets/detailed-tree.asset.json';
import rock from '@/assets/cliff-rock.asset.json';

const models = { tower: tower.url, crown: crown.url, gate: gate.url, tree: tree.url, rock: rock.url };
export function WorldModel({ kind, at, height, rotation = 0 }: { kind: keyof typeof models; at: [number, number, number]; height: number; rotation?: number }) {
 const { scene } = useGLTF(models[kind]);
 const clone = useMemo(() => {
  const object = scene.clone(true); const box = new THREE.Box3().setFromObject(object); const size = box.getSize(new THREE.Vector3()); object.scale.setScalar(height / (size.y || 1));
  const scaled = new THREE.Box3().setFromObject(object); const center = scaled.getCenter(new THREE.Vector3()); object.position.set(-center.x, -scaled.min.y, -center.z);
  object.traverse(o => { if (o instanceof THREE.Mesh) { o.castShadow = true; o.receiveShadow = true; } }); return object;
 }, [scene, height]);
 return <group position={at} rotation-y={rotation}><primitive object={clone} /></group>;
}
export function CastleLandmark({ x, id }: { x: number; id: number }) {
 return <Suspense fallback={null}><group position={[x, 0, -3.8]}>
  {[-3.5, 3.5].map(dx => <group key={dx}><WorldModel kind="tower" at={[dx, 0, 0]} height={id === 6 ? 5.4 : 4.3} /><WorldModel kind="crown" at={[dx, id === 6 ? 5.2 : 4.1, 0]} height={1.6} /></group>)}
  <WorldModel kind="gate" at={[0, 0, -.3]} height={id === 6 ? 5.3 : 4.1} />
 </group></Suspense>;
}