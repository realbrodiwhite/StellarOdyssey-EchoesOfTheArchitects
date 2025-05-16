import { useRef, useState, useEffect, useMemo } from "react";
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
import useLocation from "@/lib/stores/useLocation";
import { Vector3 } from "three";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useIsMobile } from "@/hooks/use-is-mobile";

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
    
    // Smoothly interpolate rotation with improved easing
    const rotationLerpFactor = delta * 3; // Make rotation speed consistent regardless of frame rate
    setShipRotation([
      THREE.MathUtils.lerp(shipRotation[0], rotationTarget[0], rotationLerpFactor),
      THREE.MathUtils.lerp(shipRotation[1], rotationTarget[1], rotationLerpFactor),
      THREE.MathUtils.lerp(shipRotation[2], targetZ, rotationLerpFactor)
    ]);
    
    // Apply rotation to ship with subtle easing
    ship.rotation.set(shipRotation[0], shipRotation[1], shipRotation[2]);
    
    // Apply improved damping/drag to slow down when no input
    // Use frame-rate independent damping for consistent feel
    const dampingFactor = Math.pow(1 - deceleration, delta * 60);
    if (!keys.forward && !keys.backward && !keys.left && !keys.right) {
      newVelocity.multiplyScalar(dampingFactor);
    }
    
    // Limit maximum speed with smooth clamping
    const currentSpeed = newVelocity.length();
    if (currentSpeed > maxSpeed) {
      // Gradually reduce speed instead of hard clamping
      const reduction = 0.95 + (0.05 * (maxSpeed / currentSpeed));
      newVelocity.multiplyScalar(reduction);
    }
    
    // Apply velocity to position with smoother movement
    const smoothedVelocity = newVelocity.clone().multiplyScalar(delta * 60);
    ship.position.add(smoothedVelocity);
    
    // Update velocity state
    setVelocity(newVelocity);
    
    // Update camera to follow ship with smooth interpolation
    // Create target camera position - much further back for a more dramatic perspective
    const cameraTargetPos = ship.position.clone();
    cameraTargetPos.y += 3; // Increased height offset for better viewing angle
    cameraTargetPos.z += 15; // Much greater distance behind
    
    // Smoothly move camera toward target position
    // Use a slower lerp factor for more cinematic camera movement
    const cameraLerpFactor = delta * 1.5; // Reduced for smoother, more gradual camera movement
    state.camera.position.lerp(cameraTargetPos, cameraLerpFactor);
    
    // Look slightly ahead of the ship with interpolated forward direction
    const lookTarget = ship.position.clone().add(forward.multiplyScalar(10));
    state.camera.lookAt(lookTarget);
  });
  
  // Create a ref for thruster animation
  const thrusterRef = useRef<THREE.Group>(null);
  
  // Track the exhaust particles
  const [exhaustParticles, setExhaustParticles] = useState<THREE.Vector3[]>([]);
  const maxParticles = 100;
  
  // Track atmospheric entry effect
  const [showHeatEffect, setShowHeatEffect] = useState(false);
  const [heatIntensity, setHeatIntensity] = useState(0);
  
  // Create a time reference for animations
  const timeRef = useRef({ elapsedTime: 0 });
  
  // Animate the thruster and particles
  useFrame((state, delta) => {
    // Update our animation timer
    timeRef.current.elapsedTime += delta;
    const animTime = timeRef.current.elapsedTime;
    
    if (thrusterRef.current) {
      // Get current keyboard state
      const keys = getKeys();
      const isThrusting = keys.forward;
      const isBraking = keys.backward;
      
      // Calculate current speed
      const currentSpeed = velocity.length();
      
      // Determine if we're in heat effect territory (very fast speed)
      const heatThreshold = maxSpeed * 0.7;
      if (currentSpeed > heatThreshold) {
        // Calculate heat intensity based on speed
        const newHeatIntensity = Math.min(1, (currentSpeed - heatThreshold) / (maxSpeed - heatThreshold));
        setHeatIntensity(newHeatIntensity);
        setShowHeatEffect(true);
      } else {
        // Gradually reduce heat effect when slowing down
        if (heatIntensity > 0) {
          setHeatIntensity(Math.max(0, heatIntensity - delta * 0.5));
        } else {
          setShowHeatEffect(false);
        }
      }
      
      // Engine animation using our own timer
      if (isThrusting) {
        // Larger flame effect when thrusting - expanded outward
        thrusterRef.current.scale.x = 1.0 + Math.sin(animTime * 15) * 0.1;
        thrusterRef.current.scale.y = 1.0 + Math.sin(animTime * 15) * 0.1;
        // Length grows outward from the back of the ship
        thrusterRef.current.scale.z = 1.5 + Math.sin(animTime * 12) * 0.2;
        
        // Add new exhaust particles when thrusting - more particles at higher speeds
        const particleChance = 0.7 - (currentSpeed / maxSpeed) * 0.4; // More particles at higher speeds
        if (Math.random() > particleChance) {
          const newParticle = new THREE.Vector3(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            3.5 + Math.random() * 1.5 // Particles appear further back
          );
          setExhaustParticles(prev => {
            // Add new particle and remove oldest if at max capacity
            const updated = [...prev, newParticle];
            return updated.length > maxParticles ? updated.slice(1) : updated;
          });
        }
      } else if (isBraking) {
        // Special braking effect - quick pulses with different pattern
        const pulseTime = animTime * 20;
        const pulseValue = (Math.sin(pulseTime) + Math.sin(pulseTime * 1.5)) * 0.25;
        
        thrusterRef.current.scale.x = 0.8 + pulseValue;
        thrusterRef.current.scale.y = 0.8 + pulseValue;
        thrusterRef.current.scale.z = 0.9 + pulseValue;
      } else {
        // Smaller idle effect when not thrusting - gentle pulsing
        const idlePulse = Math.sin(animTime * 5) * 0.05;
        thrusterRef.current.scale.x = 0.7 + idlePulse;
        thrusterRef.current.scale.y = 0.7 + idlePulse;
        thrusterRef.current.scale.z = 0.8 + idlePulse;
      }
      
      // Update existing particles (move them behind the ship)
      setExhaustParticles(prev => 
        prev.map(particle => {
          // Particles move faster based on current speed
          const particleSpeed = isThrusting ? 10 + (currentSpeed / maxSpeed) * 5 : 5;
          particle.z += delta * particleSpeed;
          
          // Slightly spread particles outward as they move away
          particle.x += (Math.random() - 0.5) * 0.1;
          particle.y += (Math.random() - 0.5) * 0.1;
          return particle;
        }).filter(particle => particle.z < 15)  // Remove particles too far away
      );
    }
  });

  return (
    <group ref={shipRef} position={[0, 0, 0]}>
      {/* Simple ship shape - in production, use a real 3D model */}
      <mesh castShadow>
        <coneGeometry args={[1, 3, 3]} />
        <meshStandardMaterial 
          color={showHeatEffect ? new THREE.Color().setHSL(0.05, 1, 0.5 + (0.5 * heatIntensity)) : "#3366ff"} 
          roughness={0.3} 
          metalness={0.7} 
          emissive={showHeatEffect ? new THREE.Color(1, 0.3, 0.1) : new THREE.Color(0, 0, 0)}
          emissiveIntensity={heatIntensity * 2}
        />
      </mesh>
      <mesh position={[0, 0, 1]} castShadow>
        <boxGeometry args={[3, 0.5, 1]} />
        <meshStandardMaterial 
          color={showHeatEffect ? new THREE.Color().setHSL(0.05, 1, 0.5 + (0.5 * heatIntensity)) : "#2255cc"} 
          roughness={0.4} 
          metalness={0.6} 
          emissive={showHeatEffect ? new THREE.Color(1, 0.3, 0.1) : new THREE.Color(0, 0, 0)}
          emissiveIntensity={heatIntensity * 2}
        />
      </mesh>
      
      {/* Atmospheric re-entry heat shield effect - now with softer gradients on both sides */}
      {showHeatEffect && (
        <>
          {/* Primary heat glow around ship - more intense and colored based on speed */}
          <pointLight 
            position={[0, 0, -1.5]} 
            distance={8} 
            intensity={2 * heatIntensity} 
            color={heatIntensity > 0.7 ? "#4488ff" : "#ff5500"} 
          />
          
          {/* Secondary heat glow for a more diffuse effect */}
          <pointLight 
            position={[0, 0, -2.5]} 
            distance={12} 
            intensity={1.5 * heatIntensity} 
            color={heatIntensity > 0.7 ? "#2266ff" : "#ff7700"} 
          />
          
          {/* Radial gradient for soft fading effect on both sides */}
          <sprite position={[0, 0, -2]} scale={[8, 8, 8]}>
            <spriteMaterial
              map={null}
              color={heatIntensity > 0.7 ? "#4488ff" : "#ff6600"}
              transparent
              opacity={0.3 * heatIntensity}
              depthTest={false}
              blending={THREE.AdditiveBlending} // Additive blending for softer edges
            />
          </sprite>
          
          {/* Secondary outer glow for even softer gradient */}
          <sprite position={[0, 0, -2.2]} scale={[12, 12, 12]}>
            <spriteMaterial
              map={null}
              color={heatIntensity > 0.7 ? "#1144ff" : "#ff4400"}
              transparent
              opacity={0.15 * heatIntensity}
              depthTest={false}
              blending={THREE.AdditiveBlending}
            />
          </sprite>
          
          {/* Front heat shield plasma - dynamic rotation and color transition */}
          <mesh 
            position={[0, 0, -1.7]} 
            rotation={[0, 0, Date.now() * (0.001 + heatIntensity * 0.002)]}
          >
            <torusGeometry args={[1.2, 0.6 * heatIntensity, 32, 40]} /> {/* Higher poly count for smoother look */}
            <meshBasicMaterial 
              color={heatIntensity > 0.7 ? "#44aaff" : "#ff7700"} 
              transparent 
              opacity={0.7 * heatIntensity} 
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          
          {/* Heat particles at the front of the ship - more dynamic and varied */}
          <points position={[0, 0, -2]}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={80} // More particles for better effect
                array={new Float32Array(Array.from({ length: 80 * 3 }, (_, i) => {
                  const angle = (i % 80) / 80 * Math.PI * 2;
                  // Create a more natural, irregular pattern with multiple sine waves
                  const radius = 1.5 * (0.7 + 
                    Math.sin(Date.now() * 0.003 + i) * 0.3 + 
                    Math.sin(Date.now() * 0.005 + i * 0.7) * 0.2
                  );
                  return (i % 3 === 0) 
                    ? Math.cos(angle) * radius 
                    : (i % 3 === 1) 
                    ? Math.sin(angle) * radius 
                    : (Math.random() - 0.5) * (0.5 + heatIntensity * 0.5); // Varied z-position
                }))}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.2 * heatIntensity + 0.1} // Slightly larger base size
              color={heatIntensity > 0.7 ? "#88ccff" : "#ff3300"} // Color transition
              transparent
              opacity={0.8 * heatIntensity}
              sizeAttenuation
              blending={THREE.AdditiveBlending} // Additive blending for better visual effect
            />
          </points>
        </>
      )}
      
      {/* Enhanced engine effects with improved transitions */}
      {/* Dynamic thruster glow with color and intensity based on speed */}
      <pointLight 
        position={[0, 0, 2.5]} 
        distance={10} 
        intensity={2 + heatIntensity * 2} 
        color={heatIntensity > 0.5 ? "#66aaff" : "#ffaa66"} 
      />
      
      {/* Thruster flame effect - with improved gradients and transitions */}
      {/* Corrected thruster flames - pointing in the right direction */}
      <group ref={thrusterRef} position={[0, 0, 2.5]} rotation={[Math.PI, 0, 0]}>
        {/* Inner bright core - transitions from yellow/orange to white based on speed */}
        <mesh position={[0, 0, 0.2]}>
          <coneGeometry args={[0.5, 1.5 + heatIntensity * 2, 16]} />
          <meshBasicMaterial 
            color={heatIntensity > 0.7 ? "#ffffff" : heatIntensity > 0.3 ? "#ffffdd" : "#ffdd66"} 
            transparent 
            opacity={0.95} 
          />
        </mesh>
        
        {/* Middle layer - transitions from orange to bright blue */}
        <mesh position={[0, 0, 0.3]}>
          <coneGeometry args={[0.7, 2.2 + heatIntensity * 3, 16]} />
          <meshBasicMaterial 
            color={heatIntensity > 0.5 ? "#99eeff" : "#ffaa44"} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
        
        {/* Outer flame - transitions from yellow to deeper blue */}
        <mesh position={[0, 0, 0.4]}>
          <coneGeometry args={[0.9, 3 + heatIntensity * 4, 16]} />
          <meshBasicMaterial 
            color={heatIntensity > 0.3 ? "#3366ff" : "#ffcc22"} 
            transparent 
            opacity={0.6 + heatIntensity * 0.2} 
          />
        </mesh>
        
        {/* Extra outer glow for visual effect - soft gradient effect */}
        <mesh position={[0, 0, 0.5]}>
          <coneGeometry args={[1.1, 3.5 + heatIntensity * 5, 16]} />
          <meshBasicMaterial 
            color={heatIntensity > 0.2 ? "#1133aa" : "#ff8800"} 
            transparent 
            opacity={0.3} 
          />
        </mesh>
      </group>
      
      {/* Dynamic exhaust particles */}
      {exhaustParticles.map((particle, index) => (
        <mesh key={index} position={particle} scale={[0.1 + Math.random() * 0.2, 0.1 + Math.random() * 0.2, 0.1 + Math.random() * 0.2]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial 
            color={index % 3 === 0 ? '#ffffff' : index % 2 === 0 ? '#66ccff' : '#3366ff'} 
            transparent 
            opacity={0.7 - (particle.z / 15) * 0.7} // Fade out with distance
          />
        </mesh>
      ))}
      
      {/* Particle light effects (random flickering for engine glow) */}
      {exhaustParticles.length > 0 && (
        <pointLight 
          position={[0, 0, 3 + Math.sin(Date.now() * 0.01) * 0.5]} 
          distance={10} 
          intensity={1 + Math.sin(Date.now() * 0.02) * 0.5} 
          color="#66aaff" 
        />
      )}
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
  const { getCurrentLocation } = useLocation();
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
            <div className="hidden md:block">WASD/Arrows: Fly</div>
            <div className="hidden md:block">E: Interact</div>
            <div className="hidden md:block">ESC: Navigation</div>
            <div className="md:hidden">Use touch controls to fly</div>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 bg-black bg-opacity-60 text-white p-2 rounded-md">
          <div className="font-semibold">{currentLocation?.name || "Unknown Location"}</div>
          <div className="text-xs text-blue-300">{currentLocation?.type}</div>
        </div>
        
        {/* Mobile Touch Controls */}
        <TouchControls />
      </Html>
    </>
  );
};

