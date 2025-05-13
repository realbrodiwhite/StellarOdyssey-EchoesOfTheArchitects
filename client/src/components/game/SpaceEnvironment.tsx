import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { 
  Environment, 
  OrbitControls, 
  Stars,
  useKeyboardControls
} from "@react-three/drei";
import * as THREE from "three";
import { useCharacter } from "@/lib/stores/useCharacter";
import { useStory } from "@/lib/stores/useStory";
import { usePuzzle } from "@/lib/stores/usePuzzle";
import { useCombat } from "@/lib/stores/useCombat";
import { Controls } from "@/lib/types";
import Player from "./Player";
import Scene from "./Scene";

interface SpaceEnvironmentProps {
  onEnterCombat: () => void;
  onEnterPuzzle: () => void;
}

const SpaceEnvironment = ({ onEnterCombat, onEnterPuzzle }: SpaceEnvironmentProps) => {
  const { getCurrentLocation } = useStory();
  const { startPuzzle } = usePuzzle();
  const { startCombat } = useCombat();
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Scene references
  const floorRef = useRef<THREE.Mesh>(null);
  const lightsRef = useRef<THREE.Group>(null);
  
  // Get the current location data
  const currentLocation = getCurrentLocation();
  
  // Handle interactions when close to interactables
  const [nearbyInteractable, setNearbyInteractable] = useState<
    { type: "puzzle" | "enemy", id: string } | null
  >(null);
  
  useEffect(() => {
    // Check for nearby interactions every 100ms
    const interval = setInterval(() => {
      const keys = getKeys();
      
      // Process interaction key press
      if (keys.interact && nearbyInteractable) {
        if (nearbyInteractable.type === "puzzle") {
          // Start puzzle and transition to puzzle screen
          const puzzleStarted = startPuzzle(nearbyInteractable.id);
          if (puzzleStarted) {
            onEnterPuzzle();
          }
        } else if (nearbyInteractable.type === "enemy") {
          // Find enemy data and start combat
          // This would connect to the actual enemy data
          const mockEnemy = {
            id: nearbyInteractable.id,
            name: "Space Drone",
            health: 50,
            maxHealth: 50,
            damage: 8,
            abilities: [],
            description: "A hostile security drone.",
            reward: { experience: 50 }
          };
          
          startCombat(mockEnemy);
          onEnterCombat();
        }
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [
    nearbyInteractable, 
    startPuzzle, 
    startCombat, 
    onEnterPuzzle, 
    onEnterCombat, 
    getKeys
  ]);
  
  useFrame((state, delta) => {
    // Rotate lights for dynamic lighting effect
    if (lightsRef.current) {
      lightsRef.current.rotation.y += delta * 0.1;
    }
  });
  
  return (
    <>
      {/* Environment lighting */}
      <Environment preset="night" />
      
      {/* Dynamic lighting group */}
      <group ref={lightsRef}>
        <directionalLight 
          position={[10, 15, 5]} 
          intensity={0.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-5, 8, -10]} intensity={0.5} color="#3366ff" />
        <pointLight position={[5, 2, 0]} intensity={0.3} color="#ff3366" />
      </group>
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.3} />
      <hemisphereLight intensity={0.1} color="#88ccff" groundColor="#884466" />
      
      {/* Background stars */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* Scene content based on current location */}
      <Scene 
        locationType={currentLocation?.type} 
        onDetectInteractable={setNearbyInteractable}
      />
      
      {/* Player character */}
      <Player />
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={false}
        maxPolarAngle={Math.PI / 2 - 0.1}
        minDistance={3}
        maxDistance={15}
        target={[0, 1, 0]}
      />
    </>
  );
};

export default SpaceEnvironment;
