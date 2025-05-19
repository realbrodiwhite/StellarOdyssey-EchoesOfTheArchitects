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

// Weapon types for EVE-like combat system
type WeaponType = "kineticTurret" | "laserCannon" | "missile" | "lockingMissile" | "miningLaser";

// Ammunition and weapon stats
interface Weapon {
  type: WeaponType;
  name: string;
  damage: number;
  range: number;
  fireRate: number; // shots per second
  energyCost: number;
  cooldown: number;
  currentCooldown: number;
  projectileSpeed: number;
  color: string;
}

// Projectile class for weapon firing
interface Projectile {
  id: string;
  type: WeaponType;
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  damage: number;
  range: number;
  distanceTraveled: number;
  color: string;
  target?: THREE.Object3D;
}

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

// Projectile component for weapons
const Projectile = ({ projectile, onRemove }: { 
  projectile: Projectile, 
  onRemove: (id: string) => void 
}) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state, delta) => {
    if (!ref.current) return;
    
    // Move projectile along its direction
    const movement = projectile.direction.clone().multiplyScalar(projectile.speed * delta);
    ref.current.position.add(movement);
    
    // Update distance traveled
    projectile.distanceTraveled += movement.length();
    
    // Check if projectile has reached its range
    if (projectile.distanceTraveled >= projectile.range) {
      onRemove(projectile.id);
      return;
    }
    
    // Handle homing missiles
    if (projectile.type === "lockingMissile" && projectile.target) {
      const targetPosition = projectile.target.position;
      const toTarget = targetPosition.clone().sub(ref.current.position).normalize();
      
      // Gradually turn toward target
      const turnFactor = 0.1;
      projectile.direction.lerp(toTarget, turnFactor * delta * 10);
      projectile.direction.normalize();
      
      // Orient the missile toward its direction
      if (ref.current) {
        const lookAtPos = ref.current.position.clone().add(projectile.direction);
        ref.current.lookAt(lookAtPos);
      }
    }
  });

  // Different visuals for different projectile types
  const getProjectileGeometry = () => {
    switch (projectile.type) {
      case "kineticTurret":
        return <sphereGeometry args={[0.1, 8, 8]} />;
      case "laserCannon":
        return <cylinderGeometry args={[0.03, 0.03, 2, 8]} rotation={[Math.PI / 2, 0, 0]} />;
      case "missile":
      case "lockingMissile":
        return <coneGeometry args={[0.1, 0.4, 8]} rotation={[Math.PI / 2, 0, 0]} />;
      case "miningLaser":
        return <cylinderGeometry args={[0.05, 0.01, 1.5, 8]} rotation={[Math.PI / 2, 0, 0]} />;
      default:
        return <boxGeometry args={[0.1, 0.1, 0.3]} />;
    }
  };

  // Different materials for different projectile types
  const getProjectileMaterial = () => {
    let emissiveIntensity = 1.0;
    
    switch (projectile.type) {
      case "laserCannon":
        emissiveIntensity = 2.0;
        break;
      case "miningLaser":
        emissiveIntensity = 1.5;
        break;
      default:
        emissiveIntensity = 0.8;
    }
    
    return (
      <meshStandardMaterial 
        color={projectile.color} 
        emissive={projectile.color} 
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.9}
      />
    );
  };

  // Add trail effects for missiles
  const renderTrail = () => {
    if (projectile.type === "missile" || projectile.type === "lockingMissile") {
      return (
        <pointLight
          position={[0, 0, 0.2]}
          distance={2}
          intensity={0.5}
          color={"#ffaa44"}
        />
      );
    }
    return null;
  };

  return (
    <mesh
      ref={ref}
      position={projectile.position.toArray()}
      userData={{ projectile: true, id: projectile.id }}
    >
      {getProjectileGeometry()}
      {getProjectileMaterial()}
      {renderTrail()}
    </mesh>
  );
};

