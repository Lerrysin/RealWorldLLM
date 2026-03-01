import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Airplane {
  id: number; lat: number; lng: number; alt: number; speed: number; heading: number;
}

function generateAirplanes(count: number): Airplane[] {
  const planes: Airplane[] = []
  for (let i = 0; i < count; i++) {
    planes.push({
      id: i,
      lat: (Math.random() - 0.5) * 140,
      lng: (Math.random() - 0.5) * 360,
      alt: 1.002 + Math.random() * 0.004,
      speed: 0.01 + Math.random() * 0.02,
      heading: Math.random() * Math.PI * 2
    })
  }
  return planes
}

export default function Airplanes() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const planes = useMemo(() => generateAirplanes(120), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(({ clock }) => {
    if (!meshRef.current || !glowRef.current) return
    const t = clock.getElapsedTime()
    const earthRot = t * 0.008

    for (let i = 0; i < planes.length; i++) {
      const p = planes[i]
      p.lat += Math.cos(p.heading) * p.speed * 0.05
      p.lng += Math.sin(p.heading) * p.speed * 0.05

      const phi = (90 - p.lat) * (Math.PI / 180)
      const theta = (p.lng + 180) * (Math.PI / 180) + earthRot
      
      const x = -(p.alt * Math.sin(phi) * Math.cos(theta))
      const z = (p.alt * Math.sin(phi) * Math.sin(theta))
      const y = (p.alt * Math.cos(phi))

      dummy.position.set(x, y, z)
      dummy.scale.setScalar(1)
      
      // Face forward
      const f_phi = (90 - (p.lat + Math.cos(p.heading)*0.5)) * (Math.PI / 180)
      const f_theta = (p.lng + Math.sin(p.heading)*0.5 + 180) * (Math.PI / 180) + earthRot
      dummy.lookAt(-(p.alt * Math.sin(f_phi) * Math.cos(f_theta)), p.alt * Math.cos(f_phi), p.alt * Math.sin(f_phi) * Math.sin(f_theta))
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)

      // Navigation light strobe
      const glowScale = (Math.sin(t * 10 + i) > 0.8) ? 0.003 : 0
      dummy.scale.setScalar(glowScale)
      dummy.updateMatrix()
      glowRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
    glowRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, planes.length]}>
        <coneGeometry args={[0.0015, 0.006, 3]} />
        <meshStandardMaterial color="#ffffff" metalness={1} roughness={0} />
      </instancedMesh>
      <instancedMesh ref={glowRef} args={[undefined, undefined, planes.length]}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
      </instancedMesh>
    </group>
  )
}
