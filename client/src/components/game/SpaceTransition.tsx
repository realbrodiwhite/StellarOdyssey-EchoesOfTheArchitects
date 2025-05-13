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
    // Set timeout to match the total animation duration
    const animationTimer = setTimeout(() => {
      setIsActive(false);
      onComplete();
    }, 6000);
    
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
        {/* Stars background with CSS-generated stars */}
        <div className="stars-background"></div>
        
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
      {/* Stars background with CSS-generated stars */}
      <div className="stars-background"></div>
      
      {/* For transition to character selection, do a different animation */}
      <div className="warp-scene">
        <div className="warp-effect"></div>
        <div className="warp-ship"></div>
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