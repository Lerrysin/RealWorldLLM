import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store'

const SUN_DIR = new THREE.Vector3(5, 3, 5).normalize()
const SUN_POS = SUN_DIR.clone().multiplyScalar(500)

export default function SolarSystem() {
  const moonRef = useRef<THREE.Group>(null)
  const marsRef = useRef<THREE.Group>(null)
  const centerEntity = useAppStore(s => s.centerEntity)

  // Use more reliable textures
  const [moonMap, marsMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-night.jpg', // Using night map as moon proxy for better reliability
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg' 
  ])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (moonRef.current) {
      const angle = t * 0.05
      const dist = centerEntity === 'moon' ? 0 : 60.0
      moonRef.current.position.set(Math.cos(angle) * dist, 0, Math.sin(angle) * dist)
    }
    if (marsRef.current) {
      const angle = t * 0.02 + 1.5
      const dist = centerEntity === 'mars' ? 0 : 300
      marsRef.current.position.set(Math.cos(angle) * dist, 10, Math.sin(angle) * dist)
    }
  })

  return (
    <group>
      <mesh position={SUN_POS}>
        <sphereGeometry args={[10, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      <group ref={moonRef}>
        <mesh>
          <sphereGeometry args={[0.27, 32, 32]} />
          <meshStandardMaterial map={moonMap} color="#666" />
        </mesh>
      </group>

      <group ref={marsRef}>
        <mesh>
          <sphereGeometry args={[0.53, 32, 32]} />
          <meshStandardMaterial map={marsMap} color="#ff8844" />
        </mesh>
      </group>
    </group>
  )
}
