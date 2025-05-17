import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCharacter } from '@/lib/stores/useCharacter';
import { useGame } from '@/lib/stores/useGame';
import { formatDistanceToNow } from 'date-fns';

interface SaveLoadMenuProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
}

// Define save slot data structure
export interface SaveData {
  id: number;
  characterName: string;
  characterClass: string;
  level: number;
  location: string;
  timestamp: number;
  isAutoSave?: boolean;
}

const SAVE_SLOTS = 10;

const SaveLoadMenu: React.FC<SaveLoadMenuProps> = ({ isOpen, onClose, mode }) => {
  const [saveSlots, setSaveSlots] = useState<(SaveData | null)[]>(Array(SAVE_SLOTS).fill(null));
  const [autoSave, setAutoSave] = useState<SaveData | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const { character } = useCharacter();
  const { start } = useGame();
  
  // Load saved games from localStorage
  useEffect(() => {
    if (isOpen) {
      // Load save slots
      const loadedSlots = Array(SAVE_SLOTS).fill(null);
      
      for (let i = 0; i < SAVE_SLOTS; i++) {
        const savedData = localStorage.getItem(`game_save_${i}`);
        if (savedData) {
          try {
            loadedSlots[i] = JSON.parse(savedData);
          } catch (error) {
            console.error(`Error parsing save slot ${i}:`, error);
          }
        }
      }
      
      // Load auto save if exists
      const autoSaveData = localStorage.getItem('game_auto_save');
      if (autoSaveData) {
        try {
          setAutoSave(JSON.parse(autoSaveData));
        } catch (error) {
          console.error('Error parsing auto save:', error);
        }
      }
      
      setSaveSlots(loadedSlots);
    }
  }, [isOpen]);
  
  // Handle save game
  const handleSaveGame = (slotIndex: number) => {
    if (!character || !character.id) {
      alert('No active character to save!');
      return;
    }
    
    const saveData: SaveData = {
      id: slotIndex,
      characterName: character.name,
      characterClass: character.class,
      level: character.level,
      location: 'Current Location', // This would come from your location system
      timestamp: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem(`game_save_${slotIndex}`, JSON.stringify(saveData));
    
    // Update state
    const newSaveSlots = [...saveSlots];
    newSaveSlots[slotIndex] = saveData;
    setSaveSlots(newSaveSlots);
    
    alert('Game saved successfully!');
  };
  
  // Handle load game
  const handleLoadGame = (saveData: SaveData) => {
    if (!saveData) return;
    
    // Here you would load the game state from localStorage
    // For now, we'll just start the game
    start();
    onClose();
    alert(`Loading game: ${saveData.characterName}, Level ${saveData.level}`);
  };
  
  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch (error) {
      return 'Unknown time';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-3xl p-4 text-white"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{mode === 'save' ? 'Save Game' : 'Load Game'}</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        
        {/* Auto save slot */}
        {mode === 'load' && autoSave && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-blue-400">Auto Save</h3>
            <div 
              className={`border border-blue-700 rounded-md p-3 bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer`}
              onClick={() => handleLoadGame(autoSave)}
            >
              <div className="flex justify-between">
                <div>
                  <span className="font-medium text-xl">{autoSave.characterName}</span>
                  <span className="ml-2 text-gray-400">({autoSave.characterClass})</span>
                </div>
                <span className="text-sm text-gray-400">Level {autoSave.level}</span>
              </div>
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-gray-400">{autoSave.location}</span>
                <span className="text-gray-500">{formatTimeAgo(autoSave.timestamp)}</span>
              </div>
              <div className="mt-1">
                <span className="text-xs px-2 py-0.5 bg-blue-900 text-blue-300 rounded-full">Auto Save</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Manual save slots */}
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {saveSlots.map((save, index) => (
            <div 
              key={index}
              className={`border ${selectedSlot === index ? 'border-blue-500' : 'border-gray-700'} rounded-md p-3 ${save ? 'bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer' : 'bg-gray-800 bg-opacity-40'}`}
              onClick={() => {
                if (mode === 'load' && save) {
                  handleLoadGame(save);
                } else if (mode === 'save') {
                  setSelectedSlot(index);
                }
              }}
            >
              {save ? (
                <>
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium text-lg">{save.characterName}</span>
                      <span className="ml-2 text-gray-400">({save.characterClass})</span>
                    </div>
                    <span className="text-sm text-gray-400">Level {save.level}</span>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-400">{save.location}</span>
                    <span className="text-gray-500">{formatTimeAgo(save.timestamp)}</span>
                  </div>
                </>
              ) : (
                <div className="py-2 text-center text-gray-500">
                  {mode === 'save' ? 'Empty Save Slot' : 'No Save Data'}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end mt-6 space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
          
          {mode === 'save' && selectedSlot !== null && (
            <button 
              onClick={() => handleSaveGame(selectedSlot)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
            >
              Save Game
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SaveLoadMenu;