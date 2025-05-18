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
  
  // Auto-advance through slides
  useEffect(() => {
    if (currentSlide >= text.length) {
      // When we reach the end of slides, complete the intro
      onComplete();
      return;
    }
    
    const timer = setTimeout(() => {
      setCurrentSlide(prev => prev + 1);
    }, 8000); // 8 seconds per slide
    
    return () => clearTimeout(timer);
  }, [currentSlide, text.length, onComplete]);
  
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      {/* Star background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-container"></div>
      </div>
      
      {/* Title */}
      <motion.h1
        className="absolute top-16 text-[#FFD700] text-4xl md:text-5xl font-bold text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {title}
      </motion.h1>
      
      {/* Content slides with fade transitions */}
      <div className="w-full max-w-4xl mx-auto px-6 flex items-center justify-center h-full relative z-10">
        {currentSlide < text.length && (
          <motion.div
            key={`slide-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="text-center"
          >
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl text-blue-300 max-w-2xl mx-auto leading-relaxed"
            >
              {text[currentSlide]}
            </motion.p>
          </motion.div>
        )}
      </div>
      
      {/* Progress indicator */}
      <div className="absolute bottom-8 left-8 flex space-x-3 z-10">
        {text.map((_, index) => (
          <div 
            key={`indicator-${index}`} 
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentSlide 
                ? 'bg-blue-400 w-5' 
                : index < currentSlide 
                  ? 'bg-blue-700' 
                  : 'bg-gray-700'
            }`}
          ></div>
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
            className="px-5 py-2.5 bg-blue-900 bg-opacity-80 rounded-lg cursor-pointer hover:bg-blue-800 transition-all duration-200 shadow-lg border border-blue-700"
          >
            Skip Intro
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default TextCrawl;