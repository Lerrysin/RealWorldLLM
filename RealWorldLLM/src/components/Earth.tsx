import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../store'

const SUN_DIR = new THREE.Vector3(5, 3, 5).normalize()

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const centerEntity = useAppStore(s => s.centerEntity)
  const searchCoords = useAppStore(s => s.searchCoords)

  const [dayMap, nightMap, specularMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    'https://unpkg.com/three-globe/example/img/earth-water.png',
  ])

  const uniforms = useMemo(() => ({
    dayMap: { value: dayMap },
    nightMap: { value: nightMap },
    specularMap: { value: specularMap },
    sunDirection: { value: SUN_DIR },
  }), [dayMap, nightMap, specularMap])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const pos = centerEntity === 'earth' ? 0 : centerEntity === 'moon' ? -60 : -300
    if (earthRef.current?.parent) {
      earthRef.current.parent.position.x = THREE.MathUtils.lerp(earthRef.current.parent.position.x, pos, 0.05)
    }
    if (earthRef.current) earthRef.current.rotation.y = t * 0.008
    if (cloudsRef.current) cloudsRef.current.rotation.y = t * 0.011
  })

  const markerPos = useMemo(() => {
    if (!searchCoords) return null
    const phi = (90 - searchCoords.lat) * (Math.PI / 180)
    const theta = (searchCoords.lng + 180) * (Math.PI / 180)
    const r = 1.01
    return new THREE.Vector3(-(r * Math.sin(phi) * Math.cos(theta)), (r * Math.cos(phi)), (r * Math.sin(phi) * Math.sin(theta)))
  }, [searchCoords])

  return (
    <group>
      {/* 1. Earth Body - Advanced Fresnel Shader */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
              vUv = uv;
              vNormal = normalize(normalMatrix * normal);
              vec4 worldPos = modelMatrix * vec4(position, 1.0);
              vViewDir = normalize(cameraPosition - worldPos.xyz);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform sampler2D dayMap;
            uniform sampler2D nightMap;
            uniform vec3 sunDirection;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewDir;
            void main() {
              vec3 day = texture2D(dayMap, vUv).rgb;
              vec3 night = texture2D(nightMap, vUv).rgb;
              float sunDot = dot(vNormal, sunDirection);
              float blend = smoothstep(-0.15, 0.15, sunDot);
              
              // Surface Color
              vec3 color = mix(night * 3.0, day, blend);
              
              // Atmosphere Fresnel Glow
              float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
              color += vec3(0.1, 0.4, 1.0) * fresnel * 0.6;

              gl_FragColor = vec4(color, 1.0);
            }
          `}
          uniforms={uniforms}
        />
        {markerPos && (
          <mesh position={markerPos}>
            <sphereGeometry args={[0.012, 16, 16]} />
            <meshBasicMaterial color="#00ffff" />
            <pointLight color="#00ffff" intensity={0.5} distance={0.5} />
          </mesh>
        )}
      </mesh>

      {/* 2. Clouds - Soft Blending */}
      <mesh ref={cloudsRef} scale={1.02}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* 3. Outer Atmos Glow Shell */}
      <mesh scale={1.08}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial color="#0066ff" transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}
