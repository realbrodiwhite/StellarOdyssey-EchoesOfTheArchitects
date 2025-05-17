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
  
  // Thruster effects
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
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
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
      
      {/* Engine thruster effects */}
      <group ref={thrusterRef} position={[0, 0, 2.5]}>
        {/* Engine glow - yellow point light */}
        <pointLight
          ref={engineGlowRef}
          position={[0, 0, 0]}
          distance={5}
          intensity={1.2}
          color="#ffaa00"
        />
        
        {/* Engine exhaust cone */}
        <mesh position={[0, 0, 1]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.5, 3, 16]} />
          <meshBasicMaterial color="#ffaa44" transparent opacity={0.7} />
        </mesh>
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
const Planet = ({ position = [50, -60, -150] }) => {
  return (
    <mesh position={position}>
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
    const animationDuration = 17; // seconds
    
    const animateCamera = () => {
      time += 0.016; // ~60fps
      
      if (cameraRef.current) {
        // Normalized time from 0 to 1 for the full animation
        const t = Math.min(time / animationDuration, 1);
        
        // Camera flight path
        if (t < 0.3) {
          // Start with a view of the planet
          const startT = t / 0.3;
          cameraRef.current.position.set(
            50 + startT * -30, 
            10 - startT * 10, 
            30 - startT * 60
          );
          cameraRef.current.lookAt(50, -40, -150);
        } else if (t < 0.5) {
          // Transition to spaceship view
          const transT = (t - 0.3) / 0.2;
          cameraRef.current.position.set(
            20 - transT * 30, 
            0, 
            -30 - transT * 40
          );
          cameraRef.current.lookAt(-20 * transT, 0, -150);
        } else if (t < 0.8) {
          // Follow spaceship as it flies
          const shipT = (t - 0.5) / 0.3;
          const shipX = -10 - shipT * 80;
          const shipZ = -70 - shipT * 300;
          
          cameraRef.current.position.set(
            shipX + 15 - shipT * 20, 
            8 - shipT * 5, 
            shipZ + 40 + shipT * 20
          );
          cameraRef.current.lookAt(shipX, 0, shipZ - 10);
        } else {
          // Final camera position focused on distant stars
          const finalT = (t - 0.8) / 0.2;
          cameraRef.current.position.set(
            -95 + finalT * -20, 
            3 - finalT * 3, 
            -40 - finalT * 40
          );
          cameraRef.current.lookAt(-200, 0, -500);
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

// Animated ship for intro
const AnimatedShip = () => {
  const shipRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    let frame: number;
    let time = 0;
    const animationDuration = 17; // seconds
    
    const animateShip = () => {
      time += 0.016; // ~60fps
      
      if (shipRef.current) {
        // Normalized time from 0 to 1 for the full animation
        const t = Math.min(time / animationDuration, 1);
        
        // Ship starts appearing at 30% into the animation
        if (t < 0.3) {
          shipRef.current.visible = false;
        } else {
          shipRef.current.visible = true;
          
          if (t < 0.5) {
            // Ship enters from the right
            const entryT = (t - 0.3) / 0.2;
            shipRef.current.position.set(
              40 - entryT * 50, 
              0, 
              -70
            );
            // Initial slight banking as it enters
            shipRef.current.rotation.set(
              0,
              Math.PI + Math.PI / 8 * (1 - entryT),
              -Math.PI / 16 * (1 - entryT)
            );
          } else if (t < 0.8) {
            // Ship flies through space
            const flyT = (t - 0.5) / 0.3;
            shipRef.current.position.set(
              -10 - flyT * 80, 
              0, 
              -70 - flyT * 300
            );
            // Slight banking for flight dynamics
            const bankAngle = Math.sin(flyT * Math.PI * 2) * Math.PI / 20;
            shipRef.current.rotation.set(
              0,
              Math.PI,
              bankAngle
            );
          } else {
            // Ship accelerates to warp speed
            const warpT = (t - 0.8) / 0.2;
            const eased = 1 - Math.pow(1 - warpT, 3); // Cubic ease out for smoother acceleration
            shipRef.current.position.set(
              -90 - eased * 300, 
              0, 
              -370 - eased * 800
            );
            // Stabilize for warp
            shipRef.current.rotation.set(0, Math.PI, 0);
            
            // Scale down to appear to be getting farther away
            const scale = Math.max(0.5, 1 - eased * 0.6);
            shipRef.current.scale.set(scale * 2.5, scale * 2.5, scale * 2.5);
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
    }, 3000);
    
    // Set timeout to match the total animation duration for a smooth transition
    const animationTimer = setTimeout(() => {
      setIsActive(false);
      onComplete();
    }, 17500);
    
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