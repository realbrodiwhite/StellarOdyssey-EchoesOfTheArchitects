import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

interface TextCrawlProps {
  title: string;
  text: string[];
  onComplete: () => void;
}

const TextCrawl: React.FC<TextCrawlProps> = ({ title, text, onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showSkip, setShowSkip] = useState(false);
  
  // Show skip button after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Auto-advance through slides with better timing
  useEffect(() => {
    if (currentSlide >= text.length) {
      // When we reach the end of slides, complete the intro with a short delay
      // for better transition experience
      const finalTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(finalTimer);
    }
    
    const timer = setTimeout(() => {
      setCurrentSlide(prev => prev + 1);
    }, 10000); // 10 seconds per slide for better readability
    
    return () => clearTimeout(timer);
  }, [currentSlide, text.length, onComplete]);
  
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      {/* Enhanced star background */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden">
        <div className="stars-container"></div>
        
        {/* Add a few shooting stars for visual interest */}
        <div className="absolute w-8 h-0.5 bg-blue-200 opacity-0 animate-meteor" 
             style={{ 
               top: '15%', 
               left: '10%', 
               animationDelay: '3s',
               transform: 'rotate(135deg)',
               boxShadow: '0 0 15px 5px rgba(135, 206, 250, 0.4)'
             }}>
        </div>
        <div className="absolute w-12 h-0.5 bg-blue-100 opacity-0 animate-meteor" 
             style={{ 
               top: '45%', 
               left: '80%', 
               animationDelay: '7s',
               transform: 'rotate(315deg)',
               boxShadow: '0 0 15px 5px rgba(135, 206, 250, 0.4)'
             }}>
        </div>
        
        {/* Add subtle nebula effect */}
        <div className="absolute w-full h-full opacity-10 bg-gradient-to-tr from-indigo-900 via-transparent to-purple-900"></div>
      </div>
      
      {/* Title with better styling */}
      <motion.h1
        className="absolute top-8 sm:top-12 md:top-16 w-full px-4 text-[#FFD700] text-3xl sm:text-4xl md:text-5xl font-bold text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {title}
      </motion.h1>
      
      {/* Content slides with improved fade transitions */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-center h-full relative z-10">
        <AnimatePresence mode="wait">
          {currentSlide < text.length && (
            <motion.div
              key={`slide-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="text-center max-w-full"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="text-blue-300 mx-auto px-4 sm:px-8 md:px-12"
              >
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed md:leading-loose max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">
                  {text[currentSlide]}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Improved progress indicator */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-4 z-10">
        {text.map((_, index) => (
          <motion.div 
            key={`indicator-${index}`}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0.6,
              scale: index === currentSlide ? 1 : 0.8,
              backgroundColor: index <= currentSlide ? '#4299e1' : '#2d3748'
            }}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-500`}
          ></motion.div>
        ))}
      </div>
      
      {/* Skip button */}
      {showSkip && (
        <motion.div
          className="absolute bottom-8 right-8 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            onClick={onComplete} 
            variant="outline" 
            className="px-4 py-2 bg-blue-900 bg-opacity-70 text-sm sm:text-base rounded-lg cursor-pointer hover:bg-blue-800 hover:bg-opacity-90 transition-all duration-200 shadow-lg border border-blue-700"
          >
            Skip
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default TextCrawl;