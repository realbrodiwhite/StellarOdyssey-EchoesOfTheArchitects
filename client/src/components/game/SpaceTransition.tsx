import { useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment, PerspectiveCamera, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceTransitionProps {
  type: 'intro' | 'selection';
  title?: string;
  onComplete: () => void;
  skipEnabled?: boolean;
}

// 3D Spaceship model for intro animation - uses the same model as the gameplay
const SpaceshipModel = ({ 
  position = [0, 0, 0],
  rotation = [0, Math.PI, 0],
  scale = 2.5
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene: shipModel } = useGLTF('/models/spaceship.glb') as any;
  const [modelLoaded, setModelLoaded] = useState(false);
  
  // Subtle blue engine glow effect only (no yellow thrusters)
  const thrusterRef = useRef<THREE.Group>(null);
  const engineGlowRef = useRef<THREE.PointLight>(null);
  
  // Preload the model to avoid hiccups
  useGLTF.preload('/models/spaceship.glb');
  
  // Handle model loading
  useEffect(() => {
    if (shipModel) {
      setModelLoaded(true);
      console.log("Intro ship model loaded successfully");
    }
  }, [shipModel]);
  
  // Animate the thruster as a pulsing effect
  useEffect(() => {
    let frame: number;
    let time = 0;
    
    const animateThrusters = () => {
      time += 0.016; // Approximately 60fps
      
      if (thrusterRef.current) {
        // Pulse pattern for the thrusters
        const pulseValue = (Math.sin(time * 5) + 1) * 0.5; // 0 to 1 smooth pulse
        
        // Scale the thruster visually
        thrusterRef.current.scale.x = 1.0 + pulseValue * 0.2;
        thrusterRef.current.scale.y = 1.0 + pulseValue * 0.2;
        thrusterRef.current.scale.z = 1.2 + pulseValue * 0.4;
        
        // Adjust the engine glow intensity
        if (engineGlowRef.current) {
          engineGlowRef.current.intensity = 0.8 + pulseValue * 0.6;
        }
      }
      
      frame = requestAnimationFrame(animateThrusters);
    };
    
    animateThrusters();
    
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  
  return (
    <group 
      ref={groupRef} 
      position={new THREE.Vector3(position[0], position[1], position[2])} 
      rotation={new THREE.Euler(rotation[0], rotation[1], rotation[2])} 
      scale={new THREE.Vector3(scale, scale, scale)}
    >
      {modelLoaded ? (
        // Render the actual 3D model
        <primitive 
          object={shipModel.clone()} 
          castShadow 
          receiveShadow
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
      
      {/* Engine glow effects - removed yellow arrow/thrusters */}
      <group ref={thrusterRef} position={[0, 0, 2.5]}>
        {/* Engine glow - blue point light */}
        <pointLight
          ref={engineGlowRef}
          position={[0, 0, 0]}
          distance={5}
          intensity={0.8}
          color="#5577FF"
        />
      </group>
    </group>
  );
};

// Background stars for the 3D scene
const Stars = ({ count = 2000 }) => {
  const positions = useRef<Float32Array>();
  const sizes = useRef<Float32Array>();
  
  if (!positions.current) {
    positions.current = new Float32Array(count * 3);
    sizes.current = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Create stars in a spherical distribution
      const radius = 200 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions.current[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions.current[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions.current[i * 3 + 2] = radius * Math.cos(phi);
      
      // Varied sizes for stars
      sizes.current[i] = Math.random() * 1.5;
    }
  }
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions.current}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes.current}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.5}
        sizeAttenuation
        color="#ffffff"
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// Planet for intro scene
const Planet = ({ position = [50, -60, -150] as [number, number, number] }) => {
  return (
    <mesh position={new THREE.Vector3(position[0], position[1], position[2])}>
      <sphereGeometry args={[40, 64, 64]} />
      <meshStandardMaterial 
        color="#4488aa" 
        roughness={0.7}
        metalness={0.3}
      />
    </mesh>
  );
};

// Animated camera for intro
const IntroCamera = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useEffect(() => {
    let frame: number;
    let time = 0;
    const animationDuration = 7; // seconds - matches ship animation duration
    
    const animateCamera = () => {
      time += 0.016; // ~60fps
      
      if (cameraRef.current) {
        // Normalized time from 0 to 1 for the full animation
        const t = Math.min(time / animationDuration, 1);
        
        // Camera flight path that complements the ship animation
        if (t < 0.4) {
          // First phase: wide establishing shot, seeing ship approach
          const startT = t / 0.4;
          const easeIn = Math.pow(startT, 2); // ease-in for smoother transition
          
          // Position camera to see ship come in from bottom right
          cameraRef.current.position.set(
            20 - easeIn * 15, // Move from right to center
            15 - easeIn * 5, // Start higher and come down
            0 // Stay at same depth
          );
          
          // Look at where the ship will be entering
          const lookX = 30 - easeIn * 30; // Look from right to center
          const lookY = -20 + easeIn * 20; // Look from bottom to center
          cameraRef.current.lookAt(lookX, lookY, -100);
          
        } else if (t < 0.6) {
          // Second phase: hold on ship as it pauses in center
          const holdT = (t - 0.4) / 0.2;
          
          // Subtle camera movement for visual interest
          const wobble = Math.sin(holdT * Math.PI * 3) * 0.3;
          
          cameraRef.current.position.set(
            wobble, // Subtle sideway movement
            10 + wobble, // Maintain height with subtle movement
            0 // Maintain depth
          );
          
          // Look directly at ship in center
          cameraRef.current.lookAt(0, 0, -80);
          
        } else {
          // Third phase: follow ship as it accelerates left
          const warpT = (t - 0.6) / 0.4;
          const easeOut = Math.pow(warpT, 2); // Quadratic ease-out
          
          // Calculate ship position during warp
          const shipX = -easeOut * 200;
          const shipZ = -80 - easeOut * 50;
          
          // Position camera to follow behind and slightly to the right
          cameraRef.current.position.set(
            shipX + 20 + warpT * 10, // Trailing behind with increasing distance
            10 - easeOut * 5, // Lower slightly as we accelerate
            0 + warpT * 30 // Stay behind ship
          );
          
          // Look ahead of ship in direction of travel
          cameraRef.current.lookAt(shipX - 50, 0, -100);
        }
      }
      
      // Complete animation
      if (time >= animationDuration) {
        cancelAnimationFrame(frame);
        onAnimationComplete();
        return;
      }
      
      frame = requestAnimationFrame(animateCamera);
    };
    
    animateCamera();
    
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [onAnimationComplete]);
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[50, 10, 30]}
      fov={60}
      near={0.1}
      far={2000}
    />
  );
};

// Animated ship for intro - new animation path
const AnimatedShip = () => {
  const shipRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    let frame: number;
    let time = 0;
    const animationDuration = 7; // shorter animation duration
    
    const animateShip = () => {
      time += 0.016; // ~60fps
      
      if (shipRef.current) {
        // Normalized time from 0 to 1 for the full animation
        const t = Math.min(time / animationDuration, 1);
        
        // Ship is visible throughout the animation
        shipRef.current.visible = true;
        
        if (t < 0.4) {
          // Ship enters from bottom right corner
          const entryT = t / 0.4; // normalized 0-1 for this phase
          const easeIn = Math.pow(entryT, 2); // ease-in for smoother start
          
          // Position: from bottom right to center
          shipRef.current.position.set(
            50 - easeIn * 50, // X: from right (50) to center (0)
            -30 + easeIn * 30, // Y: from bottom (-30) to center (0)
            -100 + easeIn * 20 // Z: approaching viewer slightly
          );
          
          // Rotation: banking as it enters
          shipRef.current.rotation.set(
            Math.PI / 12 * (1 - easeIn), // slight pitch adjustment
            Math.PI + Math.PI / 8 * (1 - easeIn), // turning toward center
            Math.PI / 10 * (1 - easeIn) // banking
          );
          
          // Scale: increase from small to large to simulate distance
          const startScale = 0.5;
          const endScale = 2.5;
          const currentScale = startScale + easeIn * (endScale - startScale);
          shipRef.current.scale.set(currentScale, currentScale, currentScale);
        } 
        else if (t < 0.6) {
          // Ship hovers in center for a moment
          const hoverT = (t - 0.4) / 0.2; // normalized 0-1 for this phase
          const hover = Math.sin(hoverT * Math.PI * 2) * 0.05; // subtle hover effect
          
          shipRef.current.position.set(
            hover, // subtle X movement
            hover * 2, // subtle Y movement
            -80 + hover * 5 // slight Z adjustment
          );
          
          // Rotation: face forward with slight movement
          shipRef.current.rotation.set(
            hover * 0.1, // subtle pitch
            Math.PI + hover * 0.1, // subtle yaw
            hover * 0.1 // subtle roll
          );
          
          // Scale: consistent
          shipRef.current.scale.set(2.5, 2.5, 2.5);
        } 
        else {
          // Ship accelerates to warp speed to the left
          const warpT = (t - 0.6) / 0.4; // normalized 0-1 for this phase
          const easeOut = Math.pow(warpT, 3); // cubic ease-out for dramatic acceleration
          
          // Position: rapidly zoom off to the left
          shipRef.current.position.set(
            -easeOut * 200, // X: accelerate left
            0, // Y: maintain height
            -80 - easeOut * 50 // Z: move slightly away from camera
          );
          
          // Rotation: steady at high speed
          shipRef.current.rotation.set(
            0,
            Math.PI - Math.PI / 4 * easeOut, // gradually turn left
            0
          );
          
          // Scale: consistent
          shipRef.current.scale.set(2.5, 2.5, 2.5);
          
          // Add "blur" effect with scaling on Z axis during acceleration
          if (warpT > 0.7) {
            const stretchFactor = 1 + (warpT - 0.7) / 0.3 * 1.5;
            shipRef.current.scale.set(2.5, 2.5, 2.5 * stretchFactor);
          }
        }
      }
      
      // Continue animation as long as needed
      if (time < animationDuration) {
        frame = requestAnimationFrame(animateShip);
      }
    };
    
    animateShip();
    
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  
  return (
    <group ref={shipRef} visible={false}>
      <SpaceshipModel />
    </group>
  );
};

// Main transition component
const SpaceTransition = ({ type, title = "Cosmic Odyssey", onComplete, skipEnabled = true }: SpaceTransitionProps) => {
  const [isActive, setIsActive] = useState(true);
  const [showTitle, setShowTitle] = useState(false);
  
  useEffect(() => {
    // Show title after a delay
    const titleTimer = setTimeout(() => {
      setShowTitle(true);
    }, 1500); // Show title sooner with the shorter animation
    
    // Set timeout to match the total animation duration for a smooth transition
    const animationTimer = setTimeout(() => {
      setIsActive(false);
      onComplete();
    }, 8000); // Match our new animation duration of ~7 seconds plus a small buffer
    
    return () => {
      clearTimeout(titleTimer);
      clearTimeout(animationTimer);
    };
  }, [onComplete]);
  
  const handleSkip = () => {
    if (skipEnabled) {
      setIsActive(false);
      onComplete();
    }
  };
  
  const handleAnimationComplete = () => {
    // Animation completed naturally
    setIsActive(false);
    onComplete();
  };
  
  if (!isActive) return null;
  
  // For intro animation (initial title screen)
  if (type === 'intro') {
    return (
      <div className="space-scene-container" onClick={handleSkip}>
        {/* 3D Canvas for the intro animation */}
        <div className="intro-scene-3d" style={{ width: '100%', height: '100%' }}>
          <Canvas shadows>
            <Stars count={1500} />
            <Planet />
            <AnimatedShip />
            <IntroCamera onAnimationComplete={handleAnimationComplete} />
            
            {/* Basic lighting */}
            <ambientLight intensity={0.2} />
            <directionalLight 
              position={[100, 100, 50]} 
              intensity={1.5} 
              castShadow 
            />
            
            {/* Environment adds realistic reflections */}
            <Environment preset="night" />
          </Canvas>
        </div>
        
        {/* Title overlay that fades in */}
        <div className={`title-overlay ${showTitle ? 'active' : ''}`}>
          <h1>{title}</h1>
          <p>A space adventure awaits...</p>
        </div>
        
        {skipEnabled && (
          <div className="skip-message">
            Click anywhere to skip
          </div>
        )}
      </div>
    );
  }
  
  // For character selection transition - warp effect with 3D ship
  return (
    <div className="space-scene-container" onClick={handleSkip}>
      {/* 3D Canvas for the warp effect */}
      <div className="warp-scene-3d" style={{ width: '100%', height: '100%' }}>
        <Canvas>
          {/* Dynamic star field for warp effect */}
          <Stars count={3000} />
          
          {/* Centered ship with engine effects */}
          <group position={[0, 0, -10]}>
            <SpaceshipModel scale={3.5} />
          </group>
          
          {/* Camera looking at ship from behind */}
          <PerspectiveCamera
            makeDefault
            position={[0, 2, 5]}
            fov={60}
            near={0.1}
            far={2000}
          />
          
          {/* Basic lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 10, 5]} intensity={1} />
          
          {/* Environment for reflections */}
          <Environment preset="night" />
        </Canvas>
      </div>
      
      {/* Add warp effect overlay */}
      <div className="warp-effect"></div>
      
      {skipEnabled && (
        <div className="skip-message">
          Click anywhere to skip
        </div>
      )}
    </div>
  );
};

export default SpaceTransition;