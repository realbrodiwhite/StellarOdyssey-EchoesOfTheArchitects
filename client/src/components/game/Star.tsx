import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface StarProps {
  position: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  pulsate?: boolean;
}

const Star = ({ 
  position, 
  color = "white", 
  size = 0.05, 
  speed = 1,
  pulsate = false
}: StarProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Add a unique random seed for this star
  const seed = useRef(Math.random() * 100);
  
  // Animate the stars
  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (pulsate) {
      // Make the star pulsate - size variation
      const time = state.clock.elapsedTime + seed.current;
      const pulseFactor = Math.sin(time * speed) * 0.2 + 1;
      meshRef.current.scale.set(
        size * pulseFactor,
        size * pulseFactor,
        size * pulseFactor
      );
      
      // Also slightly vary the color for a twinkling effect
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      const intensity = Math.sin(time * speed * 2) * 0.3 + 0.7;
      material.emissiveIntensity = intensity;
    }
    
    // Optionally add slow rotation
    meshRef.current.rotation.y += delta * 0.1 * speed;
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={1} 
      />
    </mesh>
  );
};

export default Star;
