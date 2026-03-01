import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import {
  getOrbitData,
  computePosition,
  type OrbitalObject,
} from '../utils/mockOrbits'
import { useAppStore } from '../store'

/* Debris field */
function DebrisField({ debris }: { debris: OrbitalObject[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const matrix = useMemo(() => new THREE.Matrix4(), [])
  const color = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < debris.length; i++) {
      const g = 0.3 + Math.random() * 0.1
      color.setRGB(g, g, g) 
      mesh.setColorAt(i, color)
    }
    mesh.instanceColor!.needsUpdate = true
  }, [debris])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < debris.length; i++) {
      const o = debris[i]
      const [x, y, z] = computePosition(o, t)
      const s = 0.0022 + (i % 5) * 0.0003
      matrix.set(s, 0, 0, x, 0, s, 0, y, 0, 0, s, z, 0, 0, 0, 1)
      mesh.setMatrixAt(i, matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, debris.length]} frustumCulled={true}>    
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial metalness={0.4} roughness={0.8} color="#666" />
    </instancedMesh>
  )
}

function SatelliteField({ satellites }: { satellites: OrbitalObject[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const matrix = useMemo(() => new THREE.Matrix4(), [])
  const color = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < satellites.length; i++) {
      const v = 0.7 + Math.random() * 0.2
      color.setRGB(v, v, v)
      mesh.setColorAt(i, color)
    }
    mesh.instanceColor!.needsUpdate = true
  }, [satellites])

  useFrame(({ clock }) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = clock.getElapsedTime()
    for (let i = 0; i < satellites.length; i++) {
      const o = satellites[i]
      const [x, y, z] = computePosition(o, t)
      const s = o.region === 'geo' ? 0.008 : 0.004
      matrix.set(s*2, 0, 0, x, 0, s, 0, y, 0, 0, s*0.8, z, 0, 0, 0, 1)
      mesh.setMatrixAt(i, matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, satellites.length]} frustumCulled={true}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial metalness={0.9} roughness={0.2} color="#aaa" />
    </instancedMesh>
  )
}

function RemoteSensingModel({ isSelected }: { isSelected: boolean }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.5, 2.5, 1.2]} />
        <meshStandardMaterial color={isSelected ? "#fff" : "#ddd"} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[2.5, 0, 0]}>
        <boxGeometry args={[3.5, 2.0, 0.05]} />
        <meshStandardMaterial color="#112244" metalness={1.0} />
      </mesh>
      <mesh position={[0, -1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  )
}

function TargetSatellite({ orbit }: { orbit: OrbitalObject }) {
  const groupRef = useRef<THREE.Group>(null)
  const setTarget = useAppStore((s) => s.setTarget)
  const targetId = useAppStore((s) => s.targetId)

  const isSelected = targetId === orbit.id
  const modelScale = orbit.region === 'geo' ? 0.03 : 0.015

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const [x, y, z] = computePosition(orbit, clock.getElapsedTime())
    groupRef.current.position.set(x, y, z)
    groupRef.current.lookAt(0, 0, 0)
  })

  return (
    <group ref={groupRef}>
      <group scale={modelScale}>
        {orbit.type === 'rs' ? <RemoteSensingModel isSelected={isSelected} /> : (
          <mesh>
            <boxGeometry args={[2, 1, 1]} />
            <meshStandardMaterial color={isSelected ? "#fff" : "#aaa"} metalness={0.9} />
          </mesh>
        )}
        <mesh onClick={(e) => { e.stopPropagation(); setTarget(orbit.id, orbit.rsMetadata); }}>
          <sphereGeometry args={[12, 8, 8]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
      {/* 閳光偓閳光偓 Trail and Light Effects Removed 閳光偓閳光偓 */}
    </group>
  )
}

function TargetLabel({ orbit }: { orbit: OrbitalObject }) {
  const groupRef = useRef<THREE.Group>(null)
  const targetId = useAppStore((s) => s.targetId)
  const setTarget = useAppStore((s) => s.setTarget)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const [x, y, z] = computePosition(orbit, clock.getElapsedTime())
    groupRef.current.position.set(x, y, z)
  })

  if (targetId !== null) return null

  return (
    <group ref={groupRef}>
      <Html center distanceFactor={8}>
        <button className="sat-label" onClick={(e) => { e.stopPropagation(); setTarget(orbit.id, orbit.rsMetadata); }}>
          {orbit.name}
        </button>
      </Html>
    </group>
  )
}

export default function OrbitalObjects() {
  const data = useMemo(() => getOrbitData(), [])
  return (
    <>
      <DebrisField debris={data.debris} />
      <SatelliteField satellites={data.satellites} />
      {[...data.targets, ...data.rs].map((t) => <TargetSatellite key={t.id} orbit={t} />)}
      {[...data.targets, ...data.rs].map((t) => <TargetLabel key={`label-${t.id}`} orbit={t} />)}
      <Line points={useMemo(() => {
        const pts = []; for(let i=0; i<=128; i++) { const a = (i/128)*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*1.08, 0, Math.sin(a)*1.08)); } return pts;
      }, [])} color="#44ddff" lineWidth={0.5} opacity={0.1} transparent />
    </>
  )
}
