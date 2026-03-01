import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import gsap from 'gsap'
import { useAppStore } from '../store'
import { getOrbitData, computePosition } from '../utils/mockOrbits'

export default function CameraController() {
  const { camera, controls } = useThree() as any
  const targetId = useAppStore((s) => s.targetId)
  const centerEntity = useAppStore((s) => s.centerEntity)
  const setTransitioning = useAppStore((s) => s.setTransitioning)
  const orbitData = useMemo(() => getOrbitData(), [])

  const lastTargetId = useRef<number | null>(null)
  const lastCenterEntity = useRef<string>('earth')

  // Helper to get planet position in world space
  const getPlanetPos = (entity: string, t: number) => {
    if (entity === 'earth') {
      return new THREE.Vector3(0, 0, 0) // Simplified, assuming we reset earth center
    }
    if (entity === 'moon') {
      const angle = t * 0.05
      const dist = 60.0
      return new THREE.Vector3(Math.cos(angle) * dist, 0, Math.sin(angle) * dist)
    }
    if (entity === 'mars') {
      const angle = t * 0.02 + 1.5
      // If we are looking from Earth at Mars:
      const dist = 250
      return new THREE.Vector3(Math.cos(angle) * dist, 5, Math.sin(angle) * dist)
    }
    return new THREE.Vector3(0, 0, 0)
  }

  useEffect(() => {
    // Zoom to specific Satellite
    if (targetId !== null) {
      setTransitioning(true)
      const target = orbitData.all.find((o) => o.id === targetId)
      if (target) {
        // Evaluate at t=0 for initial tween, but we actually want dynamic tracking
        const [x, y, z] = computePosition(target, 0)
        const targetPos = new THREE.Vector3(x, y, z)
        
        // We want to look towards the centerEntity from the satellite
        const planetPos = getPlanetPos(centerEntity, 0)
        
        // Direction from planet to satellite
        const dir = new THREE.Vector3().subVectors(targetPos, planetPos).normalize()
        
        // Camera positioned behind the satellite, looking at the planet
        const camPos = targetPos.clone().add(dir.multiplyScalar(0.15))
        
        gsap.to(camera.position, {
          x: camPos.x,
          y: camPos.y + 0.05,
          z: camPos.z,
          duration: 1.5,
          ease: 'power3.inOut',
          onUpdate: () => camera.lookAt(planetPos),
          onComplete: () => setTransitioning(false),
        })
        if (controls) {
          gsap.to(controls.target, {
            x: planetPos.x,
            y: planetPos.y,
            z: planetPos.z,
            duration: 1.5,
          })
        }
      }
    } 
    // Reset to Planet Overview when switching Center Entity or deselecting
    else if (lastTargetId.current !== null || lastCenterEntity.current !== centerEntity) {
      setTransitioning(true)
      const dist = centerEntity === 'earth' ? 4 : centerEntity === 'moon' ? 2 : 3
      const planetPos = getPlanetPos(centerEntity, 0)
      
      gsap.to(camera.position, {
        x: planetPos.x,
        y: planetPos.y + dist * 0.4,
        z: planetPos.z + dist,
        duration: 1.5,
        ease: 'power2.inOut',
        onComplete: () => setTransitioning(false),
      })
      if (controls) {
        gsap.to(controls.target, { 
          x: planetPos.x, 
          y: planetPos.y, 
          z: planetPos.z, 
          duration: 1.5 
        })
      }
    }

    lastTargetId.current = targetId
    lastCenterEntity.current = centerEntity
  }, [targetId, centerEntity, camera, controls, orbitData, setTransitioning])

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const planetPos = getPlanetPos(centerEntity, t)

    // Follow target satellite if one is selected and not transitioning
    if (targetId !== null && !useAppStore.getState().isTransitioning) {
      const target = orbitData.all.find((o) => o.id === targetId)
      if (target) {
        const [x, y, z] = computePosition(target, t)
        const targetPos = new THREE.Vector3(x, y, z)
        
        // Frame the shot: Satellite in foreground, planet in background
        const dir = new THREE.Vector3().subVectors(targetPos, planetPos).normalize()
        const idealCamPos = targetPos.clone().add(dir.multiplyScalar(0.08)).add(new THREE.Vector3(0, 0.02, 0))
        
        camera.position.lerp(idealCamPos, 0.1)
        
        if (controls) {
          controls.target.lerp(planetPos, 0.1)
        } else {
          camera.lookAt(planetPos)
        }
      }
    } else if (targetId === null && !useAppStore.getState().isTransitioning) {
      // Just track the planet slightly if moving
      if (controls) {
        controls.target.lerp(planetPos, 0.1)
      }
    }
  })

  return null
}
