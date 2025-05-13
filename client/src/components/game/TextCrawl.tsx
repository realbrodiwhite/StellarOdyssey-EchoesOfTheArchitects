import { useEffect, useState } from 'react';

interface PanDownProps {
  title: string;
  onComplete: () => void;
  skipEnabled?: boolean;
}

const PanDown = ({ title, onComplete, skipEnabled = true }: PanDownProps) => {
  const [isActive, setIsActive] = useState(true);
  const [phase, setPhase] = useState<'stars' | 'transition' | 'complete'>('stars');
  
  useEffect(() => {
    // First display the stars for 2 seconds
    const starsTimer = setTimeout(() => {
      setPhase('transition');
      
      // Then do the pan down animation for 5 seconds
      const transitionTimer = setTimeout(() => {
        setPhase('complete');
        setIsActive(false);
        onComplete();
      }, 5000);
      
      return () => clearTimeout(transitionTimer);
    }, 2000);
    
    return () => clearTimeout(starsTimer);
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
      {/* Stars in space */}
      <div className="stars-layer">
        {[...Array(200)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>
      
      {/* Galaxy or planet that comes into view */}
      <div className={`space-scene ${phase === 'transition' ? 'animate-pan' : ''}`}>
        {/* Galaxy image */}
        <div className="galaxy">
          <h1 className="galaxy-title">{title}</h1>
        </div>
        
        {/* Spaceship that appears after the pan */}
        <div className={`spaceship ${phase === 'transition' ? 'animate-ship' : ''}`}></div>
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