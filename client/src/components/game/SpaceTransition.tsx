import { useEffect, useState } from 'react';

interface SpaceTransitionProps {
  type: 'intro' | 'selection';
  title?: string;
  onComplete: () => void;
  skipEnabled?: boolean;
}

const SpaceTransition = ({ type, title = "Cosmic Odyssey", onComplete, skipEnabled = true }: SpaceTransitionProps) => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // Set timeout to match the total animation duration for a smooth transition
    const animationTimer = setTimeout(() => {
      setIsActive(false);
      onComplete();
    }, 17500); // 17.5 seconds for the enhanced flight path with more realistic spaceship entry/exit
    
    return () => clearTimeout(animationTimer);
  }, [onComplete]);
  
  const handleSkip = () => {
    if (skipEnabled) {
      setIsActive(false);
      onComplete();
    }
  };
  
  if (!isActive) return null;
  
  // For intro animation (initial title screen)
  if (type === 'intro') {
    return (
      <div className="space-scene-container" onClick={handleSkip}>
        {/* Multi-layered stars background with CSS-generated stars */}
        <div className="stars-background"></div>
        <div className="stars-layer-distant"></div>
        
        {/* Planet scene that pans down */}
        <div className="planet-scene">
          <div className="planet-gradient"></div>
          
          {/* Planet */}
          <div className="planet"></div>
          
          {/* Orbital ring */}
          <div className="orbit"></div>
        </div>
        
        {/* Spaceship that flies across */}
        <div className="spaceship"></div>
        
        {/* Title overlay that fades in */}
        <div className="title-overlay">
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
  
  // For character selection transition
  return (
    <div className="space-scene-container" onClick={handleSkip}>
      {/* Multi-layered stars background with CSS-generated stars */}
      <div className="stars-background"></div>
      <div className="stars-layer-distant"></div>
      
      {/* For transition to character selection, do a different animation */}
      <div className="warp-scene">
        {/* Dynamic stars background with animated motion - responsive */}
        <div className="animated-stars">
          {Array.from({ length: Math.min(150, Math.max(50, Math.floor(window.innerWidth / 10))) }).map((_, i) => (
            <div 
              key={i}
              className="animated-star"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.min(3, Math.max(1, window.innerWidth / 640))}px`,
                height: `${Math.min(3, Math.max(1, window.innerWidth / 640))}px`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${Math.random() * 7 + 8}s`
              }}
            />
          ))}
        </div>
        
        <div className="warp-effect"></div>
        
        <div className="svg-ship-container">
          <div className="engine-glow"></div>
          <div className="engine-glow-secondary"></div>
          <div className="engine-exhaust"></div>
          <div className="engine-exhaust-outer"></div>
          <div className="ship-shield-effect"></div>
          <img 
            src="/images/spaceship-fixed.svg" 
            alt="Spaceship" 
            className="svg-spaceship"
          />
        </div>
      </div>
      
      {skipEnabled && (
        <div className="skip-message">
          Click anywhere to skip
        </div>
      )}
    </div>
  );
};

export default SpaceTransition;