// EVE Online style minimap component
const Minimap = ({ 
  playerPosition,
  interactables,
  projectiles,
  selectedTarget,
  onSelectTarget
}: { 
  playerPosition: THREE.Vector3,
  interactables: Interactable[],
  projectiles: Projectile[],
  selectedTarget: string | null,
  onSelectTarget: (id: string) => void
}) => {
  const minimapSize = 150;
  const minimapRadius = minimapSize / 2;
  const minimapScale = 0.1; // Scale factor for converting world to minimap coordinates
  
  // Style for the minimap container
  const minimapStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    width: `${minimapSize}px`,
    height: `${minimapSize}px`,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    border: '2px solid rgba(150, 150, 150, 0.8)',
    borderRadius: '50%',
    overflow: 'hidden',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    zIndex: 1000
  };
  
  // Transform world position to minimap position
  const worldToMinimap = (worldPos: [number, number, number]): [number, number] => {
    // Scale the position and center it on the minimap
    const x = worldPos[0] * minimapScale + minimapRadius;
    const y = worldPos[2] * minimapScale + minimapRadius; // Use Z as Y on the 2D map
    
    return [x, y];
  };
  
  // Style for the player dot
  const playerDotStyle: React.CSSProperties = {
    position: 'absolute',
    width: '6px',
    height: '6px',
    backgroundColor: '#00ffff',
    border: '1px solid #ffffff',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    // Convert player position to minimap position
    left: `${worldToMinimap([playerPosition.x, playerPosition.y, playerPosition.z])[0]}px`,
    top: `${worldToMinimap([playerPosition.x, playerPosition.y, playerPosition.z])[1]}px`,
    zIndex: 2
  };
  
  // Render interactable markers on the minimap
  const renderInteractableMarkers = () => {
    return interactables.map(interactable => {
      const [x, y] = worldToMinimap(interactable.position);
      
      let color;
      let size = 4;
      
      switch (interactable.type) {
        case "location":
          color = interactable.color || "#33ff88";
          size = 5;
          break;
        case "asteroid":
          color = interactable.color || "#bbbbbb";
          break;
        case "debris":
          color = interactable.color || "#ff8800";
          break;
        case "anomaly":
          color = interactable.color || "#ff33ff";
          break;
        default:
          color = "#ffffff";
      }
      
      const isSelected = selectedTarget === interactable.id;
      
      const markerStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 1,
        border: isSelected ? '1px solid #ffffff' : 'none',
        boxShadow: isSelected ? '0 0 3px #ffffff' : 'none',
        cursor: 'pointer'
      };
      
      return (
        <div 
          key={interactable.id} 
          style={markerStyle} 
          onClick={() => onSelectTarget(interactable.id)}
          title={interactable.name}
        />
      );
    });
  };
  
  // Render projectile markers on the minimap
  const renderProjectileMarkers = () => {
    return projectiles.map(projectile => {
      const [x, y] = worldToMinimap([
        projectile.position.x, 
        projectile.position.y, 
        projectile.position.z
      ]);
      
      let color;
      let size = 2;
      
      switch (projectile.type) {
        case "kineticTurret":
          color = projectile.color;
          break;
        case "laserCannon":
          color = projectile.color;
          break;
        case "missile":
        case "lockingMissile":
          color = "#ff6600";
          size = 3;
          break;
        case "miningLaser":
          color = "#44ff88";
          break;
        default:
          color = projectile.color;
      }
      
      const markerStyle: React.CSSProperties = {
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        left: `${x}px`,
        top: `${y}px`,
        zIndex: 1
      };
      
      return (
        <div 
          key={projectile.id} 
          style={markerStyle}
        />
      );
    });
  };
  
  // Render minimap navigation circles
  const renderCircles = () => {
    return (
      <>
        {/* Range circles */}
        <div style={{
          position: 'absolute',
          width: '70%',
          height: '70%',
          border: '1px solid rgba(100, 180, 255, 0.3)',
          borderRadius: '50%',
          top: '15%',
          left: '15%'
        }} />
        <div style={{
          position: 'absolute',
          width: '40%',
          height: '40%',
          border: '1px solid rgba(100, 180, 255, 0.3)',
          borderRadius: '50%',
          top: '30%',
          left: '30%'
        }} />
      </>
    );
  };
  
  return (
    <div style={minimapStyle}>
      {renderCircles()}
      {renderInteractableMarkers()}
      {renderProjectileMarkers()}
      <div style={playerDotStyle} />
    </div>
  );
};

