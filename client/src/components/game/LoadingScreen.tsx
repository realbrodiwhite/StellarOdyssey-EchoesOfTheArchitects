import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LoadingScreenProps {
  message?: string;
  onComplete: () => void;
  duration?: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Initializing systems...", 
  onComplete,
  duration = 3000
}) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState(message);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  // Loading messages
  useEffect(() => {
    const messages = [
      "Initializing systems...",
      "Establishing ship connection...",
      "Loading navigation data...",
      "Calibrating sensors...",
      "Activating ship AI...",
      "Preparing mission briefing...",
    ];

    const messageInterval = setInterval(() => {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setLoadingText(randomMessage);
    }, 800);

    return () => clearInterval(messageInterval);
  }, []);

  // Complete loading when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background stars */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
              animationDuration: `${Math.random() * 50 + 20}s`,
              animationDelay: `${-Math.random() * 50}s`
            }}
          />
        ))}
      </div>

      {/* Ship logo or icon */}
      <motion.div
        className="w-24 h-24 bg-blue-900/30 rounded-full flex items-center justify-center mb-8 border-2 border-blue-500"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        <span className="text-blue-400 text-5xl">✧</span>
      </motion.div>

      <h2 className="text-2xl font-bold text-white mb-2">STELLAR ODYSSEY</h2>
      <p className="text-blue-400 mb-6 tracking-widest">INITIALIZING</p>

      {/* Loading bar */}
      <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeInOut" }}
        />
      </div>

      {/* Loading text */}
      <motion.p 
        className="text-gray-400 text-sm"
        key={loadingText}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {loadingText}
      </motion.p>

      {/* Progress percentage */}
      <p className="text-gray-500 text-xs mt-2">
        {Math.floor(progress)}%
      </p>
    </motion.div>
  );
};

export default LoadingScreen;