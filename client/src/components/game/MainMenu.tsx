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
      
      {/* Realistic Earth with millions of moon debris pieces forming rings - integrated with star rotation */}
      <div className="absolute z-5 earth-container" style={{ 
        bottom: "35vh",
        left: "28%", 
        transform: "translateX(-50%)",
        width: "22vh",
        height: "22vh",
        opacity: 1,
        filter: "drop-shadow(0 0 12px rgba(120,180,255,0.3))"
      }}>
        {/* High-detail realistic Earth body with photo-realistic textures */}
        <div className="absolute rounded-full overflow-hidden" style={{ 
          width: "100%", 
          height: "100%",
          background: "radial-gradient(circle at 35% 35%, #1a5b8e 0%, #0b4265 25%, #063143 50%, #05233e 75%, #021626 100%)",
          boxShadow: "inset -5px -5px 10px rgba(0,0,0,0.8), 0 0 8px rgba(80,140,200,0.3)",
          transform: "rotate(-23.5deg)", // Earth's axial tilt
          position: "relative"
        }}>
          {/* Base realistic ocean texture with depth variations */}
          <div className="absolute" style={{
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at 40% 40%, #14395c 0%, #0c2e4a 35%, #082235 65%, #051a2c 100%)",
            opacity: 0.95
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
          
          {/* Antarctica - highly detailed ice cap */}
          <div className="absolute" style={{
            bottom: "2%",
            left: "30%",
            width: "40%",
            height: "15%",
            background: "linear-gradient(to bottom, rgba(180,200,220,0.6) 0%, rgba(210,230,250,0.7) 100%)",
            clipPath: "ellipse(50% 50% at 50% 70%)",
            boxShadow: "inset 0px -2px 6px rgba(255,255,255,0.3)",
            opacity: 0.8
          }}>
            {/* Antarctica ice texture */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
              opacity: 0.8
            }}></div>
          </div>
          
          {/* Arctic ice cap */}
          <div className="absolute" style={{
            top: "2%",
            left: "30%",
            width: "40%",
            height: "12%",
            background: "linear-gradient(to top, rgba(180,200,220,0.6) 0%, rgba(210,230,250,0.7) 100%)",
            clipPath: "ellipse(50% 50% at 50% 30%)",
            boxShadow: "inset 0px 2px 6px rgba(255,255,255,0.3)",
            opacity: 0.8
          }}>
            {/* Arctic ice texture */}
            <div className="absolute w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
              opacity: 0.8
            }}></div>
          </div>
          
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
        
        {/* Ultra-realistic outer ring with high-detail debris pattern */}
        <div className="absolute" style={{
          width: "320%",
          height: "7vh",
          top: "50%",
          left: "-110%",
          transform: "translateY(-50%) rotate(15deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.85,
          filter: "drop-shadow(0 0 8px rgba(100,120,200,0.1))"
        }}>
          {/* High-detail debris field base with realistic gradient */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(140,145,165,0.2) 25%, rgba(170,175,195,0.45) 50%, rgba(140,145,165,0.2) 75%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 12px rgba(180,190,230,0.15)"
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
        
        {/* Ultra-detailed middle ring with complex visual layers */}
        <div className="absolute" style={{
          width: "260%",
          height: "4.5vh",
          top: "49%",
          left: "-80%",
          transform: "translateY(-50%) rotate(-20deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.9,
          filter: "drop-shadow(0 0 6px rgba(100,120,200,0.1))"
        }}>
          {/* Photorealistic debris field base layer */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(150,155,175,0.3) 30%, rgba(180,185,205,0.55) 50%, rgba(150,155,175,0.3) 70%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 10px rgba(180,190,230,0.15)"
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
        
        {/* Ultra-realistic inner ring with advanced optical effects */}
        <div className="absolute" style={{
          width: "180%",
          height: "2.8vh",
          top: "50.5%",
          left: "-40%",
          transform: "translateY(-50%) rotate(25deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.95,
          filter: "drop-shadow(0 0 4px rgba(100,120,200,0.1))"
        }}>
          {/* High-density debris field base with enhanced realism */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(160,165,185,0.5) 30%, rgba(190,195,215,0.7) 50%, rgba(160,165,185,0.5) 70%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 8px rgba(180,190,230,0.2)"
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
        
        {/* Larger moon chunks scattered through rings - darker dusk appearance */}
        <div className="absolute rounded-full bg-gray-500" style={{ width: "2.7%", height: "2.7%", top: "49.3%", left: "37%", opacity: 0.7, boxShadow: "0 0 3px rgba(200,200,255,0.3)" }}></div>
        <div className="absolute rounded-full bg-gray-600" style={{ width: "4%", height: "4%", top: "48.2%", left: "-38%", opacity: 0.8, boxShadow: "0 0 4px rgba(200,200,255,0.4)" }}></div>
        <div className="absolute rounded-full bg-gray-500" style={{ width: "2.2%", height: "2.2%", top: "50.7%", left: "72%", opacity: 0.7, boxShadow: "0 0 3px rgba(200,200,255,0.3)" }}></div>
        <div className="absolute rounded-full bg-gray-600" style={{ width: "3.2%", height: "3.2%", top: "49.5%", left: "-79%", opacity: 0.75, boxShadow: "0 0 4px rgba(200,200,255,0.4)" }}></div>
        <div className="absolute rounded-full bg-gray-500" style={{ width: "1.8%", height: "1.8%", top: "50.3%", left: "-55%", opacity: 0.7, boxShadow: "0 0 2px rgba(200,200,255,0.25)" }}></div>
        <div className="absolute rounded-full bg-gray-600" style={{ width: "2.5%", height: "2.5%", top: "49.1%", left: "93%", opacity: 0.75, boxShadow: "0 0 3px rgba(200,200,255,0.3)" }}></div>
        <div className="absolute rounded-full bg-gray-500" style={{ width: "2.1%", height: "2.1%", top: "50.9%", left: "25%", opacity: 0.7, boxShadow: "0 0 3px rgba(200,200,255,0.3)" }}></div>
        <div className="absolute rounded-full bg-gray-600" style={{ width: "3.6%", height: "3.6%", top: "48.7%", left: "-95%", opacity: 0.8, boxShadow: "0 0 4px rgba(200,200,255,0.4)" }}></div>
        
        {/* Subtle orange/amber highlight on chunks catching "sunset" light */}
        <div className="absolute rounded-full bg-amber-700" style={{ width: "2.3%", height: "2.3%", top: "48.5%", left: "52%", opacity: 0.5, boxShadow: "0 0 3px rgba(255,170,100,0.3)" }}></div>
        <div className="absolute rounded-full bg-amber-600" style={{ width: "1.9%", height: "1.9%", top: "49.2%", left: "-45%", opacity: 0.45, boxShadow: "0 0 2px rgba(255,170,100,0.25)" }}></div>
        
        {/* Earth's shadow cast on rings - deeper shadow for dusk */}
        <div className="absolute" style={{
          width: "180%",
          height: "16vh",
          top: "44%", 
          left: "-38%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.3) 60%, transparent 90%)",
          transform: "translateY(-50%) rotate(15deg)",
          borderRadius: "50%",
          opacity: 0.8,
          pointerEvents: "none",
          filter: "blur(4px)"
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
