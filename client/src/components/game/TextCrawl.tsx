import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';

interface TextCrawlProps {
  title: string;
  text: string[];
  onComplete: () => void;
}

const TextCrawl: React.FC<TextCrawlProps> = ({ title, text, onComplete }) => {
  const [showSkip, setShowSkip] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  
  // Show skip button after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSkip(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show continue button after the crawl finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 35000); // Adjust based on the duration of your text crawl
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black">
      <AnimatePresence>
        {/* Star background */}
        <motion.div
          className="absolute inset-0 bg-black z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.8 + 0.2,
                animation: `twinkle ${Math.random() * 3 + 2}s infinite`
              }}
            />
          ))}
        </motion.div>
        
        {/* Title */}
        <motion.h1
          className="absolute text-[#FFD700] text-4xl md:text-5xl font-bold text-center mb-20 z-10"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 2 }}
        >
          {title}
        </motion.h1>
        
        {/* Text crawl */}
        <motion.div
          className="absolute w-full max-w-2xl text-center z-10 perspective-800"
          initial={{ opacity: 0, rotateX: 30, y: '100vh' }}
          animate={{ opacity: 1, y: '-100vh' }}
          transition={{ delay: 3, duration: 30, ease: "linear" }}
        >
          <div className="text-[#00BFFF] font-semibold text-xl md:text-2xl leading-relaxed space-y-12">
            {text.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </motion.div>
        
        {/* Skip button */}
        {showSkip && (
          <motion.div
            className="absolute bottom-10 right-10 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button onClick={onComplete} variant="outline" className="text-white">
              Skip
            </Button>
          </motion.div>
        )}
        
        {/* Continue button */}
        {showContinue && (
          <motion.div
            className="absolute bottom-10 left-0 right-0 mx-auto w-40 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Button onClick={onComplete} className="w-full">
              Begin Journey
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        @keyframes twinkle {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        
        .perspective-800 {
          perspective: 800px;
          transform-style: preserve-3d;
        }
      `}</style>
    </div>
  );
};

export default TextCrawl;