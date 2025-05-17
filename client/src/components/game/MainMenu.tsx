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
      
      {/* Earth-like planet with moon debris rings - moved left and up */}
      <div className="absolute z-5" style={{ 
        bottom: "30vh",
        left: "30%", 
        transform: "translateX(-50%)",
        width: "20vh",
        height: "20vh",
        opacity: 1,
        filter: "drop-shadow(0 0 15px rgba(120,180,255,0.3))"
      }}>
        {/* Realistic Earth-like planet body */}
        <div className="absolute rounded-full" style={{ 
          width: "100%", 
          height: "100%",
          background: "radial-gradient(circle at 35% 35%, #2978a0 0%, #1c5985 30%, #0a3861 70%, #0a1933 100%)",
          boxShadow: "inset -2px -2px 5px rgba(0,0,0,0.5), 0 0 3px rgba(100,200,255,0.4)"
        }}>
          {/* Continental details */}
          <div className="absolute" style={{
            width: "100%",
            height: "100%",
            background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath fill='rgba(70,140,50,0.5)' d='M30,30 Q40,20 50,30 T70,30 Q75,40 65,50 T70,70 Q60,75 50,65 T30,70 Q25,60 35,50 T30,30 Z'/%3E%3C/svg%3E")`,
            backgroundSize: "cover",
            opacity: 0.7
          }}></div>
          
          {/* Atmospheric glow */}
          <div className="absolute" style={{
            width: "110%", 
            height: "110%",
            top: "-5%",
            left: "-5%",
            background: "radial-gradient(circle at center, transparent 50%, rgba(100,180,255,0.1) 70%, rgba(100,180,255,0.2) 90%, rgba(100,180,255,0.1) 100%)"
          }}></div>
        </div>
        
        {/* Detailed debris rings with many small chunks of rock */}
        
        {/* First major debris ring - outer */}
        <div className="absolute" style={{
          width: "300%",
          height: "3vh", 
          top: "50%",
          left: "-100%",
          background: `radial-gradient(ellipse at center, transparent, transparent),
                      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="30" viewBox="0 0 600 30"><g fill="rgba(255,255,255,0.7)"><circle cx="10" cy="5" r="0.8" /><circle cx="22" cy="12" r="0.5" /><circle cx="35" cy="8" r="0.3" /><circle cx="42" cy="15" r="0.7" /><circle cx="58" cy="10" r="0.4" /><circle cx="65" cy="17" r="0.6" /><circle cx="80" cy="7" r="0.5" /><circle cx="92" cy="14" r="0.3" /><circle cx="105" cy="19" r="0.8" /><circle cx="120" cy="3" r="0.6" /><circle cx="132" cy="12" r="0.4" /><circle cx="145" cy="21" r="0.3" /><circle cx="158" cy="9" r="0.7" /><circle cx="178" cy="16" r="0.4" /><circle cx="192" cy="5" r="0.6" /><circle cx="210" cy="17" r="0.3" /><circle cx="220" cy="10" r="0.5" /><circle cx="238" cy="7" r="0.4" /><circle cx="250" cy="19" r="0.8" /><circle cx="275" cy="4" r="0.5" /><circle cx="290" cy="12" r="0.3" /><circle cx="310" cy="18" r="0.7" /><circle cx="325" cy="8" r="0.5" /><circle cx="345" cy="15" r="0.4" /><circle cx="360" cy="3" r="0.6" /><circle cx="380" cy="20" r="0.3" /><circle cx="395" cy="7" r="0.5" /><circle cx="410" cy="17" r="0.8" /><circle cx="425" cy="4" r="0.4" /><circle cx="442" cy="13" r="0.6" /><circle cx="468" cy="8" r="0.3" /><circle cx="480" cy="16" r="0.7" /><circle cx="495" cy="5" r="0.4" /><circle cx="510" cy="19" r="0.5" /><circle cx="525" cy="10" r="0.6" /><circle cx="543" cy="3" r="0.3" /><circle cx="560" cy="21" r="0.8" /><circle cx="582" cy="12" r="0.5" /></g></svg>')`,
          boxShadow: "0 0 8px rgba(255,255,255,0.2)",
          transform: "translateY(-50%) rotate(12deg) perspective(100px) rotateX(5deg)",
          borderRadius: "50%",
          opacity: 0.9
        }}></div>
        
        {/* Second major debris ring - middle, denser */}
        <div className="absolute" style={{
          width: "240%",
          height: "4vh",
          top: "49%",
          left: "-70%",
          background: `radial-gradient(ellipse at center, transparent, transparent),
                      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="40" viewBox="0 0 500 40"><g fill="rgba(240,240,245,0.8)"><circle cx="8" cy="23" r="1.0" /><circle cx="19" cy="7" r="0.6" /><circle cx="32" cy="19" r="1.2" /><circle cx="45" cy="5" r="0.7" /><circle cx="57" cy="22" r="0.9" /><circle cx="68" cy="12" r="0.5" /><circle cx="79" cy="28" r="1.1" /><circle cx="90" cy="8" r="0.8" /><circle cx="102" cy="17" r="0.4" /><circle cx="118" cy="25" r="1.0" /><circle cx="130" cy="6" r="0.7" /><circle cx="144" cy="14" r="0.5" /><circle cx="158" cy="27" r="0.9" /><circle cx="172" cy="11" r="0.6" /><circle cx="189" cy="19" r="1.1" /><circle cx="204" cy="8" r="0.8" /><circle cx="218" cy="23" r="0.5" /><circle cx="235" cy="12" r="0.9" /><circle cx="249" cy="29" r="0.7" /><circle cx="262" cy="5" r="1.0" /><circle cx="278" cy="18" r="0.6" /><circle cx="295" cy="25" r="0.8" /><circle cx="308" cy="9" r="1.2" /><circle cx="321" cy="17" r="0.5" /><circle cx="336" cy="26" r="0.9" /><circle cx="349" cy="13" r="0.7" /><circle cx="364" cy="21" r="1.1" /><circle cx="379" cy="7" r="0.6" /><circle cx="388" cy="24" r="0.8" /><circle cx="401" cy="14" r="1.0" /><circle cx="415" cy="28" r="0.5" /><circle cx="429" cy="6" r="0.9" /><circle cx="442" cy="19" r="0.7" /><circle cx="457" cy="31" r="1.1" /><circle cx="468" cy="11" r="0.8" /><circle cx="482" cy="20" r="0.6" /></g></svg>')`,
          boxShadow: "0 0 10px rgba(255,255,255,0.3)",
          transform: "translateY(-50%) rotate(-18deg) perspective(150px) rotateX(-8deg)",
          borderRadius: "50%",
          opacity: 1
        }}></div>
        
        {/* Third major debris ring - inner, very dense */}
        <div className="absolute" style={{
          width: "180%",
          height: "2.5vh",
          top: "50.5%",
          left: "-40%",
          background: `radial-gradient(ellipse at center, transparent, transparent),
                      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="25" viewBox="0 0 400 25"><g fill="rgba(220,220,225,0.75)"><circle cx="12" cy="10" r="0.9" /><circle cx="23" cy="15" r="0.7" /><circle cx="38" cy="7" r="1.1" /><circle cx="51" cy="18" r="0.5" /><circle cx="63" cy="5" r="0.8" /><circle cx="75" cy="12" r="1.0" /><circle cx="88" cy="19" r="0.6" /><circle cx="99" cy="8" r="0.9" /><circle cx="114" cy="17" r="0.7" /><circle cx="127" cy="4" r="1.2" /><circle cx="139" cy="13" r="0.5" /><circle cx="152" cy="21" r="0.8" /><circle cx="167" cy="9" r="1.0" /><circle cx="179" cy="16" r="0.6" /><circle cx="190" cy="6" r="0.9" /><circle cx="204" cy="20" r="0.7" /><circle cx="218" cy="11" r="1.1" /><circle cx="233" cy="5" r="0.5" /><circle cx="245" cy="14" r="0.8" /><circle cx="258" cy="19" r="1.0" /><circle cx="272" cy="8" r="0.6" /><circle cx="285" cy="13" r="0.9" /><circle cx="299" cy="3" r="0.7" /><circle cx="312" cy="17" r="1.2" /><circle cx="324" cy="10" r="0.5" /><circle cx="337" cy="21" r="0.8" /><circle cx="352" cy="5" r="1.0" /><circle cx="363" cy="15" r="0.6" /><circle cx="376" cy="9" r="0.9" /><circle cx="389" cy="19" r="0.7" /></g></svg>')`,
          boxShadow: "0 0 6px rgba(255,255,255,0.25)",
          transform: "translateY(-50%) rotate(24deg) perspective(90px) rotateX(6deg)",
          borderRadius: "50%",
          opacity: 0.95
        }}></div>
        
        {/* Scattered smaller debris */}
        <div className="absolute" style={{
          width: "350%",
          height: "10vh",
          top: "45%",
          left: "-125%",
          background: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="100" viewBox="0 0 800 100"><g fill="rgba(255,255,255,0.3)"><circle cx="21" cy="45" r="0.4" /><circle cx="54" cy="23" r="0.3" /><circle cx="87" cy="65" r="0.25" /><circle cx="123" cy="12" r="0.35" /><circle cx="156" cy="78" r="0.3" /><circle cx="198" cy="34" r="0.25" /><circle cx="243" cy="56" r="0.4" /><circle cx="276" cy="89" r="0.3" /><circle cx="312" cy="23" r="0.25" /><circle cx="354" cy="67" r="0.35" /><circle cx="389" cy="12" r="0.3" /><circle cx="423" cy="88" r="0.25" /><circle cx="465" cy="45" r="0.4" /><circle cx="498" cy="23" r="0.3" /><circle cx="534" cy="76" r="0.25" /><circle cx="576" cy="33" r="0.35" /><circle cx="612" cy="54" r="0.3" /><circle cx="645" cy="87" r="0.25" /><circle cx="687" cy="21" r="0.4" /><circle cx="721" cy="67" r="0.3" /><circle cx="765" cy="43" r="0.25" /></g></svg>')`,
          transform: "translateY(-50%)",
          borderRadius: "50%",
          opacity: 0.5
        }}></div>
        
        {/* Dust cloud outer ring */}
        <div className="absolute" style={{
          width: "400%",
          height: "8vh",
          top: "50%",
          left: "-150%",
          background: `radial-gradient(ellipse at center, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.03) 30%, rgba(255,255,255,0.01) 70%, transparent 100%)`,
          transform: "translateY(-50%) rotate(5deg)",
          borderRadius: "50%",
          opacity: 0.7
        }}></div>
        
        {/* A few larger rock chunks scattered in rings */}
        <div className="absolute rounded-full bg-gray-200" style={{ width: "2%", height: "2%", top: "49%", left: "35%", opacity: 0.85 }}></div>
        <div className="absolute rounded-full bg-gray-300" style={{ width: "3%", height: "3%", top: "48%", left: "-35%", opacity: 0.9 }}></div>
        <div className="absolute rounded-full bg-gray-100" style={{ width: "1.5%", height: "1.5%", top: "51%", left: "75%", opacity: 0.8 }}></div>
        <div className="absolute rounded-full bg-gray-200" style={{ width: "2.5%", height: "2.5%", top: "50%", left: "-75%", opacity: 0.75 }}></div>
        <div className="absolute rounded-full bg-gray-300" style={{ width: "1.8%", height: "1.8%", top: "49.5%", left: "60%", opacity: 0.85 }}></div>
        
        {/* First large moon chunk - embedded in first ring */}
        <div className="absolute rounded-full bg-gray-300" style={{
          width: "15%",
          height: "15%",
          top: "42%",
          right: "-120%",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.6), 0 0 2px rgba(255,255,255,0.2)",
          transform: "rotate(15deg)"
        }}></div>
        
        {/* Second large moon chunk - embedded in second ring */}
        <div className="absolute rounded-full bg-gray-400" style={{
          width: "20%",
          height: "20%",
          bottom: "40%",
          left: "-110%",
          boxShadow: "inset -1px -1px 2px rgba(0,0,0,0.6), 0 0 2px rgba(255,255,255,0.2)",
          transform: "rotate(-20deg)"
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
