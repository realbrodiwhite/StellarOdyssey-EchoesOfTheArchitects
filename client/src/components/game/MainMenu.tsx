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
      
      {/* Earth with millions of moon debris pieces forming rings */}
      <div className="absolute z-5" style={{ 
        bottom: "35vh",
        left: "28%", 
        transform: "translateX(-50%)",
        width: "22vh",
        height: "22vh",
        opacity: 1,
        filter: "drop-shadow(0 0 12px rgba(120,180,255,0.3))"
      }}>
        {/* Earth body - darker dusk appearance */}
        <div className="absolute rounded-full" style={{ 
          width: "100%", 
          height: "100%",
          background: "radial-gradient(circle at 35% 35%, #2a6b9e 0%, #1b5275 25%, #0e3a53 50%, #06243e 75%, #031626 100%)",
          boxShadow: "inset -5px -5px 10px rgba(0,0,0,0.7), 0 0 5px rgba(80,140,200,0.3)"
        }}>
          {/* North America - darker dusk colors */}
          <div className="absolute" style={{
            top: "20%",
            left: "20%",
            width: "30%",
            height: "25%",
            background: "rgba(45,85,35,0.7)",
            borderRadius: "40% 60% 70% 30% / 60% 40% 60% 40%"
          }}></div>
          
          {/* South America - darker dusk colors */}
          <div className="absolute" style={{
            top: "45%",
            left: "35%",
            width: "15%",
            height: "25%",
            background: "rgba(55,95,45,0.7)",
            borderRadius: "40% 60% 40% 60% / 60% 40% 60% 40%"
          }}></div>
          
          {/* Europe - darker dusk colors */}
          <div className="absolute" style={{
            top: "25%",
            left: "52%",
            width: "15%",
            height: "15%",
            background: "rgba(40,80,35,0.7)",
            borderRadius: "40% 60% 40% 60% / 60% 40% 60% 40%"
          }}></div>
          
          {/* Africa - darker dusk colors */}
          <div className="absolute" style={{
            top: "40%",
            left: "55%",
            width: "22%",
            height: "25%",
            background: "rgba(90,70,40,0.7)",
            borderRadius: "60% 40% 60% 40% / 40% 60% 40% 60%"
          }}></div>
          
          {/* Asia - darker dusk colors */}
          <div className="absolute" style={{
            top: "20%",
            left: "65%",
            width: "30%",
            height: "25%",
            background: "rgba(50,90,40,0.7)",
            borderRadius: "60% 40% 60% 40% / 40% 60% 40% 60%"
          }}></div>
          
          {/* Australia - darker dusk colors */}
          <div className="absolute" style={{
            top: "60%",
            left: "75%",
            width: "15%",
            height: "15%",
            background: "rgba(100,80,45,0.7)",
            borderRadius: "60% 40% 60% 40% / 40% 60% 40% 60%"
          }}></div>
          
          {/* North pole - darker dusk colors */}
          <div className="absolute" style={{
            top: "5%",
            left: "30%",
            width: "40%",
            height: "12%",
            background: "rgba(180,200,220,0.7)",
            borderRadius: "50%"
          }}></div>
          
          {/* South pole - darker dusk colors */}
          <div className="absolute" style={{
            bottom: "5%",
            left: "30%",
            width: "40%",
            height: "15%",
            background: "rgba(180,200,220,0.7)",
            borderRadius: "50%"
          }}></div>
          
          {/* Cloud formations - dusk appearance */}
          <div className="absolute" style={{
            top: "15%",
            left: "10%", 
            width: "30%",
            height: "10%",
            background: "rgba(200,200,220,0.3)",
            borderRadius: "60% 40% 60% 40% / 40% 60% 40% 60%",
            filter: "blur(1px)"
          }}></div>
          
          <div className="absolute" style={{
            top: "40%",
            left: "48%", 
            width: "30%",
            height: "10%",
            background: "rgba(200,200,220,0.3)",
            borderRadius: "40% 60% 40% 60% / 60% 40% 60% 40%",
            filter: "blur(1px)"
          }}></div>
          
          <div className="absolute" style={{
            top: "70%",
            left: "35%", 
            width: "25%",
            height: "8%",
            background: "rgba(200,200,220,0.3)",
            borderRadius: "40% 60% 40% 60% / 60% 40% 60% 40%",
            filter: "blur(1px)"
          }}></div>
          
          {/* Sunset highlight on one edge */}
          <div className="absolute" style={{
            width: "100%", 
            height: "100%",
            background: "linear-gradient(130deg, rgba(255,140,80,0.2) 0%, transparent 30%)",
            borderRadius: "50%"
          }}></div>
          
          {/* Atmosphere glow - dusk appearance */}
          <div className="absolute" style={{
            width: "120%", 
            height: "120%",
            top: "-10%",
            left: "-10%",
            background: "radial-gradient(circle at center, transparent 50%, rgba(90,140,200,0.1) 75%, rgba(90,140,200,0.15) 90%, rgba(90,140,200,0.1) 100%)",
            borderRadius: "50%"
          }}></div>
        </div>
        
        {/* Outer ring with dense debris pattern - darker dusk appearance */}
        <div className="absolute" style={{
          width: "300%",
          height: "6vh",
          top: "50%",
          left: "-100%",
          transform: "translateY(-50%) rotate(15deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.8
        }}>
          {/* Dense debris field base - darker appearance */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(150,150,170,0.2) 30%, rgba(180,180,200,0.45) 50%, rgba(150,150,170,0.2) 70%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 10px rgba(200,200,255,0.2)"
          }}></div>
          
          {/* Millions of tiny debris particles in outer ring - dusk appearance */}
          <div className="absolute w-full h-full">
            {Array.from({ length: 50 }).map((_, i) => (
              <div 
                key={`outer-debris-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 0.3 + 0.1}vh`,
                  height: `${Math.random() * 0.3 + 0.1}vh`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.5 + Math.random() * 0.3,
                  background: "rgba(180,180,200,0.7)",
                  boxShadow: "0 0 2px rgba(200,200,255,0.3)"
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Middle dense ring - darker dusk appearance */}
        <div className="absolute" style={{
          width: "240%",
          height: "4vh",
          top: "49%",
          left: "-70%",
          transform: "translateY(-50%) rotate(-20deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.85
        }}>
          {/* Dense debris field base - darker appearance */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(160,160,180,0.3) 30%, rgba(190,190,210,0.55) 50%, rgba(160,160,180,0.3) 70%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 8px rgba(200,200,255,0.2)"
          }}></div>
          
          {/* Sunset highlight on part of the ring */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 40%, rgba(255,140,80,0.15) 50%, rgba(0,0,0,0) 60%)",
          }}></div>
          
          {/* Millions of tiny debris particles in middle ring - dusk appearance */}
          <div className="absolute w-full h-full">
            {Array.from({ length: 70 }).map((_, i) => (
              <div 
                key={`middle-debris-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 0.25 + 0.05}vh`,
                  height: `${Math.random() * 0.25 + 0.05}vh`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.6 + Math.random() * 0.3,
                  background: "rgba(180,180,200,0.7)",
                  boxShadow: "0 0 2px rgba(200,200,255,0.2)"
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Inner dense ring - darker dusk appearance */}
        <div className="absolute" style={{
          width: "160%",
          height: "2vh",
          top: "50.5%",
          left: "-30%",
          transform: "translateY(-50%) rotate(25deg)",
          borderRadius: "50%",
          overflow: "hidden",
          opacity: 0.9
        }}>
          {/* Dense debris field base - darker appearance */}
          <div className="absolute w-full h-full" style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(170,170,190,0.5) 30%, rgba(200,200,220,0.7) 50%, rgba(170,170,190,0.5) 70%, rgba(0,0,0,0) 100%)",
            boxShadow: "0 0 6px rgba(200,200,255,0.3)"
          }}></div>
          
          {/* Millions of tiny debris particles in inner ring - dusk appearance */}
          <div className="absolute w-full h-full">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={`inner-debris-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 0.2 + 0.05}vh`,
                  height: `${Math.random() * 0.2 + 0.05}vh`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.7 + Math.random() * 0.2,
                  background: "rgba(190,190,210,0.8)",
                  boxShadow: "0 0 2px rgba(200,200,255,0.4)"
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
