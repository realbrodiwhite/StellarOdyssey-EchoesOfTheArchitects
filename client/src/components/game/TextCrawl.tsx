import { useEffect, useState } from 'react';

interface PanDownProps {
  title: string;
  onComplete: () => void;
  skipEnabled?: boolean;
}

const PanDown = ({ title, onComplete, skipEnabled = true }: PanDownProps) => {
  const [isActive, setIsActive] = useState(true);
  
  useEffect(() => {
    // Set timeout to match the total animation duration
    // Our animations take about 5 seconds total
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
};

export default PanDown;