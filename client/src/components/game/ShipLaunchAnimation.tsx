import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/lib/stores/useAudio';

interface ShipLaunchAnimationProps {
  onComplete: () => void;
}

const ShipLaunchAnimation = ({ onComplete }: ShipLaunchAnimationProps) => {
  const [phase, setPhase] = useState<'idle' | 'accelerating' | 'finished'>('idle');
  
  // Start the animation sequence when component mounts
  useEffect(() => {
    // Start with brief pause, then begin acceleration
    const startTimer = setTimeout(() => {
      setPhase('accelerating');
      
      // After the ship flies off, call the onComplete function
      const completeTimer = setTimeout(() => {
        setPhase('finished');
        onComplete();
      }, 2000); // Ship completes animation in 2 seconds
      
      return () => clearTimeout(completeTimer);
    }, 500);
    
    return () => clearTimeout(startTimer);
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {Array.from({ length: 100 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: `${Math.random() * 2 + 1}s`,
              animationDelay: `${Math.random()}s`,
            }}
          />
        ))}
      </div>
      
      {/* Ship animation */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        initial={{ x: -50, y: 0, scale: 1 }}
        animate={
          phase === 'accelerating' 
            ? { 
                x: [0, window.innerWidth], 
                scale: [1, 0.5],
                transition: { 
                  duration: 2,
                  ease: "easeIn" 
                } 
              } 
            : {}
        }
      >
        {/* Simple ship silhouette */}
        <div className="relative w-40 h-20 transform -translate-x-1/2 -translate-y-1/2">
          <div className="absolute w-40 h-12 bg-gray-700 rounded-lg" />
          <div className="absolute left-0 top-2 w-12 h-8 bg-gray-800 rounded-md" />
          <div className="absolute right-0 w-8 h-20 bg-gray-600" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
          <div className="absolute right-8 bottom-0 w-24 h-2 bg-blue-500 rounded-full animate-pulse" />
          
          {/* Engine exhaust effect */}
          {phase === 'accelerating' && (
            <motion.div 
              className="absolute right-0 top-1/2 transform -translate-y-1/2"
              initial={{ width: 10, opacity: 0.5 }}
              animate={{ 
                width: [10, 100], 
                opacity: [0.5, 0.8, 0.3],
                x: [0, -80]
              }}
              transition={{ 
                duration: 2, 
                ease: "easeOut",
                repeat: 0
              }}
              style={{
                height: 8,
                background: 'linear-gradient(to left, #3498db, rgba(52, 152, 219, 0))',
                borderRadius: '4px'
              }}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ShipLaunchAnimation;