// Weapon UI component for EVE-like weapon controls
const WeaponControls = ({ 
  weapons, 
  selectedWeapon, 
  onSelectWeapon, 
  onFireWeapon, 
  selectedTarget 
}: { 
  weapons: Weapon[], 
  selectedWeapon: number,
  onSelectWeapon: (index: number) => void,
  onFireWeapon: () => void,
  selectedTarget: string | null
}) => {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 20, 40, 0.7)',
    border: '1px solid rgba(100, 180, 255, 0.8)',
    borderRadius: '5px',
    padding: '10px',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    zIndex: 1000,
    maxWidth: '500px'
  };
  
  const weaponRowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '10px'
  };
  
  const weaponButtonStyle = (index: number): React.CSSProperties => ({
    backgroundColor: index === selectedWeapon 
      ? 'rgba(100, 180, 255, 0.6)' 
      : 'rgba(40, 60, 100, 0.6)',
    border: `1px solid ${index === selectedWeapon ? 'rgba(150, 220, 255, 0.9)' : 'rgba(100, 140, 200, 0.6)'}`,
    color: 'white',
    padding: '5px 10px',
    margin: '0 5px',
    borderRadius: '3px',
    cursor: 'pointer',
    outline: 'none',
    fontSize: '12px',
    flex: 1,
    textAlign: 'center'
  });
  
  const fireButtonStyle: React.CSSProperties = {
    backgroundColor: selectedTarget 
      ? 'rgba(200, 60, 60, 0.7)' 
      : 'rgba(100, 60, 60, 0.4)',
    border: `1px solid ${selectedTarget ? 'rgba(255, 100, 100, 0.9)' : 'rgba(150, 80, 80, 0.5)'}`,
    color: 'white',
    padding: '8px 15px',
    borderRadius: '3px',
    cursor: selectedTarget ? 'pointer' : 'not-allowed',
    outline: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    marginTop: '5px',
    width: '100%'
  };
  
  const currentWeapon = weapons[selectedWeapon];
  
  // Show cooldown progress if weapon is cooling down
  const cooldownProgress = currentWeapon.currentCooldown > 0 
    ? (currentWeapon.currentCooldown / currentWeapon.cooldown * 100) 
    : 0;
  
  return (
    <div style={containerStyle}>
      <div style={weaponRowStyle}>
        {weapons.map((weapon, index) => (
          <button 
            key={weapon.type} 
            style={weaponButtonStyle(index)}
            onClick={() => onSelectWeapon(index)}
          >
            {weapon.name}
          </button>
        ))}
      </div>
      
      <div style={{ width: '100%', textAlign: 'center', marginBottom: '5px' }}>
        {currentWeapon.currentCooldown > 0 ? (
          <div style={{ position: 'relative', height: '10px', backgroundColor: 'rgba(40, 60, 80, 0.6)', borderRadius: '2px' }}>
            <div style={{ 
              position: 'absolute', 
              left: 0, 
              top: 0, 
              height: '100%', 
              width: `${100 - cooldownProgress}%`,
              backgroundColor: 'rgba(100, 180, 255, 0.8)',
              borderRadius: '2px'
            }} />
          </div>
        ) : (
          <div style={{ fontSize: '12px' }}>
            {selectedTarget ? 'Ready to Fire!' : 'Select Target'}
          </div>
        )}
      </div>
      
      <button 
        style={fireButtonStyle}
        onClick={onFireWeapon}
        disabled={!selectedTarget || currentWeapon.currentCooldown > 0}
      >
        FIRE {currentWeapon.name.toUpperCase()}
      </button>
    </div>
  );
};

// Target info display
const TargetInfo = ({ 
  target, 
  onClearTarget 
}: { 
  target: Interactable | null, 
  onClearTarget: () => void 
}) => {
  if (!target) return null;
  
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    backgroundColor: 'rgba(0, 20, 40, 0.7)',
    border: '1px solid rgba(100, 180, 255, 0.8)',
    borderRadius: '5px',
    padding: '10px',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    zIndex: 1000,
    minWidth: '200px'
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    borderBottom: '1px solid rgba(100, 180, 255, 0.4)',
    paddingBottom: '5px'
  };
  
  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'rgba(150, 220, 255, 1.0)'
  };
  
  const closeButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(150, 220, 255, 0.8)',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px'
  };
  
  let targetTypeColor;
  switch (target.type) {
    case "location":
      targetTypeColor = target.color || "#33ff88";
      break;
    case "asteroid":
      targetTypeColor = target.color || "#bbbbbb";
      break;
    case "debris":
      targetTypeColor = target.color || "#ff8800";
      break;
    case "anomaly":
      targetTypeColor = target.color || "#ff33ff";
      break;
    default:
      targetTypeColor = "#ffffff";
  }
  
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{target.name}</h3>
        <button style={closeButtonStyle} onClick={onClearTarget}>×</button>
      </div>
      
      <div style={{ marginBottom: '5px' }}>
        <span style={{ 
          display: 'inline-block', 
          width: '12px', 
          height: '12px', 
          backgroundColor: targetTypeColor,
          borderRadius: '50%',
          marginRight: '5px',
          verticalAlign: 'middle'
        }}></span>
        <span style={{ 
          textTransform: 'capitalize', 
          color: 'rgba(200, 230, 255, 0.9)'
        }}>
          {target.type}
        </span>
      </div>
      
      {target.description && (
        <p style={{ 
          margin: '5px 0', 
          fontSize: '12px',
          color: 'rgba(180, 210, 240, 0.8)'
        }}>
          {target.description}
        </p>
      )}
      
      <div style={{ 
        fontSize: '12px', 
        marginTop: '10px',
        color: 'rgba(100, 180, 255, 0.7)'
      }}>
        Distance: {Math.floor(Math.random() * 100) + 200} km
      </div>
    </div>
  );
};

