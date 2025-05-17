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

// Animated camera for intro with dramatic sequence
const IntroCamera = ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [blackoutPhase, setBlackoutPhase] = useState(false);
  const [awakeningPhase, setAwakeningPhase] = useState(false);
  
  // References for dynamically created elements
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const flashRef = useRef<HTMLDivElement | null>(null);
  
  // Sound effect reference
  const impactSoundRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Initialize impact sound
    impactSoundRef.current = new Audio('/sounds/hit.mp3');
    impactSoundRef.current.volume = 0;
    
    let frame: number;
    let time = 0;
    const animationDuration = 8; // seconds - matches new ship animation duration
    
    // Instead of direct DOM manipulation, we'll track state for overlay effects
    const container = document.querySelector('.intro-scene-3d');
    let blackoutActive = false;
    let flashActive = false;
    
    // Create a function to handle blackout effect
    const setBlackout = (active: boolean) => {
      if (!container) return;
      
      if (active && !blackoutActive) {
        // Add blackout overlay
        const overlay = document.createElement('div');
        overlay.id = 'blackout-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'black';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s';
        overlay.style.zIndex = '100';
        container.appendChild(overlay);
        
        // Trigger fade in
        setTimeout(() => {
          overlay.style.opacity = '1';
        }, 10);
        
        blackoutActive = true;
      } else if (!active && blackoutActive) {
        // Remove blackout overlay
        const overlay = document.getElementById('blackout-overlay');
        if (overlay) {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
          }, 500);
        }
        blackoutActive = false;
      }
    };
    
    // Create a function to handle flash effect
    const triggerFlash = () => {
      if (!container || flashActive) return;
      
      // Add flash overlay
      const flash = document.createElement('div');
      flash.id = 'flash-overlay';
      flash.style.position = 'absolute';
      flash.style.top = '0';
      flash.style.left = '0';
      flash.style.width = '100%';
      flash.style.height = '100%';
      flash.style.backgroundColor = 'white';
      flash.style.opacity = '0';
      flash.style.transition = 'opacity 0.15s';
      flash.style.zIndex = '101';
      container.appendChild(flash);
      
      // Sequence of flashes
      flashActive = true;
      
      // First flash
      setTimeout(() => {
        flash.style.opacity = '1';
        setTimeout(() => {
          flash.style.opacity = '0';
          // Second flash
          setTimeout(() => {
            flash.style.opacity = '0.8';
            setTimeout(() => {
              flash.style.opacity = '0';
              // Clean up
              setTimeout(() => {
                flash.remove();
                flashActive = false;
              }, 500);
            }, 100);
          }, 200);
        }, 150);
      }, 10);
    };
    
    const animateCamera = () => {
      time += 0.016; // ~60fps
      
      if (cameraRef.current) {
        // Normalized time from 0 to 1 for the full animation
        const t = Math.min(time / animationDuration, 1);
        
        // Phase 1: Track ship approach from bottom right (0-40% of animation)
        if (t < 0.4) {
          const startT = t / 0.4;
          const easeIn = Math.pow(startT, 2); // ease-in for smoother transition
          
          // Position: Wide establishing shot to dramatic close-up
          cameraRef.current.position.set(
            30 - easeIn * 30, // X: from right side to center
            25 - easeIn * 15, // Y: from high angle to mid-level
            20 - easeIn * 10  // Z: pull back for dramatic perspective
          );
          
          // Look at ship coming from far bottom right
          const lookX = 50 - easeIn * 50; // Look from far right to center
          const lookY = -30 + easeIn * 30; // Look from bottom to center
          const lookZ = -150 + easeIn * 70; // Look from distance to closer
          cameraRef.current.lookAt(lookX, lookY, lookZ);
          
          // Apply a subtle field of view change for dramatic effect
          cameraRef.current.fov = 65 - easeIn * 5;
          cameraRef.current.updateProjectionMatrix();
        } 
        // Phase 2: Lock onto ship as it cruises (40-60% of animation)
        else if (t < 0.6) {
          const cruiseT = (t - 0.4) / 0.2;
          
          // Subtle tracking movement, slightly from side for cinematic feel
          const xOffset = Math.cos(cruiseT * Math.PI) * 1.5;
          const yOffset = Math.sin(cruiseT * Math.PI * 2) * 0.5;
          
          cameraRef.current.position.set(
            xOffset, // subtle left-right tracking
            10 + yOffset, // maintain height with subtle movement
            5 // slightly behind for dramatic composition
          );
          
          // Keep looking at ship with slight lead
          cameraRef.current.lookAt(xOffset * 0.5, yOffset * 0.5, -80);
          
          // Subtle zoom for tension building
          cameraRef.current.fov = 60 - cruiseT * 3;
          cameraRef.current.updateProjectionMatrix();
        } 
        // Phase 3: Dramatic acceleration and warp (60-80% of animation)
        else if (t < 0.8) {
          const warpT = (t - 0.6) / 0.2;
          const accelCurve = Math.pow(warpT, 3); // dramatic acceleration curve
          
          // Position: Quick move from behind to chase position
          const xPos = -accelCurve * 300; // ship accelerates left extremely fast
          
          // Camera tries to keep up but falls behind dramatically
          cameraRef.current.position.set(
            xPos + 80 + warpT * 150, // falling behind with increasing distance
            10 - accelCurve * 5, // slight dip as if pulled by acceleration
            5 + warpT * 20 // pulling back to show speed
          );
          
          // Look ahead of ship, struggling to keep up
          cameraRef.current.lookAt(xPos - 100 * accelCurve, 0, -80 - accelCurve * 100);
          
          // Increase field of view to enhance speed sensation
          cameraRef.current.fov = 60 + accelCurve * 20;
          cameraRef.current.updateProjectionMatrix();
          
          // Start blackout transition at end of phase
          if (warpT > 0.8 && !blackoutPhase) {
            setBlackoutPhase(true);
            if (overlayRef.current) {
              overlayRef.current.style.opacity = '1';
            }
          }
        } 
        // Phase 4: Blackout and awakening (80-100% of animation)
        else {
          const awakeningT = (t - 0.8) / 0.2;
          
          // Move camera to simulate first-person view of pilot
          cameraRef.current.position.set(0, 0, 0);
          cameraRef.current.lookAt(0, 0, -1);
          
          // Add camera shake during blackout for impact effect
          if (awakeningT > 0.5 && !awakeningPhase) {
            setAwakeningPhase(true);
            
            // Simulate ship impact/docking
            if (impactSoundRef.current) {
              impactSoundRef.current.volume = 0.8;
              impactSoundRef.current.play().catch(e => console.log("Impact sound prevented:", e));
            }
            
            // Camera shake effect
            const shake = () => {
              if (cameraRef.current) {
                cameraRef.current.position.set(
                  (Math.random() - 0.5) * 2,
                  (Math.random() - 0.5) * 2,
                  (Math.random() - 0.5) * 2
                );
              }
            };
            
            // Execute multiple shakes
            shake();
            setTimeout(shake, 100);
            setTimeout(shake, 200);
            setTimeout(shake, 300);
            
            // Flash effect for "eyes opening"
            if (flashRef.current) {
              flashRef.current.style.opacity = '1';
              setTimeout(() => {
                if (flashRef.current) flashRef.current.style.opacity = '0';
              }, 150);
              
              // Second flash
              setTimeout(() => {
                if (flashRef.current) flashRef.current.style.opacity = '0.8';
                setTimeout(() => {
                  if (flashRef.current) flashRef.current.style.opacity = '0';
                }, 100);
              }, 350);
            }
          }
        }
      }
      
      // Complete animation
      if (time >= animationDuration) {
        // Clean up overlay elements
        if (overlayRef.current) {
          overlayRef.current.remove();
        }
        if (flashRef.current) {
          flashRef.current.remove();
        }
        
        cancelAnimationFrame(frame);
        onAnimationComplete();
        return;
      }
      
      frame = requestAnimationFrame(animateCamera);
    };
    
    animateCamera();
    
    return () => {
      cancelAnimationFrame(frame);
      
      // Clean up overlay elements
      if (overlayRef.current) {
        overlayRef.current.remove();
      }
      if (flashRef.current) {
        flashRef.current.remove();
      }
      
      // Clean up audio
      if (impactSoundRef.current) {
        impactSoundRef.current.pause();
        impactSoundRef.current.currentTime = 0;
      }
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

// Animated ship for intro - detailed dramatic animation sequence
const AnimatedShip = () => {
  const shipRef = useRef<THREE.Group>(null);
  const [shipWarpComplete, setShipWarpComplete] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Initialize audio for dramatic effect
    audioRef.current = new Audio('/sounds/background.mp3');
    audioRef.current.volume = 0;
    
    let frame: number;
    let time = 0;
    const animationDuration = 8; // full animation duration
    
    const animateShip = () => {
      time += 0.016; // ~60fps
      
      if (shipRef.current) {
        // Normalized time from 0 to 1 for the full animation
        const t = Math.min(time / animationDuration, 1);
        
        // Ship is visible throughout the animation
        shipRef.current.visible = true;
        
        // Phase 1: Ship flies in from bottom right (0-40% of animation)
        if (t < 0.4) {
          const entryT = t / 0.4; // normalized 0-1 for this phase
          const easeIn = Math.pow(entryT, 2); // ease-in for smoother start
          
          // Position: dramatically from far bottom right to center
          shipRef.current.position.set(
            80 - easeIn * 80, // X: from far right (80) to center (0)
            -50 + easeIn * 50, // Y: from way bottom (-50) to center (0)
            -150 + easeIn * 70 // Z: approaching viewer significantly for dramatic effect
          );
          
          // Rotation: dramatic banking as it enters
          shipRef.current.rotation.set(
            Math.PI / 8 * (1 - easeIn), // more pronounced pitch adjustment
            Math.PI + Math.PI / 6 * (1 - easeIn), // more dramatic turning toward center
            Math.PI / 8 * (1 - easeIn) // more dramatic banking
          );
          
          // Scale: much more dramatic increase from tiny to large to simulate approaching from distance
          const startScale = 0.2; // Start much smaller
          const endScale = 2.5;
          const scaleProgression = easeIn < 0.5 ? 
            2 * easeIn * easeIn : // accelerate scale in first half
            -1 + (4 - 2 * easeIn) * easeIn; // decelerate scale in second half
          const currentScale = startScale + scaleProgression * (endScale - startScale);
          shipRef.current.scale.set(currentScale, currentScale, currentScale);
          
          // Start fading in the audio
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio playback prevented:", e));
            audioRef.current.volume = Math.min(entryT * 0.3, 0.3); // Fade in, but keep low
          }
        } 
        // Phase 2: Ship cruises in center briefly (40-60% of animation)
        else if (t < 0.6) {
          const hoverT = (t - 0.4) / 0.2;
          
          // Subtle movement to show it's cruising
          const driftX = Math.sin(hoverT * Math.PI) * 0.8; // gentle side-to-side
          const driftY = Math.cos(hoverT * Math.PI * 2) * 0.3; // subtle up-down
          
          shipRef.current.position.set(
            driftX, // gentle cruising movement
            driftY, 
            -80 // maintain distance
          );
          
          // Ship aligns to forward position ready for warp
          const alignmentFactor = Math.pow(hoverT, 0.5);
          shipRef.current.rotation.set(
            0, // level out
            Math.PI, // face forward
            0  // level out
          );
          
          // Maintain scale
          shipRef.current.scale.set(2.5, 2.5, 2.5);
          
          // Maintain audio
          if (audioRef.current) {
            audioRef.current.volume = 0.3;
          }
        } 
        // Phase 3: Ship zooms off to the left at incredible speed (60-80% of animation)
        else if (t < 0.8) {
          const warpT = (t - 0.6) / 0.2; // normalized 0-1 for this phase
          
          // Exponential acceleration for dramatic effect
          const acceleration = Math.pow(warpT, 4); // extremely rapid acceleration
          
          // Position: extremely rapid acceleration to the left
          shipRef.current.position.set(
            -acceleration * 500, // X: much faster acceleration left
            0, // Y: maintain height
            -80 - acceleration * 100 // Z: more dramatic movement away
          );
          
          // Rotation: steady as it warps
          shipRef.current.rotation.set(
            0,
            Math.PI, // maintain forward orientation
            0
          );
          
          // Scale with stretch effect for warp
          const stretchFactor = 1 + acceleration * 3.5; // more extreme stretching
          shipRef.current.scale.set(2.5, 2.5, 2.5 * stretchFactor);
          
          // Audio swells dramatically during warp
          if (audioRef.current) {
            audioRef.current.volume = 0.3 + warpT * 0.5; // Increase volume dramatically
          }
          
          // Signal warp completion near end of phase
          if (warpT > 0.9 && !shipWarpComplete) {
            setShipWarpComplete(true);
          }
        } 
        // Phase 4: Black screen, audio continues/intensifies (80-100% of animation)
        else {
          const fadeT = (t - 0.8) / 0.2;
          
          // Ship moves completely offscreen
          shipRef.current.position.set(-1000, 0, -1000);
          shipRef.current.visible = false;
          
          // Audio continues to build to peak
          if (audioRef.current) {
            // Peak volume followed by fade out
            if (fadeT < 0.5) {
              audioRef.current.volume = 0.8; // Peak volume
            } else {
              audioRef.current.volume = 0.8 * (1 - (fadeT - 0.5) * 2); // Fade out
            }
          }
        }
      }
      
      // Continue animation as long as needed
      if (time < animationDuration) {
        frame = requestAnimationFrame(animateShip);
      } else {
        // Ensure audio is stopped at end of animation
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      }
    };
    
    animateShip();
    
    return () => {
      cancelAnimationFrame(frame);
      // Clean up audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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