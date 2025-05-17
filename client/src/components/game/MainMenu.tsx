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
        
        {/* Ultra-realistic debris rings with proper 3D perspective */}
        
        {/* Base dense debris field - primary ring with photorealistic depth */}
        <div className="absolute overflow-hidden" style={{
          width: "300%",
          height: "5vh",
          top: "50%",
          left: "-100%",
          transformStyle: "preserve-3d",
          transform: "translateY(-50%) rotateX(75deg) rotateZ(5deg)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 20px rgba(255,255,255,0.3)",
          opacity: 0.9,
          background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(100,100,120,0.15) 5%, rgba(150,150,170,0.4) 15%, rgba(200,200,220,0.6) 35%, rgba(230,230,240,0.8) 50%, rgba(200,200,220,0.6) 65%, rgba(150,150,170,0.4) 85%, rgba(100,100,120,0.15) 95%, rgba(0,0,0,0) 100%)"
        }}>
          {/* Inside the primary ring - individual particles */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="60" viewBox="0 0 1200 60"><g fill="rgba(255,255,255,0.9)"><circle cx="25" cy="15" r="0.8" /><circle cx="42" cy="32" r="1.1" /><circle cx="63" cy="18" r="0.7" /><circle cx="84" cy="35" r="1.3" /><circle cx="106" cy="21" r="0.6" /><circle cx="128" cy="42" r="0.9" /><circle cx="147" cy="9" r="1.0" /><circle cx="169" cy="28" r="0.7" /><circle cx="184" cy="47" r="1.2" /><circle cx="207" cy="13" r="0.6" /><circle cx="229" cy="32" r="0.9" /><circle cx="253" cy="19" r="1.1" /><circle cx="279" cy="38" r="0.7" /><circle cx="304" cy="16" r="1.0" /><circle cx="325" cy="29" r="0.8" /><circle cx="347" cy="43" r="1.2" /><circle cx="368" cy="17" r="0.6" /><circle cx="389" cy="34" r="0.9" /><circle cx="410" cy="12" r="1.1" /><circle cx="432" cy="27" r="0.7" /><circle cx="454" cy="46" r="1.0" /><circle cx="475" cy="22" r="0.8" /><circle cx="496" cy="37" r="1.2" /><circle cx="516" cy="14" r="0.6" /><circle cx="538" cy="29" r="0.9" /><circle cx="560" cy="44" r="1.1" /><circle cx="583" cy="18" r="0.7" /><circle cx="605" cy="37" r="1.0" /><circle cx="628" cy="21" r="0.8" /><circle cx="647" cy="41" r="1.2" /><circle cx="669" cy="15" r="0.6" /><circle cx="691" cy="34" r="0.9" /><circle cx="712" cy="23" r="1.1" /><circle cx="735" cy="42" r="0.7" /><circle cx="756" cy="12" r="1.0" /><circle cx="778" cy="27" r="0.8" /><circle cx="800" cy="46" r="1.2" /><circle cx="823" cy="18" r="0.6" /><circle cx="848" cy="37" r="0.9" /><circle cx="867" cy="21" r="1.1" /><circle cx="889" cy="46" r="0.7" /><circle cx="911" cy="15" r="1.0" /><circle cx="932" cy="36" r="0.8" /><circle cx="954" cy="19" r="1.2" /><circle cx="975" cy="41" r="0.6" /><circle cx="997" cy="24" r="0.9" /><circle cx="1019" cy="38" r="1.1" /><circle cx="1040" cy="14" r="0.7" /><circle cx="1063" cy="32" r="1.0" /><circle cx="1085" cy="19" r="0.8" /><circle cx="1106" cy="43" r="1.2" /><circle cx="1128" cy="27" r="0.6" /><circle cx="1149" cy="12" r="0.9" /><circle cx="1173" cy="31" r="1.1" /></g></svg>'),
            backgroundRepeat: "repeat",
            mixBlendMode: "screen"
          }}></div>
          
          {/* Darker particles layer for depth */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="50" viewBox="0 0 1000 50"><g fill="rgba(180,180,200,0.6)"><circle cx="18" cy="12" r="1.4" /><circle cx="47" cy="29" r="0.9" /><circle cx="73" cy="15" r="1.2" /><circle cx="102" cy="32" r="0.8" /><circle cx="128" cy="18" r="1.3" /><circle cx="154" cy="37" r="0.7" /><circle cx="183" cy="14" r="1.0" /><circle cx="214" cy="26" r="1.5" /><circle cx="239" cy="38" r="0.6" /><circle cx="268" cy="19" r="1.1" /><circle cx="295" cy="33" r="0.8" /><circle cx="320" cy="15" r="1.3" /><circle cx="347" cy="29" r="0.7" /><circle cx="377" cy="12" r="1.2" /><circle cx="403" cy="27" r="0.9" /><circle cx="432" cy="41" r="1.4" /><circle cx="458" cy="16" r="0.8" /><circle cx="487" cy="34" r="1.0" /><circle cx="513" cy="22" r="0.7" /><circle cx="542" cy="39" r="1.3" /><circle cx="568" cy="14" r="0.9" /><circle cx="598" cy="31" r="1.1" /><circle cx="625" cy="18" r="0.6" /><circle cx="654" cy="35" r="1.2" /><circle cx="680" cy="23" r="0.8" /><circle cx="708" cy="41" r="1.0" /><circle cx="737" cy="15" r="0.7" /><circle cx="763" cy="29" r="1.3" /><circle cx="792" cy="19" r="0.8" /><circle cx="819" cy="36" r="1.1" /><circle cx="845" cy="13" r="0.6" /><circle cx="872" cy="28" r="1.2" /><circle cx="902" cy="17" r="0.9" /><circle cx="928" cy="34" r="1.4" /><circle cx="957" cy="21" r="0.7" /><circle cx="983" cy="39" r="1.0" /></g></svg>'),
            backgroundRepeat: "repeat",
            opacity: 0.8,
            transform: "translateY(1vh)"
          }}></div>
          
          {/* Shadow casting on the ring for realism */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.5) 100%)"
          }}></div>
        </div>
        
        {/* Second ring - slightly offset angle for 3D effect */}
        <div className="absolute overflow-hidden" style={{
          width: "260%",
          height: "3.5vh",
          top: "49%",
          left: "-80%",
          transformStyle: "preserve-3d",
          transform: "translateY(-50%) rotateX(73deg) rotateZ(-8deg)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 15px rgba(255,255,255,0.25)",
          opacity: 0.85,
          background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(120,120,140,0.1) 10%, rgba(180,180,200,0.35) 30%, rgba(210,210,230,0.6) 50%, rgba(180,180,200,0.35) 70%, rgba(120,120,140,0.1) 90%, rgba(0,0,0,0) 100%)"
        }}>
          {/* Inside second ring - slightly different particle pattern */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="40" viewBox="0 0 1000 40"><g fill="rgba(230,230,240,0.85)"><circle cx="15" cy="12" r="0.7" /><circle cx="38" cy="25" r="1.0" /><circle cx="63" cy="8" r="0.8" /><circle cx="86" cy="21" r="1.2" /><circle cx="112" cy="14" r="0.6" /><circle cx="135" cy="28" r="0.9" /><circle cx="158" cy="11" r="1.1" /><circle cx="184" cy="24" r="0.7" /><circle cx="207" cy="17" r="1.0" /><circle cx="233" cy="30" r="0.6" /><circle cx="256" cy="13" r="0.8" /><circle cx="279" cy="27" r="1.1" /><circle cx="302" cy="9" r="0.7" /><circle cx="328" cy="22" r="1.0" /><circle cx="354" cy="15" r="0.6" /><circle cx="377" cy="29" r="0.9" /><circle cx="403" cy="12" r="1.1" /><circle cx="428" cy="25" r="0.7" /><circle cx="451" cy="8" r="1.0" /><circle cx="476" cy="21" r="0.6" /><circle cx="502" cy="14" r="0.8" /><circle cx="525" cy="28" r="1.1" /><circle cx="548" cy="11" r="0.7" /><circle cx="574" cy="24" r="1.0" /><circle cx="600" cy="17" r="0.6" /><circle cx="623" cy="31" r="0.9" /><circle cx="646" cy="14" r="1.1" /><circle cx="672" cy="27" r="0.7" /><circle cx="698" cy="10" r="1.0" /><circle cx="722" cy="23" r="0.6" /><circle cx="745" cy="17" r="0.8" /><circle cx="771" cy="30" r="1.1" /><circle cx="794" cy="12" r="0.7" /><circle cx="820" cy="26" r="1.0" /><circle cx="843" cy="19" r="0.6" /><circle cx="866" cy="33" r="0.9" /><circle cx="892" cy="16" r="1.1" /><circle cx="915" cy="29" r="0.7" /><circle cx="941" cy="12" r="1.0" /><circle cx="964" cy="25" r="0.6" /><circle cx="987" cy="18" r="0.8" /></g></svg>'),
            backgroundRepeat: "repeat",
            mixBlendMode: "screen"
          }}></div>
          
          {/* Subtle shadow effect */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0.4) 100%)"
          }}></div>
        </div>
        
        {/* Third ring - inner dense region with higher contrast */}
        <div className="absolute overflow-hidden" style={{
          width: "180%",
          height: "2.8vh",
          top: "50.5%",
          left: "-40%",
          transformStyle: "preserve-3d",
          transform: "translateY(-50%) rotateX(77deg) rotateZ(15deg)",
          borderRadius: "50%",
          boxShadow: "inset 0 0 12px rgba(255,255,255,0.3)",
          opacity: 0.9,
          background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(140,140,160,0.15) 15%, rgba(200,200,220,0.45) 35%, rgba(240,240,250,0.7) 50%, rgba(200,200,220,0.45) 65%, rgba(140,140,160,0.15) 85%, rgba(0,0,0,0) 100%)"
        }}>
          {/* Inside third ring - dense particle cluster */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="30" viewBox="0 0 800 30"><g fill="rgba(250,250,255,0.9)"><circle cx="12" cy="8" r="0.9" /><circle cx="25" cy="18" r="0.6" /><circle cx="38" cy="11" r="1.1" /><circle cx="52" cy="22" r="0.7" /><circle cx="65" cy="14" r="0.8" /><circle cx="78" cy="25" r="1.0" /><circle cx="92" cy="9" r="0.6" /><circle cx="105" cy="19" r="1.2" /><circle cx="118" cy="12" r="0.7" /><circle cx="132" cy="23" r="0.9" /><circle cx="145" cy="16" r="1.1" /><circle cx="158" cy="26" r="0.6" /><circle cx="172" cy="11" r="0.8" /><circle cx="185" cy="21" r="1.0" /><circle cx="198" cy="14" r="0.7" /><circle cx="212" cy="24" r="1.1" /><circle cx="225" cy="9" r="0.6" /><circle cx="238" cy="20" r="0.9" /><circle cx="252" cy="13" r="1.2" /><circle cx="265" cy="23" r="0.7" /><circle cx="278" cy="16" r="0.8" /><circle cx="292" cy="26" r="1.0" /><circle cx="305" cy="10" r="0.6" /><circle cx="318" cy="21" r="1.1" /><circle cx="332" cy="14" r="0.7" /><circle cx="345" cy="24" r="0.9" /><circle cx="358" cy="17" r="1.2" /><circle cx="372" cy="27" r="0.6" /><circle cx="385" cy="12" r="0.8" /><circle cx="398" cy="22" r="1.0" /><circle cx="412" cy="15" r="0.7" /><circle cx="425" cy="25" r="1.1" /><circle cx="438" cy="8" r="0.6" /><circle cx="452" cy="19" r="0.9" /><circle cx="465" cy="12" r="1.2" /><circle cx="478" cy="22" r="0.7" /><circle cx="492" cy="15" r="0.8" /><circle cx="505" cy="26" r="1.0" /><circle cx="518" cy="9" r="0.6" /><circle cx="532" cy="20" r="1.1" /><circle cx="545" cy="13" r="0.7" /><circle cx="558" cy="23" r="0.9" /><circle cx="572" cy="16" r="1.2" /><circle cx="585" cy="27" r="0.6" /><circle cx="598" cy="10" r="0.8" /><circle cx="612" cy="21" r="1.0" /><circle cx="625" cy="14" r="0.7" /><circle cx="638" cy="24" r="1.1" /><circle cx="652" cy="17" r="0.6" /><circle cx="665" cy="28" r="0.9" /><circle cx="678" cy="11" r="1.2" /><circle cx="692" cy="22" r="0.7" /><circle cx="705" cy="15" r="0.8" /><circle cx="718" cy="25" r="1.0" /><circle cx="732" cy="8" r="0.6" /><circle cx="745" cy="19" r="1.1" /><circle cx="758" cy="12" r="0.7" /><circle cx="772" cy="22" r="0.9" /><circle cx="785" cy="15" r="1.2" /></g></svg>'),
            backgroundRepeat: "repeat",
            mixBlendMode: "screen"
          }}></div>
        </div>
        
        {/* Fourth tenuous outer ring with subtle particles */}
        <div className="absolute overflow-hidden" style={{
          width: "360%",
          height: "1.8vh",
          top: "50.2%",
          left: "-130%",
          transformStyle: "preserve-3d",
          transform: "translateY(-50%) rotateX(74deg) rotateZ(-3deg)",
          borderRadius: "50%",
          opacity: 0.5,
          background: "linear-gradient(90deg, transparent 0%, rgba(100,100,120,0.03) 20%, rgba(140,140,160,0.08) 40%, rgba(180,180,200,0.12) 50%, rgba(140,140,160,0.08) 60%, rgba(100,100,120,0.03) 80%, transparent 100%)"
        }}>
          {/* Sparse particles in outer ring */}
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="20" viewBox="0 0 1400 20"><g fill="rgba(220,220,230,0.5)"><circle cx="28" cy="10" r="0.5" /><circle cx="76" cy="7" r="0.4" /><circle cx="124" cy="12" r="0.6" /><circle cx="172" cy="8" r="0.3" /><circle cx="220" cy="11" r="0.5" /><circle cx="268" cy="14" r="0.4" /><circle cx="316" cy="6" r="0.6" /><circle cx="364" cy="9" r="0.3" /><circle cx="412" cy="13" r="0.5" /><circle cx="460" cy="7" r="0.4" /><circle cx="508" cy="10" r="0.6" /><circle cx="556" cy="14" r="0.3" /><circle cx="604" cy="8" r="0.5" /><circle cx="652" cy="11" r="0.4" /><circle cx="700" cy="6" r="0.6" /><circle cx="748" cy="9" r="0.3" /><circle cx="796" cy="13" r="0.5" /><circle cx="844" cy="10" r="0.4" /><circle cx="892" cy="7" r="0.6" /><circle cx="940" cy="12" r="0.3" /><circle cx="988" cy="8" r="0.5" /><circle cx="1036" cy="11" r="0.4" /><circle cx="1084" cy="14" r="0.6" /><circle cx="1132" cy="6" r="0.3" /><circle cx="1180" cy="9" r="0.5" /><circle cx="1228" cy="13" r="0.4" /><circle cx="1276" cy="7" r="0.6" /><circle cx="1324" cy="10" r="0.3" /><circle cx="1372" cy="14" r="0.5" /></g></svg>'),
            backgroundRepeat: "repeat"
          }}></div>
        </div>
        
        {/* Dust cloud and faint particles extending beyond main rings */}
        <div className="absolute" style={{
          width: "400%",
          height: "12vh",
          top: "50%",
          left: "-150%",
          background: `radial-gradient(ellipse at center, transparent 30%, rgba(200,200,220,0.01) 40%, rgba(200,200,220,0.03) 60%, rgba(200,200,220,0.01) 80%, transparent 100%),
                      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="2000" height="120" viewBox="0 0 2000 120"><g fill="rgba(200,200,220,0.15)"><circle cx="35" cy="45" r="0.3" /><circle cx="103" cy="62" r="0.2" /><circle cx="168" cy="39" r="0.25" /><circle cx="236" cy="81" r="0.15" /><circle cx="304" cy="27" r="0.3" /><circle cx="371" cy="93" r="0.2" /><circle cx="439" cy="52" r="0.25" /><circle cx="505" cy="37" r="0.15" /><circle cx="573" cy="74" r="0.3" /><circle cx="641" cy="28" r="0.2" /><circle cx="707" cy="91" r="0.25" /><circle cx="775" cy="48" r="0.15" /><circle cx="843" cy="33" r="0.3" /><circle cx="910" cy="76" r="0.2" /><circle cx="978" cy="29" r="0.25" /><circle cx="1046" cy="87" r="0.15" /><circle cx="1111" cy="41" r="0.3" /><circle cx="1179" cy="23" r="0.2" /><circle cx="1247" cy="68" r="0.25" /><circle cx="1314" cy="35" r="0.15" /><circle cx="1382" cy="82" r="0.3" /><circle cx="1450" cy="44" r="0.2" /><circle cx="1516" cy="25" r="0.25" /><circle cx="1584" cy="71" r="0.15" /><circle cx="1652" cy="39" r="0.3" /><circle cx="1718" cy="88" r="0.2" /><circle cx="1786" cy="47" r="0.25" /><circle cx="1854" cy="19" r="0.15" /><circle cx="1922" cy="63" r="0.3" /><circle cx="1988" cy="31" r="0.2" /></g></svg>')`,
          transformStyle: "preserve-3d",
          transform: "translateY(-50%) rotateX(75deg)",
          borderRadius: "50%",
          opacity: 0.6
        }}></div>
        
        {/* Distinct larger rocks and debris scattered throughout the ring system */}
        <div className="absolute rounded-full bg-gray-200" style={{ width: "2.2%", height: "2.2%", top: "49.3%", left: "37%", opacity: 0.85, boxShadow: "0 0 5px rgba(0,0,0,0.5)" }}></div>
        <div className="absolute rounded-full bg-gray-300" style={{ width: "3.5%", height: "3.5%", top: "48.2%", left: "-38%", opacity: 0.9, boxShadow: "0 0 8px rgba(0,0,0,0.6)" }}></div>
        <div className="absolute rounded-full bg-gray-200" style={{ width: "1.7%", height: "1.7%", top: "50.7%", left: "72%", opacity: 0.8, boxShadow: "0 0 4px rgba(0,0,0,0.4)" }}></div>
        <div className="absolute rounded-full bg-gray-300" style={{ width: "2.8%", height: "2.8%", top: "49.5%", left: "-79%", opacity: 0.85, boxShadow: "0 0 6px rgba(0,0,0,0.5)" }}></div>
        
        {/* Irregular shaped debris chunks - using clip-path for irregular shapes */}
        <div className="absolute bg-gray-200" style={{ 
          width: "3.2%", height: "2.5%", top: "49.2%", left: "58%", opacity: 0.8,
          clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          boxShadow: "0 0 7px rgba(0,0,0,0.5)"
        }}></div>
        <div className="absolute bg-gray-100" style={{ 
          width: "2.6%", height: "2.1%", top: "51.1%", left: "-92%", opacity: 0.75,
          clipPath: "polygon(50% 0%, 80% 30%, 100% 50%, 80% 80%, 50% 100%, 20% 80%, 0% 50%, 20% 20%)",
          boxShadow: "0 0 5px rgba(0,0,0,0.4)"
        }}></div>
        
        {/* Shadow cast by planet onto the rings */}
        <div className="absolute" style={{
          width: "120%",
          height: "10vh",
          top: "45%", 
          left: "-10%",
          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 30%, transparent 70%)",
          transform: "translateY(-50%) rotateX(75deg) rotateZ(15deg)",
          borderRadius: "50%",
          opacity: 0.8,
          pointerEvents: "none"
        }}></div>
        
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
