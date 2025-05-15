import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/lib/stores/useAudio';

interface ShipLaunchAnimationProps {
  onComplete: () => void;
}

const SleepingPhase = ({ onWakeUp }: { onWakeUp: () => void }) => {
  useEffect(() => {
    // Wait a short moment before the alarms start
    const timer = setTimeout(() => {
      onWakeUp();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onWakeUp]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Dreaming dots animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-gray-600 text-2xl">
          // Z Z Z
        </div>
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-blue-400 opacity-50"
          animate={{ 
            scale: [1, 2, 1],
            x: [0, 10, 0],
            y: [0, -10, 0],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
          style={{ left: '48%', top: '48%' }}
        />
      </div>
    </div>
  );
};

const EmergencyWakeup = ({ onComplete }: { onComplete: () => void }) => {
  const { playAlarm } = useAudio();
  
  useEffect(() => {
    // Play alarm sound immediately
    playAlarm();
    
    // Simulate emergency for 3 seconds before completing
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [playAlarm, onComplete]);
  
  return (
    <motion.div 
      className="relative w-full h-full overflow-hidden"
      animate={{ 
        x: [-10, 10, -5, 5, -10, 10, 0],
        y: [5, -5, 10, -10, 5, -5, 0]
      }}
      transition={{ 
        duration: 0.5,
        repeat: 5,
        repeatType: "mirror"
      }}
    >
      {/* Emergency flashing red lights */}
      <motion.div 
        className="absolute inset-0 bg-red-600" 
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ 
          duration: 0.5,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
      
      {/* Ship interior - simple cabin with alarm visuals */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-4xl text-red-500 font-bold mb-8"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ 
            duration: 0.5,
            repeat: Infinity
          }}
        >
          EMERGENCY ALERT
        </motion.div>
        
        <div className="text-2xl text-white mb-6">
          Warp field breach detected!
        </div>
        
        <motion.div
          className="w-24 h-24 rounded-full border-4 border-red-500 flex items-center justify-center"
          animate={{ 
            borderWidth: ["4px", "2px", "6px", "4px"],
            scale: [1, 1.05, 0.95, 1]
          }}
          transition={{ 
            duration: 0.8,
            repeat: Infinity 
          }}
        >
          <motion.div
            className="w-16 h-16 bg-red-500 rounded-full"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </motion.div>
        
        <div className="mt-8 text-xl text-yellow-300">
          HOSTILE VESSELS DETECTED
        </div>
      </div>
      
      {/* Warning display panels flashing on sides */}
      <div className="absolute top-0 left-0 w-1/4 h-full border-r-2 border-yellow-500 bg-gray-900 bg-opacity-50 flex flex-col justify-center items-center">
        <motion.div 
          className="h-1/3 w-full bg-red-600"
          animate={{ opacity: [0.8, 0.3, 0.8] }}
          transition={{ 
            duration: 0.7, 
            repeat: Infinity,
            repeatType: "mirror",
            delay: 0.1
          }}
        />
      </div>
      
      <div className="absolute top-0 right-0 w-1/4 h-full border-l-2 border-yellow-500 bg-gray-900 bg-opacity-50 flex flex-col justify-center items-center">
        <motion.div 
          className="h-1/3 w-full bg-red-600"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ 
            duration: 0.7, 
            repeat: Infinity,
            repeatType: "mirror"
          }}
        />
      </div>
    </motion.div>
  );
};

const ShipLaunchAnimation = ({ onComplete }: ShipLaunchAnimationProps) => {
  const [phase, setPhase] = useState<'sleeping' | 'wakeup'>('sleeping');
  
  const handleWakeUp = () => {
    setPhase('wakeup');
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {phase === 'sleeping' && <SleepingPhase onWakeUp={handleWakeUp} />}
      {phase === 'wakeup' && <EmergencyWakeup onComplete={onComplete} />}
    </div>
  );
};

export default ShipLaunchAnimation;