import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import { Achievement } from '@/lib/data/achievements';

interface AchievementUnlockProps {
  achievement: Achievement;
  onClose: () => void;
}

const AchievementUnlock: React.FC<AchievementUnlockProps> = ({ achievement, onClose }) => {
  const [autoClose, setAutoClose] = useState(true);
  
  // Auto-close after 5 seconds if autoClose is true
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto"
        onMouseEnter={() => setAutoClose(false)}
        onMouseLeave={() => setAutoClose(true)}
      >
        <div className="flex items-center bg-gradient-to-r from-indigo-900 to-blue-900 rounded-lg p-4 shadow-xl border border-blue-500 max-w-md">
          <div className="bg-blue-700 rounded-full p-2 mr-4">
            <Award size={28} className="text-yellow-300" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-yellow-300">Achievement Unlocked!</h3>
            <div className="text-white font-medium mt-1">{achievement.name}</div>
            <div className="text-blue-200 mt-1 text-sm">{achievement.description}</div>
            {achievement.reward && (
              <div className="text-green-300 mt-2 text-sm">
                <span className="font-semibold">Reward:</span> {achievement.reward}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-2 text-gray-300 hover:text-white"
          >
            ×
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AchievementUnlock;