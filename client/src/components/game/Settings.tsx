import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAudio } from '@/lib/stores/useAudio';
import { useGame } from '@/lib/stores/useGame';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { 
    isMuted, 
    toggleMute, 
    musicVolume, 
    setMusicVolume, 
    effectsVolume, 
    setEffectsVolume 
  } = useAudio();
  
  const { 
    controlsOpacity, 
    setControlsOpacity,
    mobileControlType,
    setMobileControlType
  } = useGame();
  
  // Local state for volume sliders
  const [musicVol, setMusicVol] = useState(musicVolume * 100);
  const [effectsVol, setEffectsVol] = useState(effectsVolume * 100);
  const [uiOpacity, setUiOpacity] = useState(controlsOpacity * 100);
  
  // Apply settings changes
  const applyChanges = () => {
    setMusicVolume(musicVol / 100);
    setEffectsVolume(effectsVol / 100);
    setControlsOpacity(uiOpacity / 100);
    
    // Save settings to localStorage
    localStorage.setItem('game_settings', JSON.stringify({
      musicVolume: musicVol / 100,
      effectsVolume: effectsVol / 100,
      controlsOpacity: uiOpacity / 100,
      mobileControlType
    }));
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-xl p-6 text-white"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Game Settings</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Sound Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-400">Sound</h3>
            
            <div className="flex items-center justify-between">
              <label className="font-medium">Master Sound</label>
              <button
                onClick={toggleMute}
                className={`px-4 py-2 rounded ${isMuted ? 'bg-gray-700' : 'bg-blue-600'}`}
              >
                {isMuted ? 'Off' : 'On'}
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">Music Volume</label>
                <span>{Math.round(musicVol)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVol}
                onChange={(e) => setMusicVol(Number(e.target.value))}
                disabled={isMuted}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">Effects Volume</label>
                <span>{Math.round(effectsVol)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effectsVol}
                onChange={(e) => setEffectsVol(Number(e.target.value))}
                disabled={isMuted}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Display Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-green-400">Display</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-medium">UI Opacity</label>
                <span>{Math.round(uiOpacity)}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={uiOpacity}
                onChange={(e) => setUiOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Controls Settings */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-purple-400">Controls</h3>
            
            <div className="flex items-center justify-between">
              <label className="font-medium">Mobile Control Type</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setMobileControlType('joystick')}
                  className={`px-4 py-2 rounded ${mobileControlType === 'joystick' ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  Joystick
                </button>
                <button
                  onClick={() => setMobileControlType('swipe')}
                  className={`px-4 py-2 rounded ${mobileControlType === 'swipe' ? 'bg-purple-600' : 'bg-gray-700'}`}
                >
                  Swipe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end mt-8 space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
          <button 
            onClick={applyChanges}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded"
          >
            Apply Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;