// Mobile Control Components
const TouchControls = () => {
  const isMobile = useIsMobile();
  const game = useGame();
  const mobileControlType = game.mobileControlType || 'joystick';
  const controlsOpacity = game.controlsOpacity || 0.7;
  
  // Don't render on non-mobile devices
  if (!isMobile) return null;
  
  return (
    <>
      {/* Control switcher at the top of screen */}
      <div className="absolute top-20 right-4 bg-gray-800 bg-opacity-60 rounded-lg p-2 z-50">
        <div className="text-white text-xs mb-1">Control Type:</div>
        <div className="flex gap-2">
          <button 
            className={`px-3 py-1 text-sm rounded-md ${
              mobileControlType === 'joystick' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => game.setMobileControlType && game.setMobileControlType('joystick')}
          >
            Joystick
          </button>
          <button 
            className={`px-3 py-1 text-sm rounded-md ${
              mobileControlType === 'swipe' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300'
            }`}
            onClick={() => game.setMobileControlType && game.setMobileControlType('swipe')}
          >
            Swipe
          </button>
        </div>
        
        {/* Opacity slider */}
        <div className="mt-2">
          <div className="text-white text-xs mb-1">Opacity: {Math.round(controlsOpacity * 100)}%</div>
          <input 
            type="range" 
            min="20" 
            max="100" 
            value={controlsOpacity * 100} 
            onChange={(e) => {
              if (game.setControlsOpacity) {
                game.setControlsOpacity(Number(e.target.value) / 100)
              }
            }}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Render appropriate control type */}
      {mobileControlType === 'joystick' ? <JoystickControls /> : <SwipeControls />}
    </>
  );
};

// Joystick-style controls
const JoystickControls = () => {
  const game = useGame();
  const controlsOpacity = game.controlsOpacity || 0.7;
  const [, setKeys] = useKeyboardControls<Controls>();
  
  // Touch joystick state
  const [touchActive, setTouchActive] = useState(false);
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const joystickRef = useRef<HTMLDivElement>(null);
  const maxDistance = 50; // Maximum joystick distance
  
  // Interaction button states
  const [interactPressed, setInteractPressed] = useState(false);
  const [menuPressed, setMenuPressed] = useState(false);
  
  // Handle touch start for joystick
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    
    const touch = e.touches[0];
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setBasePosition({ x: centerX, y: centerY });
    setJoystickPosition({ x: 0, y: 0 });
    setTouchActive(true);
  };
  
  // Handle touch move for joystick
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchActive) return;
    
    const touch = e.touches[0];
    
    // Calculate joystick offset from center
    let deltaX = touch.clientX - basePosition.x;
    let deltaY = touch.clientY - basePosition.y;
    
    // Limit joystick movement to a circle
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > maxDistance) {
      const angle = Math.atan2(deltaY, deltaX);
      deltaX = Math.cos(angle) * maxDistance;
      deltaY = Math.sin(angle) * maxDistance;
    }
    
    setJoystickPosition({ x: deltaX, y: deltaY });
    
    // Convert joystick position to key presses
    // Forward/backward: Y axis
    // Left/right: X axis
    const deadzone = 10; // Small deadzone to prevent accidental movement
    
    const forward = deltaY < -deadzone;
    const backward = deltaY > deadzone;
    const left = deltaX < -deadzone;
    const right = deltaX > deadzone;
    
    // Update keyboard controls state
    setKeys({
      forward, 
      backward, 
      left, 
      right
    });
  };
  
  // Handle touch end for joystick
  const handleTouchEnd = () => {
    setTouchActive(false);
    setJoystickPosition({ x: 0, y: 0 });
    
    // Reset all movement keys
    setKeys({
      forward: false, 
      backward: false, 
      left: false, 
      right: false
    });
  };
  
  // Handle interact button
  const handleInteractStart = () => {
    setInteractPressed(true);
    setKeys({ interact: true });
  };
  
  const handleInteractEnd = () => {
    setInteractPressed(false);
    setKeys({ interact: false });
  };
  
  // Handle menu button
  const handleMenuStart = () => {
    setMenuPressed(true);
    setKeys({ menu: true });
  };
  
  const handleMenuEnd = () => {
    setMenuPressed(false);
    setKeys({ menu: false });
  };
  
  return (
    <>
      {/* Movement joystick */}
      <div className="absolute bottom-20 left-16 touch-none">
        <div 
          ref={joystickRef}
          className="w-32 h-32 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `rgba(31, 41, 55, ${controlsOpacity})`, borderColor: `rgba(59, 130, 246, ${controlsOpacity})` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div 
            className="w-16 h-16 rounded-full absolute"
            style={{ 
              backgroundColor: `rgba(59, 130, 246, ${controlsOpacity})`,
              transform: `translate(${joystickPosition.x}px, ${joystickPosition.y}px)`,
              transition: touchActive ? 'none' : 'transform 0.2s ease-out'
            }}
          />
        </div>
        <div className="text-white text-xs mt-1 text-center">Movement</div>
      </div>
      
      {/* Action buttons */}
      <div className="absolute bottom-20 right-8 flex flex-col gap-4">
        {/* Interact button */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          style={{ 
            backgroundColor: interactPressed 
              ? `rgba(217, 119, 6, ${controlsOpacity})` 
              : `rgba(245, 158, 11, ${controlsOpacity})`
          }}
          onTouchStart={handleInteractStart}
          onTouchEnd={handleInteractEnd}
          onTouchCancel={handleInteractEnd}
        >
          E
        </div>
        
        {/* Menu button */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          style={{ 
            backgroundColor: menuPressed 
              ? `rgba(109, 40, 217, ${controlsOpacity})` 
              : `rgba(124, 58, 237, ${controlsOpacity})`
          }}
          onTouchStart={handleMenuStart}
          onTouchEnd={handleMenuEnd}
          onTouchCancel={handleMenuEnd}
        >
          ESC
        </div>
      </div>
    </>
  );
};

// Swipe-style controls 
const SwipeControls = () => {
  const game = useGame();
  const controlsOpacity = game.controlsOpacity || 0.7;
  const [, setKeys] = useKeyboardControls<Controls>();
  
  // Screen regions and active states
  const [activeRegions, setActiveRegions] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false
  });
  
  // Touch start positions
  const [touchStartPos, setTouchStartPos] = useState<Record<string, { x: number, y: number }>>({});
  
  // Action button states
  const [interactPressed, setInteractPressed] = useState(false);
  const [menuPressed, setMenuPressed] = useState(false);
  
  // Handle touch start for swipe controls
  const handleScreenTouchStart = (e: React.TouchEvent, region: string) => {
    // Store the touch start position for this touch ID
    const touch = e.touches[0];
    setTouchStartPos({
      ...touchStartPos,
      [touch.identifier]: { x: touch.clientX, y: touch.clientY }
    });
  };
  
  // Handle touch move for swipe controls
  const handleScreenTouchMove = (e: React.TouchEvent) => {
    // Process each active touch
    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const startPos = touchStartPos[touch.identifier];
      
      if (startPos) {
        // Calculate swipe direction based on movement from start position
        const deltaX = touch.clientX - startPos.x;
        const deltaY = touch.clientY - startPos.y;
        const threshold = 20; // Minimum swipe distance
        
        // Determine direction based on strongest component
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          // Horizontal swipe
          const left = deltaX < -threshold;
          const right = deltaX > threshold;
          
          // Update active regions
          setActiveRegions(prev => ({
            ...prev,
            left,
            right
          }));
        } else {
          // Vertical swipe
          const forward = deltaY < -threshold;
          const backward = deltaY > threshold;
          
          // Update active regions
          setActiveRegions(prev => ({
            ...prev,
            forward,
            backward
          }));
        }
        
        // Update controls
        setKeys({
          forward: activeRegions.forward,
          backward: activeRegions.backward,
          left: activeRegions.left,
          right: activeRegions.right
        });
      }
    }
  };
  
  // Handle touch end for swipe controls
  const handleScreenTouchEnd = (e: React.TouchEvent) => {
    // Clear this touch point
    const updatedTouches = { ...touchStartPos };
    for (let i = 0; i < e.changedTouches.length; i++) {
      delete updatedTouches[e.changedTouches[i].identifier];
    }
    setTouchStartPos(updatedTouches);
    
    // If no touches remain, reset all directions
    if (Object.keys(updatedTouches).length === 0) {
      setActiveRegions({
        forward: false,
        backward: false,
        left: false,
        right: false
      });
      
      // Reset keys
      setKeys({
        forward: false,
        backward: false,
        left: false,
        right: false
      });
    }
  };
  
  // Handle action buttons
  const handleInteractStart = () => {
    setInteractPressed(true);
    setKeys(state => ({ ...state, interact: true }));
  };
  
  const handleInteractEnd = () => {
    setInteractPressed(false);
    setKeys(state => ({ ...state, interact: false }));
  };
  
  const handleMenuStart = () => {
    setMenuPressed(true);
    setKeys(state => ({ ...state, menu: true }));
  };
  
  const handleMenuEnd = () => {
    setMenuPressed(false);
    setKeys(state => ({ ...state, menu: false }));
  };
  
  return (
    <>
      {/* Full screen touch area */}
      <div 
        className="absolute inset-0 z-10 touch-none"
        onTouchStart={handleScreenTouchStart}
        onTouchMove={handleScreenTouchMove}
        onTouchEnd={handleScreenTouchEnd}
        onTouchCancel={handleScreenTouchEnd}
      >
        {/* Direction indicators */}
        <div className="absolute inset-x-0 top-1/4 flex justify-center pointer-events-none">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity duration-150"
            style={{ 
              backgroundColor: `rgba(59, 130, 246, ${controlsOpacity})`,
              opacity: activeRegions.forward ? 0.9 : 0.3
            }}
          >
            <span className="text-white font-bold">↑</span>
          </div>
        </div>
        
        <div className="absolute inset-x-0 bottom-1/3 flex justify-center pointer-events-none">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity duration-150"
            style={{ 
              backgroundColor: `rgba(59, 130, 246, ${controlsOpacity})`,
              opacity: activeRegions.backward ? 0.9 : 0.3
            }}
          >
            <span className="text-white font-bold">↓</span>
          </div>
        </div>
        
        <div className="absolute inset-y-0 left-10 flex items-center pointer-events-none">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity duration-150"
            style={{ 
              backgroundColor: `rgba(59, 130, 246, ${controlsOpacity})`,
              opacity: activeRegions.left ? 0.9 : 0.3
            }}
          >
            <span className="text-white font-bold">←</span>
          </div>
        </div>
        
        <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center transition-opacity duration-150"
            style={{ 
              backgroundColor: `rgba(59, 130, 246, ${controlsOpacity})`,
              opacity: activeRegions.right ? 0.9 : 0.3
            }}
          >
            <span className="text-white font-bold">→</span>
          </div>
        </div>
      </div>
      
      {/* Action buttons - similar to joystick controls */}
      <div className="absolute bottom-20 right-8 flex flex-col gap-4 z-20">
        {/* Interact button */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          style={{ 
            backgroundColor: interactPressed 
              ? `rgba(217, 119, 6, ${controlsOpacity})` 
              : `rgba(245, 158, 11, ${controlsOpacity})`
          }}
          onTouchStart={handleInteractStart}
          onTouchEnd={handleInteractEnd}
          onTouchCancel={handleInteractEnd}
        >
          E
        </div>
        
        {/* Menu button */}
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg"
          style={{ 
            backgroundColor: menuPressed 
              ? `rgba(109, 40, 217, ${controlsOpacity})` 
              : `rgba(124, 58, 237, ${controlsOpacity})`
          }}
          onTouchStart={handleMenuStart}
          onTouchEnd={handleMenuEnd}
          onTouchCancel={handleMenuEnd}
        >
          ESC
        </div>
      </div>
    </>
  );
};

export default SpaceExploration;