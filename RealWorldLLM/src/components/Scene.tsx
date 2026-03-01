import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import Earth from './Earth'
import OrbitalObjects from './OrbitalObjects'
import Starfield from './Starfield'
import SolarSystem from './SolarSystem'
import CameraController from './CameraController'
import Airplanes from './Airplanes'

function FallbackEarth() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#050a15" />
    </mesh>
  )
}

function isWebGLAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl'))
  } catch { return false }
}

export default function Scene() {
  if (!isWebGLAvailable()) {
    throw new Error('WebGL is not available. Please enable hardware acceleration in your browser settings.')
  }

  return (
    <Canvas
      camera={{ position: [0, 2.2, 5], fov: 45, near: 0.1, far: 2000 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.95,
      }}
      style={{ background: '#000' }}
    >
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 3, 5]} intensity={2.0} />
      <directionalLight position={[-3, -1, -3]} intensity={0.2} color="#4466aa" />

      {/* Wrap everything that loads assets in Suspense */}
      <Suspense fallback={<FallbackEarth />}>
        <Starfield />
        <SolarSystem />
        <Earth />
        <Airplanes />
        <OrbitalObjects />
        <EffectComposer>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            mipmapBlur
          />
          <Vignette darkness={0.5} offset={0.3} />
        </EffectComposer>
      </Suspense>

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} minDistance={1.05} maxDistance={1500} />
      <CameraController />
    </Canvas>
  )
}