// Player spaceship
const Spaceship = ({ 
  onFireWeapon 
}: { 
  onFireWeapon: (
    position: THREE.Vector3, 
    direction: THREE.Vector3, 
    weaponType: WeaponType,
    target?: THREE.Object3D
  ) => void
}) => {
  const shipRef = useRef<THREE.Group>(null);
  const [shipRotation, setShipRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [rotationTarget, setRotationTarget] = useState<[number, number, number]>([0, 0, 0]);
  const [, getKeys] = useKeyboardControls<Controls>();
  const [velocity, setVelocity] = useState(new THREE.Vector3(0, 0, 0));
  const maxSpeed = 1.0;
  const acceleration = 0.05;
  const deceleration = 0.02;
  const rotationSpeed = 0.1;
  
  // Weapons system
  const [weapons, setWeapons] = useState<Weapon[]>([
    {
      type: "kineticTurret",
      name: "Kinetic Turret",
      damage: 25,
      range: 30,
      fireRate: 2,
      energyCost: 5,
      cooldown: 1.5,
      currentCooldown: 0,
      projectileSpeed: 20,
      color: "#aaccff"
    },
    {
      type: "laserCannon",
      name: "Laser Cannon",
      damage: 40,
      range: 25,
      fireRate: 1,
      energyCost: 15,
      cooldown: 3,
      currentCooldown: 0,
      projectileSpeed: 50,
      color: "#ff3366"
    },
    {
      type: "missile",
      name: "Missile",
      damage: 80,
      range: 50,
      fireRate: 0.5,
      energyCost: 20,
      cooldown: 5,
      currentCooldown: 0,
      projectileSpeed: 12,
      color: "#ffaa44"
    },
    {
      type: "lockingMissile",
      name: "Locking Missile",
      damage: 120,
      range: 75,
      fireRate: 0.2,
      energyCost: 35,
      cooldown: 8,
      currentCooldown: 0,
      projectileSpeed: 15,
      color: "#ff8800"
    },
    {
      type: "miningLaser",
      name: "Mining Laser",
      damage: 5,
      range: 15,
      fireRate: 0.3,
      energyCost: 10,
      cooldown: 2,
      currentCooldown: 0,
      projectileSpeed: 8,
      color: "#44ff88"
    }
  ]);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  
  const { playHit } = useAudio();
  
  // Load the 3D spaceship model
  const { scene: shipModel } = useGLTF('/models/spaceship.glb') as any;
  
  // Track model loading state
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Handle model loading
  useEffect(() => {
    if (shipModel) {
      setModelLoaded(true);
      console.log("Spaceship model loaded successfully");
      
      // Scale the model appropriately - can be adjusted based on model size
      if (shipRef.current) {
        shipRef.current.scale.set(2.5, 2.5, 2.5);
      }
    }
  }, [shipModel]);
  
  // Preload the model to avoid hiccups
  useGLTF.preload('/models/spaceship.glb');
  
  // Update weapon cooldowns
  useFrame((state, delta) => {
    setWeapons(prevWeapons => 
      prevWeapons.map(weapon => ({
        ...weapon,
        currentCooldown: Math.max(0, weapon.currentCooldown - delta)
      }))
    );
  });
  
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
    
    // Handle movement with WASD and rotation with arrow keys
    if (keys.forward) {
      newVelocity.add(forward.multiplyScalar(acceleration));
    }
    
    if (keys.backward) {
      newVelocity.add(forward.multiplyScalar(-acceleration));
    }
    
    if (keys.left) {
      newVelocity.add(right.multiplyScalar(-acceleration));
    }
    
    if (keys.right) {
      newVelocity.add(right.multiplyScalar(acceleration));
    }
    
    // Apply banking effect for visual feedback on movement
    const bankAmount = Math.PI * 0.1;
    const targetZ = keys.left 
      ? bankAmount 
      : keys.right 
        ? -bankAmount 
        : 0;
    
    // Ultra-smooth interpolation with cubic easing for more natural motion
    const rotationLerpFactor = delta * 2.0; // Slower, more gradual transitions
    
    // Use smooth step function for more natural easing
    const smoothStep = (x: number): number => x * x * (3 - 2 * x);
    const easedFactor = smoothStep(rotationLerpFactor);
    
    setShipRotation([
      THREE.MathUtils.lerp(shipRotation[0], rotationTarget[0], easedFactor),
      THREE.MathUtils.lerp(shipRotation[1], rotationTarget[1], easedFactor),
      THREE.MathUtils.lerp(shipRotation[2], targetZ, easedFactor)
    ]);
    
    // Apply rotation to ship with precision rounding to avoid micro-jitters
    ship.rotation.set(
      Math.round(shipRotation[0] * 1000) / 1000,
      Math.round(shipRotation[1] * 1000) / 1000, 
      Math.round(shipRotation[2] * 1000) / 1000
    );
    
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
    
    // *** TRUE THIRD-PERSON CAMERA ***
    // Position camera behind and slightly above the ship
    const cameraOffset = new THREE.Vector3(0, 2, 8); // Adjusted for better third-person view
    const cameraPos = new THREE.Vector3();
    
    // Transform the offset from ship's local space to world space
    cameraOffset.applyQuaternion(ship.quaternion);
    
    // Add the transformed offset to the ship's position
    cameraPos.copy(ship.position).add(cameraOffset);
    
    // Smooth camera movement
    const cameraLerpFactor = delta * 1.5; // Smoother camera transitions
    state.camera.position.lerp(cameraPos, cameraLerpFactor);
    
    // Camera looks at ship with slight offset to look ahead
    const lookAhead = forward.clone().multiplyScalar(4); // Look ahead of ship
    const lookTarget = ship.position.clone().add(lookAhead);
    state.camera.lookAt(lookTarget);
  });
  
  // Handle weapon firing
  const handleFireWeapon = (target?: THREE.Object3D) => {
    if (!shipRef.current) return;
    
    const weapon = weapons[selectedWeapon];
    if (weapon.currentCooldown > 0) return;
    
    // Get ship's forward direction
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(shipRef.current.quaternion);
    direction.normalize();
    
    // Get weapon muzzle position (slightly in front of the ship)
    const weaponPosition = shipRef.current.position.clone().add(
      direction.clone().multiplyScalar(2)
    );
    
    // Set weapon on cooldown
    setWeapons(prevWeapons => {
      const newWeapons = [...prevWeapons];
      newWeapons[selectedWeapon] = {
        ...newWeapons[selectedWeapon],
        currentCooldown: newWeapons[selectedWeapon].cooldown
      };
      return newWeapons;
    });
    
    // Fire the weapon
    onFireWeapon(weaponPosition, direction, weapon.type, target);
    
    // Play sound effect
    playHit();
  };
  
  // Create a ref for thruster animation
  const thrusterRef = useRef<THREE.Group>(null);
  
  // Track the exhaust particles
  const [exhaustParticles, setExhaustParticles] = useState<THREE.Vector3[]>([]);
  const maxParticles = 100;
  
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
      {/* High-fidelity spaceship model using the same design as intro ship */}
      {modelLoaded ? (
        // Render the actual 3D model
        <primitive 
          object={shipModel.clone()} 
          castShadow 
          receiveShadow
          rotation={[0, Math.PI, 0]} // Adjust rotation to face forward
        />
      ) : (
        // Fallback shape while model loads
        <group>
          <mesh castShadow>
            <coneGeometry args={[1, 3, 3]} />
            <meshStandardMaterial 
              color="#3366ff" 
              roughness={0.3} 
              metalness={0.7} 
            />
          </mesh>
          <mesh position={[0, 0, 1]} castShadow>
            <boxGeometry args={[3, 0.5, 1]} />
            <meshStandardMaterial 
              color="#2255cc" 
              roughness={0.4} 
              metalness={0.6} 
            />
          </mesh>
        </group>
      )}
      
      {/* Simple engine thruster effects - no heat shield flashing */}
      <group ref={thrusterRef} position={[0, 0, 2.5]}>
        {/* Engine glow - simple yellow point light */}
        <pointLight
          position={[0, 0, 0]}
          distance={3}
          intensity={0.8}
          color="#ffaa00"
        />
        
        {/* Engine exhaust particles */}
        {exhaustParticles.map((particle, i) => (
          <mesh key={i} position={particle.toArray()}>
            <sphereGeometry args={[0.05 + Math.random() * 0.05, 6, 6]} />
            <meshBasicMaterial 
              color="#ffaa44" 
              transparent 
              opacity={0.7 - (particle.z / 15) * 0.7}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// Moon component
const Moon = ({ position, name, color = "#aaaaff" }: {
  position: [number, number, number];
  name: string;
  color?: string;
}) => {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.9}
          metalness={0.1}
        />
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

// Interactable object component
const InteractableObject = ({ 
  interactable, 
  isHighlighted, 
  onInteract,
  isSelected
}: { 
  interactable: Interactable;
  isHighlighted: boolean;
  onInteract: () => void;
  isSelected: boolean;
}) => {
  const objRef = useRef<THREE.Group>(null);
  
  // Rotation animation
  useFrame((state, delta) => {
    if (objRef.current) {
      objRef.current.rotation.y += delta * 0.3;
    }
  });
  
  // Get color based on interactable type
  const getColor = () => {
    switch (interactable.type) {
      case "location":
        return interactable.color || "#33ff88";
      case "asteroid":
        return interactable.color || "#bbbbbb";
      case "debris":
        return interactable.color || "#ff8800";
      case "anomaly":
        return interactable.color || "#ff33ff";
      default:
        return "#ffffff";
    }
  };
  
  // Get shape based on interactable type
  const getShape = () => {
    switch (interactable.type) {
      case "location":
        return (
          <sphereGeometry args={[1, 16, 16]} />
        );
      case "asteroid":
        return (
          <icosahedronGeometry args={[1, 0]} />
        );
      case "debris":
        return (
          <dodecahedronGeometry args={[1, 0]} />
        );
      case "anomaly":
        return (
          <octahedronGeometry args={[1, 0]} />
        );
      default:
        return (
          <boxGeometry args={[1, 1, 1]} />
        );
    }
  };
  
  return (
    <group 
      ref={objRef} 
      position={interactable.position}
      scale={interactable.scale || [1, 1, 1]}
      onClick={onInteract}
      userData={{ interactable: true, interactableId: interactable.id }}
    >
      <mesh castShadow>
        {getShape()}
        <meshStandardMaterial 
          color={getColor()} 
          emissive={isHighlighted || isSelected ? getColor() : "#000000"} 
          emissiveIntensity={isHighlighted ? 0.5 : isSelected ? 0.8 : 0}
          roughness={0.7} 
          metalness={0.3} 
        />
      </mesh>
      <Text
        position={[0, 2, 0]}
        fontSize={0.8}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {interactable.name}
      </Text>
      
      {(isHighlighted || isSelected) && (
        <pointLight
          position={[0, 0, 0]}
          distance={5}
          intensity={isSelected ? 0.8 : 0.4}
          color={getColor()}
        />
      )}
      
      {/* Selection indicator */}
      {isSelected && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.5, 0.05, 16, 32]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.7} 
            />
          </mesh>
          
          {/* Targeting brackets */}
          {Array.from({ length: 4 }).map((_, i) => (
            <mesh 
              key={i} 
              position={[
                i % 2 === 0 ? (i < 2 ? -1.8 : 1.8) : 0,
                i % 2 === 1 ? (i < 2 ? -1.8 : 1.8) : 0,
                0
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <boxGeometry args={[0.4, 0.05, 0.05]} />
              <meshBasicMaterial 
                color="#ffffff" 
                transparent 
                opacity={0.9} 
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};

// Generate interactable objects based on location type
const generateInteractables = (locationType: LocationType): Interactable[] => {
  switch (locationType) {
    case LocationType.Space:
      return [
        {
          id: "planet-1",
          type: "location",
          position: [20, 0, -30],
          name: "Alpha Prime",
          description: "Habitable planet with rich mineral deposits",
          color: "#66ff88"
        },
        {
          id: "station-1",
          type: "location",
          position: [-15, 5, -40],
          name: "Trading Post",
          description: "Caldari Trading Station - Commerce hub",
          color: "#aaaaff"
        },
        {
          id: "asteroid-1",
          type: "asteroid",
          position: [0, -10, -50],
          name: "Resource Cluster",
          description: "Dense asteroid field rich in minerals",
          scale: [3, 3, 3]
        },
        {
          id: "asteroid-2",
          type: "asteroid",
          position: [12, -5, -45],
          name: "Veldspar Field",
          description: "Common ore field suitable for mining",
          scale: [2.5, 2.5, 2.5]
        },
        {
          id: "asteroid-3",
          type: "asteroid",
          position: [-8, -7, -55],
          name: "Scordite Belt",
          description: "Valuable ore with high metal content",
          scale: [2, 2, 2],
          color: "#ddaa88"
        },
        {
          id: "debris-1",
          type: "debris",
          position: [8, 12, -60],
          name: "Ship Wreckage",
          description: "Destroyed vessel with salvageable components",
          scale: [1.5, 1.5, 1.5]
        },
        {
          id: "anomaly-1",
          type: "anomaly",
          position: [-30, 15, -70],
          name: "Void Signal",
          description: "Unknown energy signature - approach with caution",
          color: "#ff77ff"
        }
      ];
    case LocationType.Planet:
      return [
        {
          id: "settlement-1",
          type: "location",
          position: [30, 0, -50],
          name: "Research Outpost",
          description: "Scientific facility studying planet's ecosystem",
          color: "#ffcc44"
        },
        {
          id: "ruins-1",
          type: "location",
          position: [-25, 10, -60],
          name: "Ancient Temple",
          description: "Mysterious ruins of unknown origin",
          color: "#ff8855"
        }
      ];
    default:
      return [];
  }
};

// Define the main SpaceExploration component
interface SpaceExplorationProps {
  onNavigate: () => void;
  onLand: (locationId: string) => void;
}

const SpaceExploration = ({ onNavigate, onLand }: SpaceExplorationProps) => {
  const { currentLocation } = useLocation();
  const [highlightedInteractable, setHighlightedInteractable] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [selectedWeapon, setSelectedWeapon] = useState(0);
  const shipRef = useRef<THREE.Group>(null);
  const controls = useRef<React.ElementRef<typeof PerspectiveCamera>>(null);
  const isMobile = useIsMobile();
  
  // Generate interactable objects based on the current location
  const interactables = useMemo(() => {
    // Make sure currentLocation is defined before accessing its properties
    if (!currentLocation) return [];
    return generateInteractables(currentLocation.type);
  }, [currentLocation]);
  
  // Get the selected interactable object
  const selectedInteractable = useMemo(() => {
    return interactables.find(i => i.id === selectedTarget) || null;
  }, [interactables, selectedTarget]);
  
  // Generate a unique ID for projectiles
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
  };
  
  // Handle firing weapons
  const handleFireWeapon = (
    position: THREE.Vector3, 
    direction: THREE.Vector3, 
    weaponType: WeaponType,
    target?: THREE.Object3D
  ) => {
    const newProjectile: Projectile = {
      id: generateId(),
      type: weaponType,
      position: position.clone(),
      direction: direction.clone(),
      speed: getProjectileSpeed(weaponType),
      damage: getProjectileDamage(weaponType),
      range: getProjectileRange(weaponType),
      distanceTraveled: 0,
      color: getProjectileColor(weaponType),
      target
    };
    
    setProjectiles(prev => [...prev, newProjectile]);
    
    // Play weapon sound based on type
    const { playHit, playLaser } = useAudio();
    
    if (weaponType === "laserCannon" || weaponType === "miningLaser") {
      playLaser();
    } else {
      playHit();
    }
  };
  
  // Get projectile speed based on weapon type
  const getProjectileSpeed = (weaponType: WeaponType): number => {
    switch (weaponType) {
      case "kineticTurret": return 20;
      case "laserCannon": return 50;
      case "missile": return 12;
      case "lockingMissile": return 15;
      case "miningLaser": return 8;
      default: return 15;
    }
  };
  
  // Get projectile damage based on weapon type
  const getProjectileDamage = (weaponType: WeaponType): number => {
    switch (weaponType) {
      case "kineticTurret": return 25;
      case "laserCannon": return 40;
      case "missile": return 80;
      case "lockingMissile": return 120;
      case "miningLaser": return 5;
      default: return 10;
    }
  };
  
  // Get projectile range based on weapon type
  const getProjectileRange = (weaponType: WeaponType): number => {
    switch (weaponType) {
      case "kineticTurret": return 30;
      case "laserCannon": return 25;
      case "missile": return 50;
      case "lockingMissile": return 75;
      case "miningLaser": return 15;
      default: return 20;
    }
  };
  
  // Get projectile color based on weapon type
  const getProjectileColor = (weaponType: WeaponType): string => {
    switch (weaponType) {
      case "kineticTurret": return "#aaccff";
      case "laserCannon": return "#ff3366";
      case "missile": 
      case "lockingMissile": 
        return "#ff8800";
      case "miningLaser": return "#44ff88";
      default: return "#ffffff";
    }
  };
  
  // Handle removing projectiles
  const handleRemoveProjectile = (id: string) => {
    setProjectiles(prev => prev.filter(p => p.id !== id));
  };
  
  // Handle raycaster for interaction with objects
  useFrame((state) => {
    // Simple raycaster from camera
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0); // Center of screen
    
    raycaster.setFromCamera(mouse, state.camera);
    
    // Check for intersections with interactable objects
    const intersects = raycaster.intersectObjects(
      state.scene.children.filter(child => 
        child.userData && child.userData.interactable
      ),
      true
    );
    
    if (intersects.length > 0) {
      // Get the interactable object that was hit
      const hit = intersects[0].object;
      let parentObj = hit;
      
      // Find the parent with userData
      while (parentObj && (!parentObj.userData || !parentObj.userData.interactableId)) {
        if (parentObj.parent) {
          parentObj = parentObj.parent;
        } else {
          break;
        }
      }
      
      if (parentObj && parentObj.userData && parentObj.userData.interactableId) {
        const interactableId = parentObj.userData.interactableId;
        
        if (interactableId && interactableId !== highlightedInteractable) {
          setHighlightedInteractable(interactableId);
        }
      }
    } else if (highlightedInteractable) {
      setHighlightedInteractable(null);
    }
  });
  
  // Mobile touch controls
  const [touchStart, setTouchStart] = useState<[number, number] | null>(null);
  const [touchEnd, setTouchEnd] = useState<[number, number] | null>(null);
  const touchSensitivity = 1.0;
  
  // Render location-specific content
  const renderLocationContent = () => {
    // Handle undefined currentLocation
    if (!currentLocation) return null;
    
    switch (currentLocation.type) {
      case LocationType.Planet:
        return (
          <>
            <Planet 
              position={[0, -50, -100]} 
              size={40} 
              color="#44aa66" 
              name={currentLocation.name} 
            />
            <Moon 
              position={[60, 20, -150]} 
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
      <Spaceship onFireWeapon={handleFireWeapon} />
      
      {/* Location-specific content */}
      {renderLocationContent()}
      
      {/* Projectiles */}
      {projectiles.map(projectile => (
        <Projectile
          key={projectile.id}
          projectile={projectile}
          onRemove={handleRemoveProjectile}
        />
      ))}
      
      {/* Interactable objects */}
      {interactables.map(interactable => (
        <InteractableObject
          key={interactable.id}
          interactable={interactable}
          isHighlighted={highlightedInteractable === interactable.id}
          isSelected={selectedTarget === interactable.id}
          onInteract={() => setSelectedTarget(interactable.id)}
        />
      ))}
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Star background */}
      <mesh position={[0, 0, -500]} rotation={[0, 0, 0]}>
        <sphereGeometry args={[400, 64, 64]} />
        <meshBasicMaterial color="#000011" side={THREE.BackSide} />
      </mesh>
      
      {/* UI - Rendered using Html */}
      <Html position={[0, 0, 0]} center>
        {/* EVE-like Minimap */}
        <Minimap 
          playerPosition={shipRef.current?.position || new THREE.Vector3(0, 0, 0)}
          interactables={interactables}
          projectiles={projectiles}
          selectedTarget={selectedTarget}
          onSelectTarget={setSelectedTarget}
        />
        
        {/* Target Info Display */}
        {selectedInteractable && (
          <TargetInfo 
            target={selectedInteractable} 
            onClearTarget={() => setSelectedTarget(null)} 
          />
        )}
        
        {/* Weapon Controls */}
        <WeaponControls 
          weapons={[
            {
              type: "kineticTurret",
              name: "Kinetic Turret",
              damage: 25,
              range: 30,
              fireRate: 2,
              energyCost: 5,
              cooldown: 1.5,
              currentCooldown: 0,
              projectileSpeed: 20,
              color: "#aaccff"
            },
            {
              type: "laserCannon",
              name: "Laser Cannon",
              damage: 40,
              range: 25,
              fireRate: 1,
              energyCost: 15,
              cooldown: 3,
              currentCooldown: 0,
              projectileSpeed: 50,
              color: "#ff3366"
            },
            {
              type: "missile",
              name: "Missile",
              damage: 80,
              range: 50,
              fireRate: 0.5,
              energyCost: 20,
              cooldown: 5,
              currentCooldown: 0,
              projectileSpeed: 12,
              color: "#ffaa44"
            },
            {
              type: "lockingMissile",
              name: "Locking Missile",
              damage: 120,
              range: 75,
              fireRate: 0.2,
              energyCost: 35,
              cooldown: 8,
              currentCooldown: 0,
              projectileSpeed: 15,
              color: "#ff8800"
            },
            {
              type: "miningLaser",
              name: "Mining Laser",
              damage: 5,
              range: 15,
              fireRate: 0.3,
              energyCost: 10,
              cooldown: 2,
              currentCooldown: 0,
              projectileSpeed: 8,
              color: "#44ff88"
            }
          ]}
          selectedWeapon={selectedWeapon}
          onSelectWeapon={setSelectedWeapon}
          onFireWeapon={() => {
            if (!selectedTarget) return;
            
            // Get the target object position
            const targetObj = interactables.find(i => i.id === selectedTarget);
            if (!targetObj) return;
            
            // Get ship's forward direction
            const direction = new THREE.Vector3();
            if (shipRef.current) {
              direction.subVectors(
                new THREE.Vector3(...targetObj.position),
                shipRef.current.position
              ).normalize();
              
              // Get weapon muzzle position (slightly in front of the ship)
              const weaponPosition = shipRef.current.position.clone().add(
                direction.clone().multiplyScalar(2)
              );
              
              // Fire the weapon
              handleFireWeapon(
                weaponPosition,
                direction,
                ["kineticTurret", "laserCannon", "missile", "lockingMissile", "miningLaser"][selectedWeapon] as WeaponType
              );
            }
          }}
          selectedTarget={selectedTarget}
        />
        
        {/* EVE-like Navigation Interface Button */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            backgroundColor: 'rgba(20, 30, 50, 0.85)',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            touchAction: 'none',
            userSelect: 'none',
            cursor: 'pointer',
            border: '1px solid rgba(100, 180, 255, 0.4)',
            boxShadow: '0 0 10px rgba(60, 120, 200, 0.5)'
          }}
          onClick={onNavigate}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(100, 180, 255, 0.8)' 
            }}></div>
            <span style={{ fontWeight: 'bold' }}>Navigation Console</span>
          </div>
        </div>
      </Html>
      
      {/* Mobile touch controls */}
      {isMobile && (
        <Html position={[0, 0, 0]} center>
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              backgroundColor: 'rgba(30, 60, 100, 0.5)',
              borderRadius: '50%',
              width: '100px',
              height: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              touchAction: 'none',
              userSelect: 'none'
            }}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              setTouchStart([touch.clientX, touch.clientY]);
            }}
            onTouchMove={(e) => {
              if (touchStart) {
                const touch = e.touches[0];
                setTouchEnd([touch.clientX, touch.clientY]);
              }
            }}
            onTouchEnd={() => {
              setTouchStart(null);
              setTouchEnd(null);
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'rgba(100, 180, 255, 0.8)',
                borderRadius: '50%',
                transform: touchEnd && touchStart
                  ? `translate(${(touchEnd[0] - touchStart[0]) * 0.5}px, ${(touchEnd[1] - touchStart[1]) * 0.5}px)`
                  : 'none',
                transition: touchEnd ? 'none' : 'transform 0.2s ease-out'
              }}
            />
          </div>
        </Html>
      )}
    </>
  );
};

export default SpaceExploration;