import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/lib/stores/useAudio";
import { useGame } from "@/lib/stores/useGame";
import { useCharacter } from "@/lib/stores/useCharacter";
import SaveLoadMenu from "./SaveLoadMenu";
import Settings from "./Settings";

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu = ({ onStart }: MainMenuProps) => {
  const { toggleMute, isMuted } = useAudio();
  const { start } = useGame();
  const { character, resetCharacter } = useCharacter();
  const [showContinue, setShowContinue] = useState(false);
  const [showSaveLoadMenu, setShowSaveLoadMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeButton, setActiveButton] = useState('newGame');
  
  // Check if there's a saved character to show load game option
  useEffect(() => {
    setShowContinue(character && character.id !== '');
  }, [character]);
  
  useEffect(() => {
    // Load audio on component mount
    const backgroundMusic = new Audio('/sounds/background.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    
    const hitSound = new Audio('/sounds/hit.mp3');
    const successSound = new Audio('/sounds/success.mp3');
    
    // Load emergency encounter sounds
    const alarmSound = new Audio('/sounds/alarm.mp3');
    const explosionSound = new Audio('/sounds/explosion.mp3');
    
    // Store audio in state management
    const { 
      setBackgroundMusic, 
      setHitSound, 
      setSuccessSound,
      setAlarmSound,
      setExplosionSound 
    } = useAudio.getState();
    
    setBackgroundMusic(backgroundMusic);
    setHitSound(hitSound);
    setSuccessSound(successSound);
    setAlarmSound(alarmSound);
    setExplosionSound(explosionSound);
    
    console.log("Audio files loaded");
  }, []);
  
  const handleNewGame = () => {
    console.log("New Game button clicked");
    resetCharacter(); // Reset any existing character
    // Play success sound for feedback
    const { playSuccess } = useAudio.getState();
    playSuccess();
    onStart(); // Navigate to character selection
  };
  
  const handleLoadGame = () => {
    console.log("Load Game button clicked");
    setShowSaveLoadMenu(true);
  };

  // Create stars for background animation
  const renderStars = () => {
    return [...Array(Math.min(120, Math.max(40, Math.floor(window.innerWidth / 10))))].map((_, i) => (
      <div
        key={i}
        className="absolute bg-white rounded-full"
        style={{
          width: `${Math.min(3, Math.max(1, window.innerWidth / 800))}px`,
          height: `${Math.min(3, Math.max(1, window.innerWidth / 800))}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          opacity: Math.random() * 0.8 + 0.2,
          animation: `twinkle ${Math.random() * 5 + 3}s infinite`
        }}
      />
    ));
  };

  // Generate shooting stars animation
  const renderShootingStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="shooting-star"
        style={{
          height: `${Math.random() * 40 + 20}px`,
          left: `${Math.random() * 80}%`,
          top: `${Math.random() * 40}%`,
          animationDelay: `${Math.random() * 10 + i * 3}s`,
          animationDuration: `${Math.random() * 2 + 1}s`,
        }}
      />
    ));
  };
  
  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Stars background with rotation - responsive based on viewport size */}
      <div className="absolute inset-0 z-0 star-field-container">
        <div className="rotating-star-field">
          {renderStars()}
          {renderShootingStars()}
        </div>
      </div>
      
      {/* Ultra-realistic Earth with millions of moon debris pieces forming rings - integrated with star rotation */}
      <div className="absolute z-5 earth-container" style={{ 
        bottom: "35vh",
        left: "28%", 
        transform: "translateX(-50%)",
        width: "25vh",
        height: "25vh",
        opacity: 1,
        filter: "drop-shadow(0 0 18px rgba(120,180,255,0.4))"
      }}>
        {/* Moon debris ring system - outer sparse ring */}
        <div className="absolute moon-ring ring-outer" style={{
          top: "50%",
          left: "50%",
          width: "160%",
          height: "160%",
          borderRadius: "50%",
          border: "1px solid rgba(200, 200, 210, 0.15)",
          transform: "translate(-50%, -50%) rotate(2deg)",
          overflow: "visible",
          animation: "ring-rotate 240s linear infinite"
        }}></div>
        
        {/* Moon debris ring system - main dense ring with particle effects */}
        <div className="absolute moon-ring ring-main" style={{
          top: "50%",
          left: "50%",
          width: "140%",
          height: "140%",
          borderRadius: "50%",
          border: "3px solid rgba(180, 180, 200, 0.25)",
          boxShadow: "0 0 8px rgba(200, 200, 220, 0.1), inset 0 0 12px rgba(200, 200, 220, 0.1)",
          transform: "translate(-50%, -50%) rotate(0deg)",
          overflow: "visible",
          animation: "ring-rotate 180s linear infinite",
          position: "relative"
        }}>
          {/* Ring particles - main dense ring */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={`main-particle-${i}`}
              className="absolute ring-particle" 
              style={{
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                background: `rgba(${200 + Math.random() * 55}, ${200 + Math.random() * 55}, ${220 + Math.random() * 35}, ${0.5 + Math.random() * 0.5})`,
                boxShadow: `0 0 ${Math.random() * 3}px rgba(255, 255, 255, 0.8)`,
                borderRadius: "50%",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
        
        {/* Moon debris ring system - inner ring with particles */}
        <div className="absolute moon-ring ring-inner" style={{
          top: "50%",
          left: "50%",
          width: "130%",
          height: "130%",
          borderRadius: "50%",
          border: "2px solid rgba(220, 220, 235, 0.2)",
          boxShadow: "0 0 5px rgba(220, 220, 235, 0.12)",
          transform: "translate(-50%, -50%) rotate(-1deg)",
          overflow: "visible",
          animation: "ring-rotate-reverse 210s linear infinite",
          position: "relative"
        }}>
          {/* Ring particles - inner ring */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div 
              key={`inner-particle-${i}`}
              className="absolute ring-particle" 
              style={{
                width: `${Math.random() * 1.5 + 0.7}px`,
                height: `${Math.random() * 1.5 + 0.7}px`,
                background: `rgba(${220 + Math.random() * 35}, ${220 + Math.random() * 35}, ${235 + Math.random() * 20}, ${0.6 + Math.random() * 0.4})`,
                boxShadow: `0 0 ${Math.random() * 2}px rgba(255, 255, 255, 0.9)`,
                borderRadius: "50%",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                transform: `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
        
        {/* Some larger debris fragments */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={`large-debris-${i}`}
            className="absolute moon-debris" 
            style={{
              width: `${Math.random() * 3 + 2}px`,
              height: `${Math.random() * 3 + 2}px`,
              background: `rgba(${180 + Math.random() * 75}, ${180 + Math.random() * 75}, ${200 + Math.random() * 55}, ${0.7 + Math.random() * 0.3})`,
              boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(255, 255, 255, 0.8)`,
              borderRadius: "50%",
              top: `${15 + Math.random() * 70}%`,
              left: `${15 + Math.random() * 70}%`,
              transform: `translate(-50%, -50%) scale(${0.8 + Math.random() * 0.4})`,
              animation: `float ${10 + Math.random() * 20}s infinite linear`
            }}
          />
        ))}
        {/* High-detail realistic Earth body with 8K-like photo-realistic textures - now with darker nighttime appearance */}
        <div className="absolute rounded-full overflow-hidden" style={{ 
          width: "100%", 
          height: "100%",
          background: "radial-gradient(circle at 35% 35%, #1a5b8e 0%, #0b4265 20%, #063143 45%, #05233e 70%, #021221 100%)",
          boxShadow: "inset -8px -8px 15px rgba(0,0,0,0.9), 0 0 12px rgba(80,140,200,0.4)",
          transform: "rotate(-23.5deg)", // Earth's axial tilt
          position: "relative"
        }}>
          {/* Deep ocean texture with enhanced depth variations - darker for night side */}
          <div className="absolute" style={{
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at 40% 40%, #14395c 0%, #0c2e4a 30%, #072030 65%, #021220 100%)",
            opacity: 0.98
          }}></div>
          
          {/* Night side city lights layer - visible in the dark areas */}
          <div className="absolute" style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, transparent 30%, rgba(0,0,0,0.8) 70%)",
            opacity: 0.8
          }}></div>
          
          {/* North America city lights - concentrated along coastlines and major population centers */}
          <div className="absolute city-lights north-america" style={{
            top: "20%",
            left: "27%",
            width: "22%",
            height: "18%",
            backgroundImage: `radial-gradient(1px 1px at 85% 20%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 75% 25%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 65% 30%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 60% 40%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 55% 50%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(2px 2px at 45% 45%, rgba(255, 240, 180, 0.9) 100%, transparent),
                             radial-gradient(2px 2px at 40% 35%, rgba(255, 240, 180, 0.9) 100%, transparent),
                             radial-gradient(2px 2px at 30% 30%, rgba(255, 240, 180, 0.9) 100%, transparent)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px)",
            opacity: 0.85,
            transform: "rotate(-10deg)"
          }}></div>

          {/* Europe city lights - densely populated areas */}
          <div className="absolute city-lights europe" style={{
            top: "23%",
            left: "54%",
            width: "12%",
            height: "8%",
            backgroundImage: `radial-gradient(1px 1px at 20% 40%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 30% 50%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 40% 60%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 50% 50%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 60% 40%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 70% 30%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 80% 40%, rgba(255, 240, 180, 0.8) 100%, transparent)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px)",
            opacity: 0.85,
            transform: "rotate(5deg)"
          }}></div>

          {/* Asia city lights - major urban centers in East Asia */}
          <div className="absolute city-lights asia" style={{
            top: "28%",
            left: "78%",
            width: "16%",
            height: "15%",
            backgroundImage: `radial-gradient(1px 1px at 30% 40%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 40% 50%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 25% 60%, rgba(255, 240, 180, 0.9) 100%, transparent),
                             radial-gradient(2px 2px at 35% 50%, rgba(255, 240, 180, 0.9) 100%, transparent),
                             radial-gradient(1px 1px at 40% 30%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 45% 35%, rgba(255, 240, 180, 0.8) 100%, transparent)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px)",
            opacity: 0.85,
            transform: "rotate(15deg)"
          }}></div>

          {/* South America city lights - coastal cities */}
          <div className="absolute city-lights south-america" style={{
            top: "50%",
            left: "36%",
            width: "12%",
            height: "15%",
            backgroundImage: `radial-gradient(1px 1px at 20% 20%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 30% 30%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 15% 50%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 80% 70%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 90% 80%, rgba(255, 240, 180, 0.8) 100%, transparent)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px)",
            opacity: 0.8,
            transform: "rotate(10deg)"
          }}></div>

          {/* Africa city lights - less dense, concentrated on coasts and major cities */}
          <div className="absolute city-lights africa" style={{
            top: "42%",
            left: "57%",
            width: "14%",
            height: "20%",
            backgroundImage: `radial-gradient(1px 1px at 10% 20%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 20% 40%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 80% 50%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 90% 70%, rgba(255, 240, 180, 0.8) 100%, transparent)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px)",
            opacity: 0.8,
            transform: "rotate(-5deg)"
          }}></div>

          {/* Australia city lights - coastal concentration */}
          <div className="absolute city-lights australia" style={{
            top: "62%",
            left: "78%",
            width: "10%",
            height: "10%",
            backgroundImage: `radial-gradient(1px 1px at 10% 50%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 30% 80%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 80% 90%, rgba(255, 240, 180, 0.8) 100%, transparent),
                             radial-gradient(1px 1px at 90% 70%, rgba(255, 240, 180, 0.8) 100%, transparent)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(1px)",
            opacity: 0.8
          }}></div>
          
          {/* Global city lights glow effect - creates a subtle ambient glow on the night side */}
          <div className="absolute" style={{
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at 70% 50%, transparent 50%, rgba(255, 240, 180, 0.05) 80%, rgba(255, 240, 180, 0.1) 100%)",
            filter: "blur(8px)",
            opacity: 0.7,
            mixBlendMode: "screen"
          }}></div>
          
          {/* Detailed land mass texture base layer */}
          <div className="absolute" style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200' preserveAspectRatio='none'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
            opacity: 0.9
          }}></div>
          
          {/* North America - highly detailed shape */}
          <div className="absolute" style={{
            top: "18%",
            left: "22%",
            width: "28%",
            height: "22%",
            background: "rgba(40,75,35,0.7)",
            clipPath: "polygon(10% 0%, 30% 5%, 50% 0%, 70% 5%, 85% 15%, 95% 30%, 100% 45%, 90% 60%, 80% 75%, 70% 85%, 55% 95%, 40% 100%, 25% 90%, 15% 75%, 5% 60%, 0% 40%, 5% 20%)",
            boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.1)",
            opacity: 0.8
          }}>
            {/* North America texture detail */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.7
            }}></div>
          </div>
          
          {/* South America - highly detailed shape */}
          <div className="absolute" style={{
            top: "42%",
            left: "35%",
            width: "15%",
            height: "25%",
            background: "rgba(50,90,40,0.7)",
            clipPath: "polygon(30% 0%, 60% 5%, 80% 15%, 100% 30%, 95% 50%, 90% 70%, 75% 85%, 60% 100%, 40% 95%, 20% 85%, 0% 70%, 5% 40%, 15% 20%)",
            boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.1)",
            opacity: 0.8
          }}>
            {/* South America texture detail */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.7
            }}></div>
          </div>
          
          {/* Europe - highly detailed shape */}
          <div className="absolute" style={{
            top: "22%",
            left: "52%",
            width: "13%",
            height: "12%",
            background: "rgba(45,85,40,0.7)",
            clipPath: "polygon(0% 20%, 20% 0%, 40% 5%, 65% 15%, 85% 10%, 100% 30%, 90% 50%, 80% 70%, 60% 85%, 40% 100%, 20% 90%, 5% 60%)",
            boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.1)",
            opacity: 0.8
          }}>
            {/* Europe texture detail */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.7
            }}></div>
          </div>
          
          {/* Africa - highly detailed shape */}
          <div className="absolute" style={{
            top: "35%",
            left: "54%",
            width: "20%",
            height: "28%",
            background: "rgba(80,65,40,0.7)",
            clipPath: "polygon(20% 0%, 50% 5%, 80% 0%, 100% 20%, 90% 40%, 95% 60%, 85% 80%, 65% 100%, 45% 95%, 25% 85%, 10% 65%, 0% 40%, 5% 20%)",
            boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.1)",
            opacity: 0.8
          }}>
            {/* Africa texture detail */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.7
            }}></div>
          </div>
          
          {/* Asia - highly detailed shape */}
          <div className="absolute" style={{
            top: "18%",
            left: "65%",
            width: "28%",
            height: "26%",
            background: "rgba(55,85,45,0.7)",
            clipPath: "polygon(0% 35%, 10% 15%, 25% 0%, 50% 5%, 70% 15%, 90% 10%, 100% 30%, 95% 50%, 85% 70%, 70% 85%, 50% 100%, 30% 85%, 10% 65%)",
            boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.1)",
            opacity: 0.8
          }}>
            {/* Asia texture detail */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.7
            }}></div>
          </div>
          
          {/* Australia - highly detailed shape */}
          <div className="absolute" style={{
            top: "60%",
            left: "75%",
            width: "14%",
            height: "14%",
            background: "rgba(95,75,45,0.7)",
            clipPath: "polygon(15% 0%, 40% 5%, 65% 0%, 90% 15%, 100% 40%, 90% 65%, 75% 85%, 50% 100%, 25% 90%, 10% 70%, 0% 40%, 5% 20%)",
            boxShadow: "inset 1px 1px 3px rgba(255,255,255,0.1)",
            opacity: 0.8
          }}>
            {/* Australia texture detail */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.7
            }}></div>
          </div>
          
          {/* Antarctica - more realistic ice coverage with gradual blending */}
          <div className="absolute" style={{
            bottom: "0%",
            left: "15%",
            width: "70%",
            height: "25%",
            background: "radial-gradient(ellipse at center, rgba(220,240,255,0.7) 0%, rgba(210,230,250,0.5) 40%, rgba(200,220,240,0.3) 70%, rgba(190,210,230,0.1) 90%, transparent 100%)",
            transform: "perspective(500px) rotateX(-40deg)",
            opacity: 0.7,
            filter: "blur(1px)"
          }}>
            {/* Antarctica ice texture - more natural */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.5
            }}></div>
          </div>
          
          {/* Arctic ice cap - more natural coverage and blending */}
          <div className="absolute" style={{
            top: "0%",
            left: "20%",
            width: "60%",
            height: "20%",
            background: "radial-gradient(ellipse at center, rgba(220,240,255,0.7) 0%, rgba(210,230,250,0.5) 40%, rgba(200,220,240,0.3) 70%, rgba(190,210,230,0.1) 90%, transparent 100%)",
            transform: "perspective(500px) rotateX(40deg)",
            opacity: 0.7,
            filter: "blur(1px)"
          }}>
            {/* Arctic ice texture - more natural */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
              opacity: 0.5
            }}></div>
          </div>
          
          {/* Atmospheric glow effect - creates a visible atmosphere around the planet */}
          <div className="absolute" style={{
            top: "-5%",
            left: "-5%",
            width: "110%",
            height: "110%",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, transparent 60%, rgba(100,150,230,0.1) 75%, rgba(100,150,230,0.2) 85%, rgba(100,150,230,0.1) 95%, transparent 100%)",
            filter: "blur(4px)",
            opacity: 0.8
          }}></div>
          
          {/* Realistic cloud systems - low pressure systems */}
          <div className="absolute" style={{
            top: "15%",
            left: "15%", 
            width: "40%",
            height: "15%",
            background: "rgba(200,200,220,0.25)",
            clipPath: "url(#cloud-path-1)",
            filter: "blur(2px)",
            opacity: 0.7,
            animation: "cloudDrift1 120s linear infinite"
          }}>
            <svg width="0" height="0">
              <defs>
                <clipPath id="cloud-path-1">
                  <path d="M10,50 Q20,20 40,30 Q60,5 80,20 Q95,10 100,40 Q85,65 60,60 Q40,80 20,65 Q5,70 10,50 Z"></path>
                </clipPath>
              </defs>
            </svg>
            {/* Cloud texture */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              opacity: 0.6
            }}></div>
          </div>
          
          {/* Realistic cloud systems - high altitude cirrus */}
          <div className="absolute" style={{
            top: "30%",
            left: "45%", 
            width: "35%",
            height: "15%",
            background: "rgba(200,200,220,0.2)",
            clipPath: "url(#cloud-path-2)",
            filter: "blur(2px)",
            opacity: 0.6,
            animation: "cloudDrift2 150s linear infinite"
          }}>
            <svg width="0" height="0">
              <defs>
                <clipPath id="cloud-path-2">
                  <path d="M5,40 Q15,20 35,30 Q55,10 75,25 Q90,15 95,35 Q80,50 60,45 Q40,65 20,55 Q5,60 5,40 Z"></path>
                </clipPath>
              </defs>
            </svg>
            {/* Cloud texture */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              opacity: 0.6
            }}></div>
          </div>
          
          {/* Realistic cloud systems - storm system */}
          <div className="absolute" style={{
            top: "60%",
            left: "30%", 
            width: "45%",
            height: "18%",
            background: "rgba(200,200,220,0.25)",
            clipPath: "url(#cloud-path-3)",
            filter: "blur(2px)",
            opacity: 0.7,
            animation: "cloudDrift3 140s linear infinite"
          }}>
            <svg width="0" height="0">
              <defs>
                <clipPath id="cloud-path-3">
                  <path d="M15,45 Q25,15 45,25 Q70,5 85,25 Q100,15 100,45 Q85,70 65,60 Q45,80 25,65 Q5,75 15,45 Z"></path>
                </clipPath>
              </defs>
            </svg>
            {/* Cloud texture */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              opacity: 0.6
            }}></div>
          </div>
          
          {/* Realistic cloud systems - thin wispy clouds */}
          <div className="absolute" style={{
            top: "10%",
            left: "60%", 
            width: "30%",
            height: "12%",
            background: "rgba(200,200,220,0.15)",
            clipPath: "url(#cloud-path-4)",
            filter: "blur(1px)",
            opacity: 0.5,
            animation: "cloudDrift4 160s linear infinite"
          }}>
            <svg width="0" height="0">
              <defs>
                <clipPath id="cloud-path-4">
                  <path d="M5,30 Q25,10 45,25 Q65,5 85,15 Q95,35 75,45 Q55,25 35,45 Q15,35 5,30 Z"></path>
                </clipPath>
              </defs>
            </svg>
            {/* Cloud texture */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
              opacity: 0.5
            }}></div>
          </div>
          
          {/* Sunset highlight on one edge - more detailed with glow */}
          <div className="absolute" style={{
            width: "100%", 
            height: "100%",
            background: "linear-gradient(130deg, rgba(255,140,80,0.2) 0%, rgba(255,140,80,0.1) 15%, transparent 30%)",
            borderRadius: "50%"
          }}></div>
          
          {/* Atmospheric refraction effect at edges */}
          <div className="absolute" style={{
            width: "103%", 
            height: "103%",
            top: "-1.5%",
            left: "-1.5%",
            background: "radial-gradient(circle at center, transparent 85%, rgba(120,180,255,0.2) 95%, rgba(140,200,255,0.3) 100%)",
            borderRadius: "50%",
            filter: "blur(1px)"
          }}></div>
          
          {/* Realistic atmospheric glow - multi-layered for depth */}
          <div className="absolute" style={{
            width: "125%", 
            height: "125%",
            top: "-12.5%",
            left: "-12.5%",
            background: "radial-gradient(circle at center, transparent 60%, rgba(80,130,200,0.05) 75%, rgba(90,140,200,0.1) 85%, rgba(100,150,210,0.15) 95%, rgba(80,130,200,0.05) 100%)",
            borderRadius: "50%",
            opacity: 0.9
          }}></div>
          
          {/* Outer atmospheric glow for realism */}
          <div className="absolute" style={{
            width: "150%", 
            height: "150%",
            top: "-25%",
            left: "-25%",
            background: "radial-gradient(circle at center, transparent 75%, rgba(60,110,180,0.03) 85%, rgba(70,120,190,0.06) 95%, rgba(50,100,170,0.02) 100%)",
            borderRadius: "50%",
            opacity: 0.7
          }}></div>
        </div>
        
        {/* Dense outer ring with clear orbital structure - first major debris ring */}
        <div className="absolute" style={{
          width: "300%",
          height: "4.2vh",
          top: "52%",
          left: "-100%",
          transform: "translateY(-50%) rotate(2deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.9,
          filter: "drop-shadow(0 0 6px rgba(100,120,200,0.1))"
        }}>
          {/* High-detail debris field base with higher density */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(160,165,185,0.3) 25%, rgba(195,200,215,0.65) 50%, rgba(160,165,185,0.3) 75%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 8px rgba(180,190,230,0.2)"
          }}></div>
          
          {/* Intricate debris texture overlay for enhanced realism */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='100' viewBox='0 0 400 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.1'/%3E%3C/svg%3E")`,
            opacity: 0.7
          }}></div>
          
          {/* Complex dust pattern to simulate millions of tiny particles */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Cfilter id='starfield'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 9 -4 0 0 0 9 -4 0 0 0 9 -4 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23starfield)' opacity='0.3'/%3E%3C/svg%3E")`,
            opacity: 0.4
          }}></div>
          
          {/* Larger debris particles in outer ring - precisely positioned */}
          <div className="absolute w-full h-full">
            {Array.from({ length: 80 }).map((_, i) => (
              <div 
                key={`outer-debris-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 0.35 + 0.1}vh`,
                  height: `${Math.random() * 0.35 + 0.1}vh`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.5 + Math.random() * 0.3,
                  background: `rgba(${170 + Math.floor(Math.random() * 20)},${170 + Math.floor(Math.random() * 20)},${190 + Math.floor(Math.random() * 20)},0.7)`,
                  boxShadow: `0 0 ${Math.random() * 2 + 1}px rgba(200,200,255,0.3)`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Second middle ring with significant gap from outer ring - clearly distinct */}
        <div className="absolute" style={{
          width: "230%",
          height: "3.8vh",
          top: "44%",
          left: "-65%",
          transform: "translateY(-50%) rotate(-1deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.85,
          filter: "drop-shadow(0 0 5px rgba(100,120,200,0.08))"
        }}>
          {/* Different density and coloration from outer ring */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(160,170,190,0.25) 30%, rgba(190,200,220,0.5) 50%, rgba(160,170,190,0.25) 70%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 7px rgba(180,190,230,0.12)"
          }}></div>
          
          {/* Complex dust pattern with radial distribution */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Cfilter id='dustfield'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 9 -4 0 0 0 9 -4 0 0 0 9 -4 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23dustfield)' opacity='0.2'/%3E%3C/svg%3E")`,
            opacity: 0.5
          }}></div>
          
          {/* Sunset highlight creating realistic light refraction on particles */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 35%, rgba(255,160,100,0.15) 50%, rgba(0,0,0,0) 65%)",
            mixBlendMode: "color-dodge"
          }}></div>
          
          {/* Precision-placed debris particles in middle ring with variation */}
          <div className="absolute w-full h-full">
            {Array.from({ length: 100 }).map((_, i) => (
              <div 
                key={`middle-debris-${i}`}
                className="absolute"
                style={{
                  width: `${Math.random() * 0.3 + 0.05}vh`,
                  height: `${Math.random() * 0.3 + 0.05}vh`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.6 + Math.random() * 0.3,
                  background: `rgba(${170 + Math.floor(Math.random() * 20)},${170 + Math.floor(Math.random() * 20)},${190 + Math.floor(Math.random() * 20)},0.75)`,
                  boxShadow: `0 0 ${Math.random() * 2 + 1}px rgba(200,200,255,0.25)`,
                  borderRadius: Math.random() > 0.3 ? '50%' : `${Math.random() * 50 + 20}% ${Math.random() * 50 + 20}% ${Math.random() * 50 + 20}% ${Math.random() * 50 + 20}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Third separate inner ring - highly concentrated dense core */}
        <div className="absolute" style={{
          width: "140%",
          height: "5.5vh",
          top: "39%",
          left: "-20%",
          transform: "translateY(-50%) rotate(1deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.92,
          filter: "drop-shadow(0 0 4px rgba(100,120,200,0.1))"
        }}>
          {/* High-concentration core with distinctive bright appearance */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(180,185,205,0.5) 30%, rgba(210,215,235,0.8) 50%, rgba(180,185,205,0.5) 70%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 10px rgba(200,210,240,0.25)"
          }}></div>
          
          {/* Fine dust texture for incredible detail */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100' viewBox='0 0 200 100'%3E%3Cfilter id='finedust'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 9 -4 0 0 0 9 -4 0 0 0 9 -4 0 0 0 0 1'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23finedust)' opacity='0.25'/%3E%3C/svg%3E")`,
            opacity: 0.6
          }}></div>
          
          {/* Micro-debris particles in inner ring - ultra high detail */}
          <div className="absolute w-full h-full">
            {Array.from({ length: 120 }).map((_, i) => (
              <div 
                key={`inner-debris-${i}`}
                className="absolute"
                style={{
                  width: `${Math.random() * 0.25 + 0.05}vh`,
                  height: `${Math.random() * 0.25 + 0.05}vh`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.7 + Math.random() * 0.25,
                  background: `rgba(${180 + Math.floor(Math.random() * 20)},${180 + Math.floor(Math.random() * 20)},${200 + Math.floor(Math.random() * 20)},0.8)`,
                  boxShadow: `0 0 ${Math.random() * 1.5 + 0.5}px rgba(200,200,255,0.3)`,
                  borderRadius: Math.random() > 0.4 ? '50%' : `${Math.random() * 50 + 30}% ${Math.random() * 50 + 30}% ${Math.random() * 50 + 30}% ${Math.random() * 50 + 30}%`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Photorealistic moon fragments with detailed surface textures and shadows */}
        {/* Large irregular moon fragment with cratered surface */}
        <div className="absolute" style={{ 
          width: "4.5%", 
          height: "4.5%", 
          top: "48%", 
          left: "-38%", 
          opacity: 0.85, 
          background: "radial-gradient(circle at 40% 40%, #6e7073 20%, #52555a 50%, #3a3c42 80%)",
          boxShadow: "inset -1px -1px 3px rgba(0,0,0,0.6), 0 0 4px rgba(200,200,255,0.4)",
          borderRadius: "60% 70% 55% 65% / 65% 60% 70% 55%",
          transform: "rotate(23deg)"
        }}>
          {/* Crater texture overlay */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='30' cy='30' r='8' fill='rgba(0,0,0,0.15)'/%3E%3Ccircle cx='70' cy='40' r='6' fill='rgba(0,0,0,0.1)'/%3E%3Ccircle cx='45' cy='70' r='10' fill='rgba(0,0,0,0.12)'/%3E%3Ccircle cx='20' cy='60' r='4' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E")`,
            borderRadius: "inherit",
            opacity: 0.8
          }}></div>
        </div>
        
        {/* Medium moon fragment with jagged edges */}
        <div className="absolute" style={{ 
          width: "3.2%", 
          height: "3.4%", 
          top: "49.5%", 
          left: "37%", 
          opacity: 0.8, 
          background: "radial-gradient(circle at 35% 35%, #76797e 15%, #52555a 50%, #3a3c42 85%)",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.6), 0 0 3px rgba(200,200,255,0.35)",
          clipPath: "polygon(10% 30%, 30% 0%, 70% 10%, 100% 30%, 90% 70%, 70% 100%, 30% 90%, 0% 60%)",
          transform: "rotate(13deg)"
        }}>
          {/* Surface detail texture */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M20,20 L30,10 L40,25 L60,15 L80,25 L90,40 L80,60 L90,80 L70,90 L50,80 L30,90 L10,70 Z' fill='none' stroke='rgba(0,0,0,0.1)' stroke-width='0.5'/%3E%3C/svg%3E")`,
            opacity: 0.7
          }}></div>
        </div>
        
        {/* Elongated moon fragment */}
        <div className="absolute" style={{ 
          width: "3.8%", 
          height: "2.8%", 
          top: "50.7%", 
          left: "72%", 
          opacity: 0.75, 
          background: "radial-gradient(ellipse at 40% 40%, #71757a 20%, #52555a 50%, #3a3c42 80%)",
          boxShadow: "inset -1px -1px 3px rgba(0,0,0,0.5), 0 0 3px rgba(200,200,255,0.3)",
          borderRadius: "70% 40% 60% 50% / 50% 40% 60% 40%",
          transform: "rotate(-17deg)"
        }}>
          {/* Surface ridge texture */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M10,50 Q30,40 50,50 Q70,60 90,50' fill='none' stroke='rgba(0,0,0,0.15)' stroke-width='2'/%3E%3Cpath d='M10,30 Q30,20 50,30 Q70,40 90,30' fill='none' stroke='rgba(0,0,0,0.1)' stroke-width='1.5'/%3E%3Cpath d='M10,70 Q30,60 50,70 Q70,80 90,70' fill='none' stroke='rgba(0,0,0,0.12)' stroke-width='1.8'/%3E%3C/svg%3E")`,
            borderRadius: "inherit",
            opacity: 0.7
          }}></div>
        </div>
        
        {/* Large irregular moon fragment */}
        <div className="absolute" style={{ 
          width: "4.2%", 
          height: "4.4%", 
          top: "49.2%", 
          left: "-79%", 
          opacity: 0.8, 
          background: "radial-gradient(circle at 45% 45%, #6e7073 25%, #52555a 55%, #3a3c42 85%)",
          boxShadow: "inset -1px -1px 3px rgba(0,0,0,0.6), 0 0 4px rgba(200,200,255,0.35)",
          clipPath: "polygon(20% 0%, 60% 10%, 90% 30%, 100% 60%, 80% 90%, 40% 100%, 10% 80%, 0% 40%)",
          transform: "rotate(8deg)"
        }}>
          {/* Detailed surface texture */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='30' cy='30' r='10' fill='rgba(0,0,0,0.12)'/%3E%3Ccircle cx='70' cy='40' r='8' fill='rgba(0,0,0,0.08)'/%3E%3Ccircle cx='50' cy='70' r='15' fill='rgba(0,0,0,0.1)'/%3E%3Ccircle cx='20' cy='60' r='5' fill='rgba(0,0,0,0.06)'/%3E%3C/svg%3E")`,
            clipPath: "inherit",
            opacity: 0.75
          }}></div>
        </div>
        
        {/* Smaller moon fragment with sharp edge */}
        <div className="absolute" style={{ 
          width: "2.4%", 
          height: "2.3%", 
          top: "50.3%", 
          left: "-55%", 
          opacity: 0.75, 
          background: "radial-gradient(circle at 30% 30%, #76797e 20%, #52555a 60%, #3a3c42 90%)",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.5), 0 0 2px rgba(200,200,255,0.25)",
          clipPath: "polygon(30% 0%, 70% 10%, 100% 40%, 90% 70%, 60% 100%, 30% 90%, 0% 50%, 10% 20%)",
          transform: "rotate(-12deg)"
        }}></div>
        
        {/* Angular moon fragment with detailed surface */}
        <div className="absolute" style={{ 
          width: "3.2%", 
          height: "2.8%", 
          top: "49.1%", 
          left: "93%", 
          opacity: 0.8, 
          background: "radial-gradient(circle at 40% 40%, #6b6e73 15%, #4d5056 55%, #36383e 85%)",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.5), 0 0 3px rgba(200,200,255,0.3)",
          clipPath: "polygon(20% 0%, 80% 20%, 100% 50%, 80% 90%, 40% 100%, 10% 70%, 0% 30%)",
          transform: "rotate(15deg)"
        }}>
          {/* Ridge line texture */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M20,20 L40,10 L60,30 L80,20 L70,50 L80,80 L50,90 L20,70 Z' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.5'/%3E%3C/svg%3E")`,
            clipPath: "inherit",
            opacity: 0.6
          }}></div>
        </div>
        
        {/* Medium moon chunk with sunset highlight */}
        <div className="absolute" style={{ 
          width: "2.7%", 
          height: "2.9%", 
          top: "48.9%", 
          left: "25%", 
          opacity: 0.75, 
          background: "radial-gradient(circle at 60% 40%, #90807a 10%, #78706b 40%, #5a5450 75%)",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.5), 0 0 5px rgba(255,170,100,0.4)",
          borderRadius: "60% 50% 70% 40% / 50% 60% 40% 70%",
          transform: "rotate(28deg)"
        }}>
          {/* Surface highlight */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(130deg, rgba(255,200,150,0.3) 0%, transparent 60%)",
            borderRadius: "inherit",
            opacity: 0.8
          }}></div>
        </div>
        
        {/* Jagged moon fragment with sunset glow */}
        <div className="absolute" style={{ 
          width: "3.3%", 
          height: "3%", 
          top: "50.5%", 
          left: "52%", 
          opacity: 0.7, 
          background: "radial-gradient(circle at 60% 40%, #96847a 10%, #7a6e66 40%, #5c5450 80%)",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(255,170,100,0.45)",
          clipPath: "polygon(10% 30%, 40% 0%, 70% 20%, 100% 40%, 80% 80%, 50% 100%, 20% 80%, 0% 50%)",
          transform: "rotate(-20deg)"
        }}>
          {/* Warm highlight overlay */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(120deg, rgba(255,180,130,0.4) 0%, transparent 70%)",
            clipPath: "inherit",
            opacity: 0.9
          }}></div>
        </div>
        
        {/* Large irregular chunk with sunset detail */}
        <div className="absolute" style={{ 
          width: "4.1%", 
          height: "3.8%", 
          top: "48.5%", 
          left: "-95%", 
          opacity: 0.85, 
          background: "radial-gradient(circle at 35% 35%, #6e7073 25%, #52555a 55%, #3a3c42 85%)",
          boxShadow: "inset -1px -1px 3px rgba(0,0,0,0.6), 0 0 4px rgba(200,200,255,0.4)",
          clipPath: "polygon(20% 0%, 50% 10%, 80% 0%, 100% 30%, 90% 60%, 100% 90%, 70% 100%, 40% 90%, 10% 100%, 0% 70%, 10% 30%)",
          transform: "rotate(-5deg)"
        }}>
          {/* Crater detail */}
          <div className="absolute w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='25' cy='25' r='12' fill='rgba(0,0,0,0.15)'/%3E%3Ccircle cx='65' cy='35' r='9' fill='rgba(0,0,0,0.1)'/%3E%3Ccircle cx='40' cy='70' r='15' fill='rgba(0,0,0,0.12)'/%3E%3Ccircle cx='75' cy='65' r='8' fill='rgba(0,0,0,0.08)'/%3E%3C/svg%3E")`,
            clipPath: "inherit",
            opacity: 0.75
          }}></div>
        </div>
        
        {/* Additional smaller moon fragments scattered among rings */}
        <div className="absolute" style={{ 
          width: "1.6%", 
          height: "1.5%", 
          top: "51.2%", 
          left: "65%", 
          opacity: 0.65, 
          background: "radial-gradient(circle at 40% 40%, #76797e 20%, #52555a 60%, #3a3c42 90%)",
          boxShadow: "inset -1px -1px 1px rgba(0,0,0,0.4), 0 0 2px rgba(200,200,255,0.25)",
          borderRadius: "65% 35% 70% 30% / 40% 60% 40% 60%",
          transform: "rotate(32deg)"
        }}></div>
        
        <div className="absolute" style={{ 
          width: "1.8%", 
          height: "1.7%", 
          top: "49.8%", 
          left: "-65%", 
          opacity: 0.7, 
          background: "radial-gradient(circle at 35% 35%, #6e7073 25%, #52555a 60%, #3a3c42 90%)",
          boxShadow: "inset -1px -1px 1px rgba(0,0,0,0.4), 0 0 2px rgba(200,200,255,0.25)",
          clipPath: "polygon(30% 0%, 70% 20%, 100% 50%, 80% 90%, 30% 100%, 0% 60%, 10% 20%)",
          transform: "rotate(-18deg)"
        }}></div>
        
        <div className="absolute" style={{ 
          width: "1.4%", 
          height: "1.3%", 
          top: "49.4%", 
          left: "15%", 
          opacity: 0.6, 
          background: "radial-gradient(circle at 40% 40%, #76797e 20%, #52555a 60%, #3a3c42 90%)",
          boxShadow: "inset -1px -1px 1px rgba(0,0,0,0.4), 0 0 2px rgba(200,200,255,0.2)",
          borderRadius: "40% 60% 30% 70% / 60% 40% 70% 30%",
          transform: "rotate(8deg)"
        }}></div>
        
        {/* Realistic Earth's shadow cast on rings with atmospheric edge effects */}
        <div className="absolute" style={{
          width: "190%",
          height: "18vh",
          top: "43%", 
          left: "-41%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 75%, transparent 95%)",
          transform: "translateY(-50%) rotate(15deg)",
          borderRadius: "50%",
          opacity: 0.85,
          pointerEvents: "none",
          filter: "blur(5px)"
        }}></div>
        
        {/* Subtle blue atmospheric refraction at shadow edge */}
        <div className="absolute" style={{
          width: "200%",
          height: "20vh",
          top: "42%", 
          left: "-45%",
          background: "radial-gradient(ellipse at center, transparent 70%, rgba(70,130,200,0.03) 80%, rgba(70,130,200,0.06) 90%, transparent 100%)",
          transform: "translateY(-50%) rotate(15deg)",
          borderRadius: "50%",
          opacity: 0.6,
          pointerEvents: "none",
          filter: "blur(8px)",
          mixBlendMode: "screen"
        }}></div>
      </div>
      
      {/* Game title */}
      <div
        className="font-bold text-white mb-8 sm:mb-10 md:mb-12 z-10 px-4 text-center"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="title-container items-center justify-center">
            {/* Desktop and tablet version (single line) */}
            <div className="hidden sm:flex items-center justify-center text-[4.5rem] md:text-[5.5rem] lg:text-[6.3rem]">
              <span className="stellar-text">STELLAR</span><span className="odyssey-text">ODYSSEY</span>
            </div>
            
            {/* Mobile version (two lines) with first line smaller - perfectly centered */}
            <div className="flex flex-col sm:hidden items-center justify-center w-full px-3 text-center gap-6">
              <div className="stellar-text text-[1.9rem] animate-fade-slide-in" style={{ marginLeft: "-20%", position: "relative", display: "inline-block", transform: "skewX(-15deg)" }}>STELLAR</div>
              <div className="odyssey-text w-full text-[5.5rem] text-center mx-auto flex justify-center items-center">ODYSSEY</div>
            </div>
          </div>
          <div className="text-[0.5rem] sm:text-[0.8rem] md:text-[1rem] lg:text-[1.2rem] w-[100%] mx-auto text-center font-bold shimmer-text mt-4">ECHOES OF THE ARCHITECTS</div>
        </div>
      </div>
      
      {/* Menu buttons with different colors */}
      <motion.div
        className="menu-buttons-container z-10 justify-center mt-12"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
      >
        <motion.div 
          className={`menu-button px-8 py-3 text-white text-xl w-64 text-center ${activeButton === 'newGame' ? 'pulse-button' : ''}`} 
          onClick={handleNewGame}
          onMouseEnter={() => setActiveButton('newGame')}
        >
          NEW GAME
        </motion.div>
        
        {showContinue && (
          <motion.div 
            className={`menu-button px-8 py-3 text-white text-xl w-64 text-center ${activeButton === 'loadGame' ? 'pulse-button' : ''}`} 
            onClick={handleLoadGame}
            onMouseEnter={() => setActiveButton('loadGame')}
          >
            LOAD GAME
          </motion.div>
        )}
        
        <motion.div 
          className={`menu-button px-8 py-3 text-white text-xl w-64 text-center ${activeButton === 'settings' ? 'pulse-button' : ''}`} 
          onClick={() => setShowSettings(true)}
          onMouseEnter={() => setActiveButton('settings')}
        >
          SETTINGS
        </motion.div>
      </motion.div>
      
      {/* Save/Load Menu */}
      <SaveLoadMenu 
        isOpen={showSaveLoadMenu} 
        onClose={() => setShowSaveLoadMenu(false)} 
        mode="load" 
      />
      
      {/* Settings Menu */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
      
      {/* Debug buttons */}
      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-xs text-gray-500 z-10">
        <div>Game Phase: {useGame.getState().phase}</div>
        {character && character.id && <div>Character: {character.name}</div>}
      </div>
      
      {/* Credits */}
      <motion.div
        className="absolute bottom-2 sm:bottom-3 md:bottom-4 text-gray-500 text-xs sm:text-sm z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        © 2025 Brodi Branded Inc. All rights reserved.
      </motion.div>
    </div>
  );
};

export default MainMenu;
