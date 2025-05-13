import { useRef, useEffect, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { LocationType } from "@/lib/types";

interface SceneProps {
  locationType?: LocationType;
  onDetectInteractable: (interactable: { type: "puzzle" | "enemy"; id: string } | null) => void;
}

const Scene = ({ locationType = LocationType.Ship, onDetectInteractable }: SceneProps) => {
  const { scene } = useThree();
  
  // References
  const floorRef = useRef<THREE.Mesh>(null);
  const puzzleRef = useRef<THREE.Mesh>(null);
  const enemyRef = useRef<THREE.Mesh>(null);
  
  // Load textures
  const floorTextures = {
    [LocationType.Ship]: useTexture("/textures/asphalt.png"),
    [LocationType.Station]: useTexture("/textures/asphalt.png"),
    [LocationType.Planet]: useTexture("/textures/grass.png"),
    [LocationType.Space]: useTexture("/textures/asphalt.png"),
    [LocationType.Derelict]: useTexture("/textures/asphalt.png"),
  };
  
  // Set texture repeat based on location type
  useMemo(() => {
    const texture = floorTextures[locationType];
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);
    return texture;
  }, [locationType, floorTextures]);
  
  // Scene background color based on location
  useEffect(() => {
    const backgroundColors = {
      [LocationType.Ship]: new THREE.Color("#111122"),
      [LocationType.Station]: new THREE.Color("#112233"),
      [LocationType.Planet]: new THREE.Color("#113322"),
      [LocationType.Space]: new THREE.Color("#000011"),
      [LocationType.Derelict]: new THREE.Color("#221111"),
    };
    
    scene.background = backgroundColors[locationType];
    
    return () => {
      scene.background = new THREE.Color("#000000");
    };
  }, [locationType, scene]);
  
  // Generate pseudo-random positions based on location type
  const positions = useMemo(() => {
    // Use a seeded random number generator for stable positions
    const seed = locationType.charCodeAt(0) * 100;
    const getPosition = (base: number) => {
      const x = Math.sin(base * seed) * 15;
      const z = Math.cos(base * seed + 42) * 15;
      return [x, 0, z];
    };
    
    return {
      puzzle: getPosition(0.3),
      enemy: getPosition(0.7),
    };
  }, [locationType]);
  
  // Detection for nearby interactables
  useFrame(({ camera }) => {
    const playerPosition = new THREE.Vector3();
    camera.getWorldPosition(playerPosition);
    playerPosition.y = 0; // Only consider horizontal distance
    
    let nearestInteractable: { type: "puzzle" | "enemy"; id: string; distance: number } | null = null;
    
    // Check puzzle proximity
    if (puzzleRef.current) {
      const puzzlePosition = puzzleRef.current.position.clone();
      const distance = playerPosition.distanceTo(puzzlePosition);
      
      if (distance < 3) {
        nearestInteractable = { type: "puzzle", id: "puzzle_" + locationType, distance };
      }
    }
    
    // Check enemy proximity
    if (enemyRef.current) {
      const enemyPosition = enemyRef.current.position.clone();
      const distance = playerPosition.distanceTo(enemyPosition);
      
      if (distance < 3 && (!nearestInteractable || distance < nearestInteractable.distance)) {
        nearestInteractable = { type: "enemy", id: "enemy_" + locationType, distance };
      }
    }
    
    // Update parent with detection
    if (nearestInteractable) {
      onDetectInteractable({ type: nearestInteractable.type, id: nearestInteractable.id });
    } else {
      onDetectInteractable(null);
    }
  });
  
  return (
    <>
      {/* Floor/ground */}
      <mesh 
        ref={floorRef} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.1, 0]} 
        receiveShadow
      >
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          map={floorTextures[locationType]} 
          roughness={0.8}
        />
      </mesh>
      
      {/* Location-specific decorations */}
      {locationType === LocationType.Ship && (
        <group position={[0, 0, 0]}>
          {/* Ship interior walls */}
          <mesh position={[0, 2, -10]} castShadow receiveShadow>
            <boxGeometry args={[20, 4, 0.5]} />
            <meshStandardMaterial color="#334455" />
          </mesh>
          <mesh position={[0, 2, 10]} castShadow receiveShadow>
            <boxGeometry args={[20, 4, 0.5]} />
            <meshStandardMaterial color="#334455" />
          </mesh>
          <mesh position={[-10, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 4, 20]} />
            <meshStandardMaterial color="#334455" />
          </mesh>
          <mesh position={[10, 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.5, 4, 20]} />
            <meshStandardMaterial color="#334455" />
          </mesh>
          
          {/* Ship control panels */}
          <mesh position={[0, 1, -9]} castShadow receiveShadow>
            <boxGeometry args={[5, 1, 1]} />
            <meshStandardMaterial color="#223344" />
          </mesh>
          <mesh position={[0, 1.5, -9]} castShadow receiveShadow>
            <boxGeometry args={[4, 0.1, 0.8]} />
            <meshStandardMaterial color="#224488" emissive="#003366" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}
      
      {locationType === LocationType.Planet && (
        <group position={[0, 0, 0]}>
          {/* Trees/vegetation */}
          {[...Array(10)].map((_, index) => {
            const x = Math.sin(index * 0.5) * 15;
            const z = Math.cos(index * 0.5) * 15;
            return (
              <group key={index} position={[x, 0, z]}>
                <mesh position={[0, 2, 0]} castShadow>
                  <sphereGeometry args={[1.5, 8, 8]} />
                  <meshStandardMaterial color="#005522" />
                </mesh>
                <mesh position={[0, 0.5, 0]} castShadow>
                  <cylinderGeometry args={[0.2, 0.4, 4]} />
                  <meshStandardMaterial color="#553311" />
                </mesh>
              </group>
            );
          })}
          
          {/* Rocks */}
          {[...Array(5)].map((_, index) => {
            const x = Math.cos(index * 1.5) * 8;
            const z = Math.sin(index * 1.5) * 10;
            const scale = 0.5 + Math.random() * 0.5;
            return (
              <mesh key={`rock-${index}`} position={[x, scale/2, z]} scale={scale} castShadow>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#777777" roughness={0.9} />
              </mesh>
            );
          })}
        </group>
      )}
      
      {locationType === LocationType.Station && (
        <group position={[0, 0, 0]}>
          {/* Station structures */}
          <mesh position={[0, 4, 0]} castShadow>
            <cylinderGeometry args={[5, 5, 8, 16]} />
            <meshStandardMaterial color="#334455" metalness={0.5} roughness={0.2} />
          </mesh>
          <mesh position={[0, 8, 0]} castShadow>
            <cylinderGeometry args={[2, 5, 1, 16]} />
            <meshStandardMaterial color="#223344" metalness={0.7} roughness={0.2} />
          </mesh>
          
          {/* Antenna */}
          <mesh position={[0, 10, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
            <meshStandardMaterial color="#aaaaaa" metalness={0.8} />
          </mesh>
        </group>
      )}
      
      {locationType === LocationType.Derelict && (
        <group position={[0, 0, 0]}>
          {/* Broken ship parts */}
          <mesh position={[-5, 1, 3]} rotation={[0.2, 0.5, 0.1]} castShadow>
            <boxGeometry args={[6, 2, 3]} />
            <meshStandardMaterial color="#332222" roughness={0.9} />
          </mesh>
          <mesh position={[4, 0.5, -2]} rotation={[-0.1, -0.3, 0.2]} castShadow>
            <cylinderGeometry args={[1, 1, 5, 8]} />
            <meshStandardMaterial color="#222222" roughness={0.8} />
          </mesh>
          
          {/* Debris */}
          {[...Array(12)].map((_, index) => {
            const x = Math.sin(index * 1.2) * 8;
            const z = Math.cos(index * 1.2) * 8;
            const y = 0.2;
            const scale = 0.3 + Math.random() * 0.3;
            return (
              <mesh key={`debris-${index}`} position={[x, y, z]} scale={scale} castShadow>
                <tetrahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#443333" roughness={0.9} />
              </mesh>
            );
          })}
        </group>
      )}
      
      {locationType === LocationType.Space && (
        <group position={[0, 0, 0]}>
          {/* Asteroids */}
          {[...Array(8)].map((_, index) => {
            const angle = (index / 8) * Math.PI * 2;
            const radius = 12 + Math.sin(index * 5) * 3;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = Math.cos(index * 2) * 2;
            const scale = 0.8 + Math.random() * 1.5;
            
            return (
              <mesh key={`asteroid-${index}`} position={[x, y, z]} scale={scale} castShadow>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#444444" roughness={0.9} />
              </mesh>
            );
          })}
        </group>
      )}
      
      {/* Interactive elements */}
      {/* Puzzle marker */}
      <mesh 
        ref={puzzleRef} 
        position={[positions.puzzle[0], 1, positions.puzzle[2]]} 
        castShadow
      >
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#4488ff" emissive="#0044ff" emissiveIntensity={0.5} />
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#88aaff" emissive="#4466ff" emissiveIntensity={0.8} />
        </mesh>
      </mesh>
      
      {/* Enemy marker */}
      <mesh 
        ref={enemyRef} 
        position={[positions.enemy[0], 1, positions.enemy[2]]} 
        castShadow
      >
        <boxGeometry args={[1.2, 2, 1.2]} />
        <meshStandardMaterial color="#ff4444" emissive="#880000" emissiveIntensity={0.3} />
      </mesh>
    </>
  );
};

export default Scene;
