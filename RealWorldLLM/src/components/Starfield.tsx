import { Stars, Sparkles } from '@react-three/drei'

export default function Starfield() {
  return (
    <group>
      {/* Dense background stars */}
      <Stars
        radius={150}
        depth={100}
        count={8000}
        factor={6}
        saturation={0.5}
        fade
        speed={0.3}
      />
      
      {/* Foreground glowing dust/sparkles to give depth */}
      <Sparkles 
        count={500} 
        scale={200} 
        size={2} 
        speed={0.1} 
        opacity={0.3}
        color="#88ccff"
      />
      
      {/* Another distant star layer for parallax variation */}
      <Stars
        radius={300}
        depth={50}
        count={4000}
        factor={8}
        saturation={1.0}
        fade
        speed={0.1}
      />
    </group>
  )
}
