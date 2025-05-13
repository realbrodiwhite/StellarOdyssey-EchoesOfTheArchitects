import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { 
  useKeyboardControls, 
  PerspectiveCamera, 
  Text, 
  Html,
  useGLTF
} from "@react-three/drei";
import * as THREE from "three";
import { Controls, LocationType } from "@/lib/types";
import { useStory } from "@/lib/stores/useStory";
import { Vector3 } from "three";
import { useAudio } from "@/lib/stores/useAudio";

// Define interactable objects
type Interactable = {
  id: string;
  type: "location" | "asteroid" | "debris" | "anomaly";
  position: [number, number, number];
  name: string;
  description?: string;
  color?: string;
  scale?: [number, number, number];
};

// Define a particle system for space dust and debris
const SpaceDust = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 2000;
  
  // Create particle positions
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  
  // Generate random positions in a spherical shape
  for (let i = 0; i < particleCount; i++) {
    // Spherical distribution
    const radius = 50 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
    
    // Slightly blue tinted colors
    colors[i * 3] = 0.7 + Math.random() * 0.3;
    colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
    colors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
    
    // Varied sizes
    sizes[i] = Math.random() * 0.5;
  }
  
  useFrame((state, delta) => {
    if (particlesRef.current) {
      // Slowly rotate the particles for ambient movement
      particlesRef.current.rotation.y += delta * 0.02;
      particlesRef.current.rotation.x += delta * 0.005;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// Planet component
const Planet = ({ position, size, color, name, textColor = "#ffffff" }: {
  position: [number, number, number];
  size: number;
  color: string;
  name: string;
  textColor?: string;
}) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <Text
        position={[0, size + 1, 0]}
        fontSize={1.5}
        color={textColor}
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

// Space station component
const SpaceStation = ({ position, name }: {
  position: [number, number, number];
  name: string;
}) => {
  // Could use a real model in production
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[3, 1, 3]} />
        <meshStandardMaterial color="#888888" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.4} metalness={0.6} />
      </mesh>
      <mesh position={[0, 2, 0]} castShadow>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color="#999999" roughness={0.6} metalness={0.4} />
      </mesh>
      <Text
        position={[0, 4, 0]}
        fontSize={1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
    </group>
  );
};

// Player spaceship
const Spaceship = () => {
  const shipRef = useRef<THREE.Group>(null);
  const [shipRotation, setShipRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [rotationTarget, setRotationTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [, getKeys] = useKeyboardControls<Controls>();
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const maxSpeed = 1.0;
  const acceleration = 0.05;
  const deceleration = 0.02;
  const rotationSpeed = 0.1;
  const { playHit } = useAudio();
  
  useFrame((state, delta) => {
    if (!shipRef.current) return;
    
    const keys = getKeys();
    const ship = shipRef.current;
    let newVelocity = velocity.clone();
    
    // Get ship's forward direction based on rotation
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(ship.quaternion);
    
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(ship.quaternion);
    
    const up = new THREE.Vector3(0, 1, 0);
    up.applyQuaternion(ship.quaternion);
    
    // Handle acceleration
    if (keys.forward) {
      newVelocity.add(forward.multiplyScalar(acceleration));
    }
    
    if (keys.backward) {
      newVelocity.add(forward.multiplyScalar(-acceleration));
    }
    
    if (keys.left) {
      newVelocity.add(right.multiplyScalar(-acceleration));
      setRotationTarget([rotationTarget[0], rotationTarget[1], Math.PI * 0.1]);
    } else if (keys.right) {
      newVelocity.add(right.multiplyScalar(acceleration));
      setRotationTarget([rotationTarget[0], rotationTarget[1], -Math.PI * 0.1]);
    } else {
      setRotationTarget([rotationTarget[0], rotationTarget[1], 0]);
    }
    
    // Apply banking effect
    const targetZ = keys.left 
      ? Math.PI * 0.1 
      : keys.right 
        ? -Math.PI * 0.1 
        : 0;
    
    // Smoothly interpolate rotation
    setShipRotation([
      shipRotation[0] + (rotationTarget[0] - shipRotation[0]) * 0.1,
      shipRotation[1] + (rotationTarget[1] - shipRotation[1]) * 0.1,
      shipRotation[2] + (targetZ - shipRotation[2]) * 0.1
    ]);
    
    // Apply rotation to ship
    ship.rotation.set(shipRotation[0], shipRotation[1], shipRotation[2]);
    
    // Apply damping/drag to slow down when no input
    if (!keys.forward && !keys.backward && !keys.left && !keys.right) {
      newVelocity.multiplyScalar(1 - deceleration);
    }
    
    // Limit maximum speed
    if (newVelocity.length() > maxSpeed) {
      newVelocity.normalize().multiplyScalar(maxSpeed);
    }
    
    // Apply velocity to position
    ship.position.add(newVelocity);
    
    // Update velocity state
    setVelocity(newVelocity);
    
    // Update camera to follow ship
    state.camera.position.copy(ship.position);
    state.camera.position.y += 2; // Slight height offset
    state.camera.position.z += 8; // Distance behind
    
    // Look slightly ahead of the ship
    const lookTarget = ship.position.clone().add(forward.multiplyScalar(10));
    state.camera.lookAt(lookTarget);
  });
  
  return (
    <group ref={shipRef} position={[0, 0, 0]}>
      {/* Simple ship shape - in production, use a real 3D model */}
      <mesh castShadow>
        <coneGeometry args={[1, 3, 3]} />
        <meshStandardMaterial color="#3366ff" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 1]} castShadow>
        <boxGeometry args={[3, 0.5, 1]} />
        <meshStandardMaterial color="#2255cc" roughness={0.4} metalness={0.6} />
      </mesh>
      
      {/* Engine glow */}
      <pointLight position={[0, 0, 2]} distance={5} intensity={1} color="#66aaff" />
    </group>
  );
};

// Interactable object
const InteractableObject = ({ 
  interactable, 
  isHighlighted, 
  onInteract 
}: {
  interactable: Interactable;
  isHighlighted: boolean;
  onInteract: () => void;
}) => {
  const scale = interactable.scale || [1, 1, 1];
  const color = interactable.color || "#ffffff";
  
  return (
    <group position={interactable.position}>
      <mesh
        onClick={onInteract}
        onPointerOver={() => {/* Handle hover */}}
        onPointerOut={() => {/* Handle hover end */}}
        scale={scale}
      >
        {interactable.type === "location" ? (
          <sphereGeometry args={[1, 16, 16]} />
        ) : interactable.type === "asteroid" ? (
          <icosahedronGeometry args={[1, 0]} />
        ) : interactable.type === "debris" ? (
          <boxGeometry args={[1, 1, 1]} />
        ) : (
          <torusGeometry args={[1, 0.3, 16, 32]} />
        )}
        <meshStandardMaterial 
          color={isHighlighted ? "#ffaa22" : color} 
          emissive={isHighlighted ? "#663300" : undefined}
          emissiveIntensity={isHighlighted ? 0.5 : 0}
        />
      </mesh>
      {isHighlighted && (
        <Html position={[0, scale[1] + 1, 0]} center>
          <div className="bg-black bg-opacity-70 text-white p-2 rounded-md text-sm whitespace-nowrap">
            <div className="font-semibold">{interactable.name}</div>
            {interactable.description && (
              <div className="text-xs text-gray-300">{interactable.description}</div>
            )}
            <div className="text-xs text-yellow-300 mt-1">Press 'E' to interact</div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Generate interactables based on location type
const generateInteractables = (locationType: LocationType): Interactable[] => {
  switch (locationType) {
    case LocationType.Space:
      return [
        {
          id: "asteroid_field",
          type: "asteroid",
          position: [15, 0, -20],
          name: "Asteroid Field",
          description: "Dense cluster of minable resources",
          scale: [5, 5, 5],
          color: "#aa8866"
        },
        {
          id: "space_anomaly",
          type: "anomaly",
          position: [-25, 5, -15],
          name: "Void Resonance",
          description: "Unknown energy signature",
          scale: [3, 3, 3],
          color: "#aa22ff"
        },
        {
          id: "derelict_ship",
          type: "debris",
          position: [0, -8, -30],
          name: "Abandoned Vessel",
          description: "Salvageable technology",
          scale: [4, 1, 8],
          color: "#555555"
        }
      ];
    case LocationType.Planet:
      return [
        {
          id: "landing_zone",
          type: "location",
          position: [0, 10, -25],
          name: "Landing Zone Alpha",
          description: "Safe area to land your ship",
          scale: [2, 0.5, 2],
          color: "#22aa22"
        },
        {
          id: "settlement",
          type: "location",
          position: [20, 5, -20],
          name: "Colony Outpost",
          description: "Small settlement with traders",
          scale: [4, 2, 4],
          color: "#aaaaaa"
        },
        {
          id: "ancient_ruins",
          type: "location",
          position: [-15, 3, -30],
          name: "Ancient Structure",
          description: "Mysterious alien building",
          scale: [6, 6, 6],
          color: "#665533"
        }
      ];
    case LocationType.Station:
      return [
        {
          id: "docking_bay",
          type: "location",
          position: [0, 0, -25],
          name: "Main Docking Bay",
          description: "Spacecraft landing facilities",
          scale: [5, 1, 5],
          color: "#335599"
        },
        {
          id: "trading_hub",
          type: "location",
          position: [10, 5, -20],
          name: "Commerce Section",
          description: "Shops and services",
          scale: [3, 3, 3],
          color: "#aa9955"
        },
        {
          id: "command_center",
          type: "location",
          position: [-10, 10, -15],
          name: "Operations Center",
          description: "Station administration",
          scale: [4, 4, 4],
          color: "#557799"
        }
      ];
    case LocationType.Derelict:
      return [
        {
          id: "breach_point",
          type: "location",
          position: [0, 0, -20],
          name: "Hull Breach",
          description: "Entry point to the derelict",
          scale: [3, 1, 3],
          color: "#774433"
        },
        {
          id: "power_core",
          type: "location",
          position: [-15, 5, -25],
          name: "Reactor Chamber",
          description: "Damaged power systems",
          scale: [4, 4, 4],
          color: "#33aacc"
        },
        {
          id: "cargo_hold",
          type: "location",
          position: [20, -5, -30],
          name: "Cargo Storage",
          description: "Potential salvage",
          scale: [6, 3, 6],
          color: "#887766"
        }
      ];
    default:
      return [];
  }
};

interface SpaceExplorationProps {
  onNavigate: () => void;
  onLand: (locationId: string) => void;
}

const SpaceExploration = ({ onNavigate, onLand }: SpaceExplorationProps) => {
  const { getCurrentLocation } = useStory();
  const currentLocation = getCurrentLocation();
  const [interactables, setInteractables] = useState<Interactable[]>([]);
  const [highlightedInteractable, setHighlightedInteractable] = useState<string | null>(null);
  const [, getKeys] = useKeyboardControls<Controls>();
  
  // Generate interactables based on location
  useEffect(() => {
    if (currentLocation) {
      setInteractables(generateInteractables(currentLocation.type));
    }
  }, [currentLocation]);
  
  // Check for nearby interactables
  useFrame((state) => {
    // Ship position is essentially the camera position in our setup
    const shipPosition = state.camera.position.clone();
    
    // Find the closest interactable within range
    let closestInteractable: string | null = null;
    let closestDistance = 10; // Maximum interaction distance
    
    interactables.forEach(interactable => {
      const interactablePosition = new Vector3(
        interactable.position[0],
        interactable.position[1],
        interactable.position[2]
      );
      
      const distance = shipPosition.distanceTo(interactablePosition);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestInteractable = interactable.id;
      }
    });
    
    setHighlightedInteractable(closestInteractable);
    
    // Handle interaction key press
    const keys = getKeys();
    if (keys.interact && highlightedInteractable) {
      const interactable = interactables.find(i => i.id === highlightedInteractable);
      if (interactable) {
        // Handle interaction logic
        console.log(`Interacting with ${interactable.name}`);
        onLand(interactable.id);
      }
    }
    
    // Handle navigation console key press
    if (keys.menu) {
      onNavigate();
    }
  });
  
  // Create scene content based on location type
  const renderLocationContent = () => {
    if (!currentLocation) return null;
    
    switch (currentLocation.type) {
      case LocationType.Space:
        return (
          <>
            <Planet 
              position={[-50, -20, -100]} 
              size={25} 
              color="#4466aa" 
              name="Proxima IV" 
            />
            <SpaceStation 
              position={[30, 10, -60]} 
              name="Frontier Outpost" 
            />
            <SpaceDust />
          </>
        );
      
      case LocationType.Planet:
        return (
          <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -50, 0]} receiveShadow>
              <planeGeometry args={[1000, 1000]} />
              <meshStandardMaterial 
                color={currentLocation.id.includes("alien") ? "#446644" : "#886644"}
                roughness={1}
              />
            </mesh>
            <fog attach="fog" args={["#aabbcc", 50, 200]} />
            <Planet 
              position={[-100, 80, -150]} 
              size={15} 
              color="#aaaaff" 
              name="Moon" 
            />
          </>
        );
      
      case LocationType.Station:
        return (
          <>
            <SpaceStation 
              position={[0, 0, -50]} 
              name={currentLocation.name} 
            />
            <SpaceDust />
          </>
        );
      
      case LocationType.Derelict:
        return (
          <>
            <group position={[0, 0, -50]}>
              <mesh rotation={[0, Math.PI / 4, 0]}>
                <boxGeometry args={[30, 8, 15]} />
                <meshStandardMaterial color="#444444" roughness={0.8} metalness={0.3} />
              </mesh>
              <pointLight position={[5, 0, 5]} distance={20} intensity={0.5} color="#ff3333" />
            </group>
            <SpaceDust />
          </>
        );
      
      default:
        return <SpaceDust />;
    }
  };
  
  return (
    <>
      {/* Player ship */}
      <Spaceship />
      
      {/* Location-specific content */}
      {renderLocationContent()}
      
      {/* Interactable objects */}
      {interactables.map(interactable => (
        <InteractableObject
          key={interactable.id}
          interactable={interactable}
          isHighlighted={highlightedInteractable === interactable.id}
          onInteract={() => onLand(interactable.id)}
        />
      ))}
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Interface elements */}
      <Html fullscreen>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white p-2 rounded-md text-sm">
          <div className="flex gap-4">
            <div>WASD/Arrows: Fly</div>
            <div>E: Interact</div>
            <div>ESC: Navigation</div>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white p-2 rounded-md">
          <div className="font-semibold">{currentLocation?.name || "Unknown Location"}</div>
          <div className="text-xs text-blue-300">{currentLocation?.type}</div>
        </div>
      </Html>
    </>
  );
};

export default SpaceExploration;