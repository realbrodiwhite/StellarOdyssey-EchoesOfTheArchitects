import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { Controls } from "@/lib/types";
import { useCharacter } from "@/lib/stores/useCharacter";

// Player movement speed
const MOVEMENT_SPEED = 5;
const ROTATION_SPEED = 5;

const Player = () => {
  const { camera } = useThree();
  const { selectedCharacter } = useCharacter();
  const playerRef = useRef<THREE.Group>(null);
  const targetRotationRef = useRef(0);
  
  // Get keyboard control state
  const [subscribeKeys, getKeys] = useKeyboardControls<Controls>();
  
  // Initialize player position and rotation
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.position.set(0, 0, 0);
      camera.position.set(0, 3, 5);
      camera.lookAt(new THREE.Vector3(0, 1, 0));
    }
  }, [camera]);
  
  // Player movement and controls
  useFrame((state, delta) => {
    if (!playerRef.current) return;
    
    const keys = getKeys();
    let moveX = 0;
    let moveZ = 0;
    
    // Calculate movement direction
    if (keys.forward) moveZ -= 1;
    if (keys.backward) moveZ += 1;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveZ !== 0) {
      moveX /= Math.sqrt(2);
      moveZ /= Math.sqrt(2);
    }
    
    // Update player rotation based on movement direction
    if (moveX !== 0 || moveZ !== 0) {
      targetRotationRef.current = Math.atan2(moveX, moveZ);
    }
    
    // Smoothly rotate player model
    const currentRotation = playerRef.current.rotation.y;
    let rotationDiff = targetRotationRef.current - currentRotation;
    
    // Handle shortest rotation path
    if (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
    if (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
    
    playerRef.current.rotation.y += rotationDiff * Math.min(delta * ROTATION_SPEED, 1);
    
    // Apply movement
    if (moveX !== 0 || moveZ !== 0) {
      // Calculate movement vector in world space
      const movementVector = new THREE.Vector3(moveX, 0, moveZ).normalize().multiplyScalar(delta * MOVEMENT_SPEED);
      
      // Update player position
      playerRef.current.position.x += movementVector.x;
      playerRef.current.position.z += movementVector.z;
      
      // Update camera position to follow player
      camera.position.x = playerRef.current.position.x;
      camera.position.z = playerRef.current.position.z + 5;
      
      // Keep camera looking at player
      camera.lookAt(
        playerRef.current.position.x,
        playerRef.current.position.y + 1,
        playerRef.current.position.z
      );
    }
    
    // Restrict player movement area
    const maxBounds = 20;
    playerRef.current.position.x = THREE.MathUtils.clamp(
      playerRef.current.position.x, 
      -maxBounds, 
      maxBounds
    );
    playerRef.current.position.z = THREE.MathUtils.clamp(
      playerRef.current.position.z, 
      -maxBounds, 
      maxBounds
    );
  });
  
  // Character color based on class
  const getCharacterColor = () => {
    if (!selectedCharacter) return "#4488ff";
    
    switch (selectedCharacter.class) {
      case "Engineer":
        return "#ff8800";
      case "Scientist":
        return "#44bbff";
      case "Diplomat":
        return "#ffdd44";
      case "Pilot":
        return "#ff4466";
      default:
        return "#4488ff";
    }
  };
  
  return (
    <group ref={playerRef}>
      {/* Player character model */}
      <group>
        {/* Body */}
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[0.8, 1.4, 0.5]} />
          <meshStandardMaterial color={getCharacterColor()} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 2, 0]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
        
        {/* Helmet visor */}
        <mesh position={[0, 2, 0.2]} castShadow>
          <sphereGeometry args={[0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#88ccff" transparent opacity={0.8} metalness={0.5} />
        </mesh>
        
        {/* Arms */}
        <mesh position={[-0.6, 1, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
          <meshStandardMaterial color={getCharacterColor()} />
        </mesh>
        <mesh position={[0.6, 1, 0]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 1, 8]} />
          <meshStandardMaterial color={getCharacterColor()} />
        </mesh>
        
        {/* Legs */}
        <mesh position={[-0.3, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        <mesh position={[0.3, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.8, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
      
      {/* Character light */}
      <pointLight 
        position={[0, 1.5, 0]} 
        intensity={0.4} 
        color={getCharacterColor()} 
        distance={2}
      />
    </group>
  );
};

export default Player;
