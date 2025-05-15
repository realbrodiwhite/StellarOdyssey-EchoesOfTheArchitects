import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

interface ArtifactModelProps {
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export default function ArtifactModel({ 
  scale = 2.5, 
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: ArtifactModelProps) {
  const modelRef = useRef<THREE.Group>(null);
  
  // Preload the model
  useGLTF.preload('/models/alien_artifact.glb');
  
  // Load model
  const { scene: artifactModel } = useGLTF('/models/alien_artifact.glb') as GLTF & {
    scene: THREE.Group
  };
  
  // Create a clone of the model to avoid modifying the original
  const modelClone = artifactModel.clone();
  
  // Add subtle rotation animation
  useFrame((state, delta) => {
    if (modelRef.current) {
      modelRef.current.rotation.y += delta * 0.2; // Rotate around Y axis
      modelRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.05; // Subtle wobble
    }
  });
  
  // Apply emissive materials to make parts glow
  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // Make sure material is a MeshStandardMaterial
          if (child.material instanceof THREE.MeshStandardMaterial) {
            // Add emissive glow to transparent or light-colored parts
            if (child.material.transparent || 
               (child.material.color.r > 0.7 && child.material.color.g > 0.7 && child.material.color.b > 0.7)) {
              child.material.emissive = new THREE.Color(0x33ccff);
              child.material.emissiveIntensity = 0.5;
            }
          }
        }
      });
    }
  }, []);
  
  return (
    <group 
      ref={modelRef} 
      position={new THREE.Vector3(...position)}
      rotation={new THREE.Euler(...rotation)}
      scale={[scale, scale, scale]}
    >
      <primitive object={modelClone} />
    </group>
  );
}